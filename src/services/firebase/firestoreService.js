import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS, MESSAGE_TYPES } from '@utils/constants';

const getTimestampMillis = value => {
  if (!value) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (typeof value.seconds === 'number') {
    return value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1000000);
  }

  if (typeof value._seconds === 'number') {
    return value._seconds * 1000 + Math.floor((value._nanoseconds || 0) / 1000000);
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return 0;
};

const isFirestoreTimestamp = value => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    typeof value.toMillis === 'function' ||
    typeof value.toDate === 'function' ||
    typeof value.seconds === 'number' ||
    typeof value._seconds === 'number'
  );
};

const normalizeFirestoreValue = value => {
  if (isFirestoreTimestamp(value)) {
    return getTimestampMillis(value);
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeFirestoreValue);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((normalized, [key, nestedValue]) => {
      normalized[key] = normalizeFirestoreValue(nestedValue);
      return normalized;
    }, {});
  }

  return value;
};

const getDocumentData = doc => ({
  id: doc.id,
  ...normalizeFirestoreValue(doc.data() || {}),
});

const getFirestoreCursor = value => {
  if (typeof value === 'number') {
    return new Date(value);
  }

  return value;
};

const logListenerError = (listenerName, error) => {
  console.warn(`${listenerName} listener failed:`, error);
};

class FirestoreService {
  // ─── User Operations ───────────────────────────────────────────────

  async createUserDocument(uid, userData) {
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .set(userData);
  }

  async getUserDocument(uid) {
    const doc = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .get();
    
    if (doc.exists) {
      return getDocumentData(doc);
    }
    return null;
  }

  async updateUserDocument(uid, data) {
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
  }

  async updateUserPresence(uid, isOnline) {
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .update({
        isOnline,
        lastSeen: firestore.FieldValue.serverTimestamp(),
      });
  }

  async updateFCMToken(uid, token) {
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .update({ fcmToken: token });
  }

  // Search users by display name
  async searchUsers(searchQuery, currentUserId, limit = 20) {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.USERS)
      .where('displayName', '>=', searchQuery)
      .where('displayName', '<=', searchQuery + '\uf8ff')
      .limit(limit)
      .get();

    return querySnapshot.docs
      .map(getDocumentData)
      .filter(user => user.uid !== currentUserId);
  }

  // Listen to user document changes
  onUserChanged(uid, callback, onError) {
    return firestore()
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .onSnapshot(doc => {
        if (doc?.exists) {
          callback(getDocumentData(doc));
        }
      }, error => {
        logListenerError('User', error);
        onError?.(error);
      });
  }

  // ─── Chat Operations ────────────────────────────────────────────────

  // Generate consistent chat ID for two users
  getChatId(uid1, uid2) {
    return [uid1, uid2].sort().join('_');
  }

  async createOrGetChat(currentUserId, otherUserId) {
    const chatId = this.getChatId(currentUserId, otherUserId);
    const chatRef = firestore().collection(COLLECTIONS.CHATS).doc(chatId);
    const chat = await chatRef.get();

    if (!chat.exists) {
      await chatRef.set({
        id: chatId,
        participants: [currentUserId, otherUserId],
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        lastMessage: null,
        unreadCount: {
          [currentUserId]: 0,
          [otherUserId]: 0,
        },
        typingUsers: {},
      });
    }

    return chatId;
  }

  // Listen to user's chats
  onChatsChanged(userId, callback, onError) {
    return firestore()
      .collection(COLLECTIONS.CHATS)
      .where('participants', 'array-contains', userId)
      .onSnapshot(snapshot => {
        if (!snapshot?.docs) {
          callback([]);
          return;
        }

        const chats = snapshot.docs
          .map(getDocumentData)
          .sort(
            (a, b) =>
              getTimestampMillis(b.updatedAt) - getTimestampMillis(a.updatedAt)
          );

        callback(chats);
      }, error => {
        logListenerError('Chats', error);
        onError?.(error);
      });
  }

  async updateChatLastMessage(chatId, message, senderId, receiverId) {
    await firestore()
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .update({
        lastMessage: {
          text: message.type === MESSAGE_TYPES.TEXT ? message.text : '📷 Image',
          type: message.type,
          senderId,
          timestamp: firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: firestore.FieldValue.serverTimestamp(),
        [`unreadCount.${receiverId}`]: firestore.FieldValue.increment(1),
      });
  }

  async resetUnreadCount(chatId, userId) {
    await firestore()
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .update({
        [`unreadCount.${userId}`]: 0,
      });
  }

  async updateTypingStatus(chatId, userId, isTyping) {
    await firestore()
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .update({
        [`typingUsers.${userId}`]: isTyping,
      });
  }

  // Listen to typing status
  onTypingChanged(chatId, callback, onError) {
    return firestore()
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .onSnapshot(doc => {
        if (doc?.exists) {
          callback(normalizeFirestoreValue(doc.data().typingUsers || {}));
        }
      }, error => {
        logListenerError('Typing', error);
        onError?.(error);
      });
  }

  // ─── Message Operations ─────────────────────────────────────────────

  async sendMessage(chatId, message) {
    const messageRef = await firestore()
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .collection(COLLECTIONS.MESSAGES)
      .add({
        ...message,
        timestamp: firestore.FieldValue.serverTimestamp(),
        readBy: [message.senderId],
        status: 'sent',
      });

    return messageRef.id;
  }

  // Optimized paginated message loading
  onMessagesChanged(chatId, callback, limit = 30, onError) {
    return firestore()
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .collection(COLLECTIONS.MESSAGES)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .onSnapshot(snapshot => {
        if (!snapshot?.docs) {
          callback([]);
          return;
        }

        const messages = snapshot.docs
          .map(getDocumentData)
          .reverse();
        callback(messages);
      }, error => {
        logListenerError('Messages', error);
        onError?.(error);
      });
  }

  async loadMoreMessages(chatId, lastMessageTimestamp, limit = 30) {
    const snapshot = await firestore()
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .collection(COLLECTIONS.MESSAGES)
      .orderBy('timestamp', 'desc')
      .startAfter(getFirestoreCursor(lastMessageTimestamp))
      .limit(limit)
      .get();

    return snapshot.docs
      .map(getDocumentData)
      .reverse();
  }

  async markMessageAsRead(chatId, messageId, userId) {
    await firestore()
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .collection(COLLECTIONS.MESSAGES)
      .doc(messageId)
      .update({
        readBy: firestore.FieldValue.arrayUnion(userId),
        status: 'read',
      });
  }

  async markAllMessagesAsRead(chatId, userId, otherUserId) {
    const batch = firestore().batch();

    const unreadMessages = await firestore()
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .collection(COLLECTIONS.MESSAGES)
      .where('senderId', '==', otherUserId)
      .where('readBy', 'not-in', [[userId]])
      .get();

    unreadMessages.docs.forEach(doc => {
      batch.update(doc.ref, {
        readBy: firestore.FieldValue.arrayUnion(userId),
        status: 'read',
      });
    });

    await batch.commit();
    await this.resetUnreadCount(chatId, userId);
  }

  async deleteMessage(chatId, messageId) {
    await firestore()
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .collection(COLLECTIONS.MESSAGES)
      .doc(messageId)
      .update({
        isDeleted: true,
        text: 'This message was deleted',
        imageURL: null,
      });
  }
}

export const firestoreService = new FirestoreService();
