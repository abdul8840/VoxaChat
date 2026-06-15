import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '@services/firebase/authService';
import { firestoreService } from '@services/firebase/firestoreService';
import {
  setUser,
  setInitialized,
  selectUser,
  selectIsAuthenticated,
} from '@redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        // Fetch full user document from Firestore
        const userDoc = await firestoreService.getUserDocument(firebaseUser.uid);
        dispatch(setUser({ uid: firebaseUser.uid, ...userDoc }));
      } else {
        dispatch(setUser(null));
      }
      dispatch(setInitialized());
    });

    return unsubscribe;
  }, [dispatch]);

  return { user, isAuthenticated };
};