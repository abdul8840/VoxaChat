import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { firestoreService } from './firestoreService';
import { navigationRef } from '@navigation/navigationRef';

class MessagingService {
  async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      return enabled;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async getFCMToken() {
    try {
      // Register for remote messages on iOS
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }
      
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  async updateTokenInFirestore(uid) {
    const token = await this.getFCMToken();
    if (token && uid) {
      await firestoreService.updateFCMToken(uid, token);
    }
    return token;
  }

  setupMessageHandlers(dispatch) {
    // Foreground message handler
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      // Handle foreground notification display
    });

    // Background/Quit state message handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message received:', remoteMessage);
    });

    // When app is opened from background state
    const unsubscribeBackground = messaging()
      .onNotificationOpenedApp(remoteMessage => {
        this.handleNotificationNavigation(remoteMessage);
      });

    // When app is opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          setTimeout(() => {
            this.handleNotificationNavigation(remoteMessage);
          }, 1000);
        }
      });

    // Token refresh handler
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      // Update token in Firestore when it refreshes
      console.log('FCM token refreshed:', token);
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
      unsubscribeTokenRefresh();
    };
  }

  handleNotificationNavigation(remoteMessage) {
    const { data } = remoteMessage;
    if (data?.type === 'chat' && data?.chatId && data?.otherUser) {
      navigationRef.current?.navigate('Chat', {
        chatId: data.chatId,
        otherUser: JSON.parse(data.otherUser),
      });
    }
  }
}

export const messagingService = new MessagingService();