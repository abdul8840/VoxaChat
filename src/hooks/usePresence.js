import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppState } from 'react-native';
import { firestoreService } from '@services/firebase/firestoreService';
import { setUserPresence } from '@redux/slices/presenceSlice';

export const usePresence = uid => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!uid) return;

    // Update presence on app state change
    const handleAppStateChange = nextAppState => {
      const isActive = nextAppState === 'active';
      firestoreService.updateUserPresence(uid, isActive);
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    // Set online when hook mounts
    firestoreService.updateUserPresence(uid, true);

    return () => {
      subscription.remove();
      // Set offline on unmount
      firestoreService.updateUserPresence(uid, false);
    };
  }, [uid]);
};

export const useWatchUserPresence = userId => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestoreService.onUserChanged(userId, userData => {
      dispatch(
        setUserPresence({
          uid: userId,
          isOnline: userData.isOnline,
          lastSeen: userData.lastSeen,
        })
      );
    });

    return unsubscribe;
  }, [userId, dispatch]);
};