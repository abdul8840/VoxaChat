import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { selectUser } from '@redux/slices/authSlice';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { setSendingMessage } from '@redux/slices/messagesSlice';
import { lightTheme, darkTheme } from '@theme';
import { useMessages } from '@hooks/useMessages';
import { useTyping } from '@hooks/useTyping';
import { useWatchUserPresence } from '@hooks/usePresence';
import { firestoreService } from '@services/firebase/firestoreService';
import { storageService } from '@services/firebase/storageService';
import MessageBubble from '@components/chat/MessageBubble';
import MessageInput from '@components/chat/MessageInput';
import TypingIndicator from '@components/chat/TypingIndicator';
import { Avatar } from '@components/common/Avatar';
import { formatLastSeen } from '@utils/helpers';
import { MESSAGE_TYPES } from '@utils/constants';
import { selectUserPresence } from '@redux/slices/presenceSlice';
import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from '@utils/permissions';

const ChatScreen = ({ route, navigation }) => {
  const { chat: initialChat, otherUser } = route.params;
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const otherUserPresence = useSelector(selectUserPresence(otherUser?.uid));

  const [chatId, setChatId] = useState(initialChat?.id || null);
  const [typingUsers, setTypingUsers] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const flatListRef = useRef(null);

  const { messages, isLoading, loadMoreMessages } = useMessages(
    chatId,
    currentUser?.uid,
    otherUser?.uid
  );

  const { startTyping, stopTyping } = useTyping(chatId, currentUser?.uid);

  // Watch other user's presence
  useWatchUserPresence(otherUser?.uid);

  // Initialize or get chat
  useEffect(() => {
    const initChat = async () => {
      if (!chatId && currentUser?.uid && otherUser?.uid) {
        try {
          const newChatId = await firestoreService.createOrGetChat(
            currentUser.uid,
            otherUser.uid
          );
          setChatId(newChatId);
        } catch (error) {
          console.warn('Failed to initialize chat:', error);
        }
      }
    };
    initChat();
  }, [chatId, currentUser?.uid, otherUser?.uid]);

  // Listen to typing status
  useEffect(() => {
    if (!chatId) return;
    
    const unsubscribe = firestoreService.onTypingChanged(
      chatId,
      users => setTypingUsers(users),
      () => setTypingUsers({})
    );
    return unsubscribe;
  }, [chatId]);

  // Mark messages as read when screen focuses
  useEffect(() => {
    if (chatId && currentUser?.uid && otherUser?.uid) {
      firestoreService
        .resetUnreadCount(chatId, currentUser.uid)
        .catch(error => console.warn('Failed to reset unread count:', error));
    }
  }, [chatId, currentUser?.uid, otherUser?.uid]);

  const isOtherUserTyping = useMemo(() => {
    return typingUsers[otherUser?.uid] === true;
  }, [typingUsers, otherUser?.uid]);

  const handleSendText = useCallback(async (text) => {
    if (!chatId || !text.trim()) return;

    dispatch(setSendingMessage(true));
    await stopTyping();

    try {
      const message = {
        senderId: currentUser.uid,
        receiverId: otherUser.uid,
        text: text.trim(),
        type: MESSAGE_TYPES.TEXT,
        isDeleted: false,
      };

      await firestoreService.sendMessage(chatId, message);
      await firestoreService.updateChatLastMessage(
        chatId,
        message,
        currentUser.uid,
        otherUser.uid
      );

      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      dispatch(setSendingMessage(false));
    }
  }, [chatId, currentUser, otherUser, dispatch, stopTyping]);

  const handleSendImage = useCallback(async () => {
    Alert.alert(
      'Send Image',
      'Choose image source',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) return;
            
            try {
              const image = await ImagePicker.openCamera({
                width: 1200,
                height: 1200,
                cropping: false,
                compressImageQuality: 0.8,
              });
              await uploadAndSendImage(image.path);
            } catch (error) {
              if (error.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Error', 'Failed to open camera.');
              }
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const hasPermission = await requestPhotoLibraryPermission();
            if (!hasPermission) return;
            
            try {
              const image = await ImagePicker.openPicker({
                width: 1200,
                height: 1200,
                cropping: false,
                compressImageQuality: 0.8,
              });
              await uploadAndSendImage(image.path);
            } catch (error) {
              if (error.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Error', 'Failed to open gallery.');
              }
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [chatId]);

  const uploadAndSendImage = async (imagePath) => {
    if (!chatId) return;
    dispatch(setSendingMessage(true));
    
    try {
      const downloadURL = await storageService.uploadChatImage(
        chatId,
        imagePath
      );

      const message = {
        senderId: currentUser.uid,
        receiverId: otherUser.uid,
        type: MESSAGE_TYPES.IMAGE,
        imageURL: downloadURL,
        text: '',
        isDeleted: false,
      };

      await firestoreService.sendMessage(chatId, message);
      await firestoreService.updateChatLastMessage(
        chatId,
        message,
        currentUser.uid,
        otherUser.uid
      );

      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      Alert.alert('Error', 'Failed to send image.');
    } finally {
      dispatch(setSendingMessage(false));
    }
  };

  const handleLongPressMessage = useCallback((message) => {
    if (message.senderId !== currentUser.uid) return;
    
    Alert.alert('Message Options', undefined, [
      {
        text: 'Delete Message',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestoreService.deleteMessage(chatId, message.id);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete message.');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [chatId, currentUser.uid]);

  const handleTypingChange = useCallback((isTyping) => {
    if (isTyping) {
      startTyping();
    } else {
      stopTyping();
    }
  }, [startTyping, stopTyping]);

  const renderMessage = useCallback(({ item, index }) => (
    <MessageBubble
      key={item.id}
      message={item}
      isMyMessage={item.senderId === currentUser?.uid}
      onLongPress={handleLongPressMessage}
      onImagePress={uri => setSelectedImage(uri)}
    />
  ), [currentUser?.uid, handleLongPressMessage]);

  const getPresenceStatus = () => {
    if (otherUserPresence?.isOnline) return 'Online';
    if (otherUserPresence?.lastSeen) {
      return formatLastSeen(otherUserPresence.lastSeen);
    }
    return otherUser?.isOnline ? 'Online' : 'Offline';
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}>
      
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.headerBackground },
        ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.colors.headerText} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerInfo}>
          <Avatar
            uri={otherUser?.photoURL}
            name={otherUser?.displayName}
            size={38}
            showOnline
            isOnline={otherUserPresence?.isOnline ?? otherUser?.isOnline}
          />
          <View style={styles.headerTextContainer}>
            <Text
              style={[styles.headerName, { color: theme.colors.headerText }]}
              numberOfLines={1}>
              {otherUser?.displayName}
            </Text>
            <Text
              style={[
                styles.headerStatus,
                {
                  color:
                    otherUserPresence?.isOnline
                      ? '#90EE90'
                      : `${theme.colors.headerText}90`,
                },
              ]}
              numberOfLines={1}>
              {getPresenceStatus()}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Icon name="video" size={22} color={theme.colors.headerText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <Icon name="phone" size={22} color={theme.colors.headerText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <Icon
              name="dots-vertical"
              size={22}
              color={theme.colors.headerText}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListFooterComponent={
          isOtherUserTyping ? <TypingIndicator visible /> : null
        }
        style={{ backgroundColor: theme.colors.background }}
        removeClippedSubviews
        maxToRenderPerBatch={15}
        windowSize={10}
        initialNumToRender={20}
      />

      {/* Message Input */}
      <MessageInput
        onSendText={handleSendText}
        onSendImage={handleSendImage}
        onTypingChange={handleTypingChange}
      />

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setSelectedImage(null)}>
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: { padding: 8 },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    gap: 10,
  },
  headerTextContainer: { flex: 1 },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 12,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 8,
  },
  messagesList: {
    paddingVertical: 8,
    paddingBottom: 4,
  },
  imageModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
});

export default ChatScreen;
