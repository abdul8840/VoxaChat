import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppState } from 'react-native';
import { firestoreService } from '@services/firebase/firestoreService';
import { setUserPresence } from '@redux/slices/presenceSlice';

export const usePresence = uid => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!uid) return;

    const updatePresence = isOnline => {
      firestoreService
        .updateUserPresence(uid, isOnline)
        .catch(error => console.warn('Failed to update presence:', error));
    };

    // Update presence on app state change
    const handleAppStateChange = nextAppState => {
      const isActive = nextAppState === 'active';
      updatePresence(isActive);
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    // Set online when hook mounts
    updatePresence(true);

    return () => {
      subscription.remove();
      // Set offline on unmount
      updatePresence(false);
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
    }, () => {});

    return unsubscribe;
  }, [userId, dispatch]);
};
