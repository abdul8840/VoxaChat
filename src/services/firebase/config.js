import firebase from '@react-native-firebase/app';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from '@env';

let firebaseInitializationPromise = null;

const getFirebaseOptions = () => {
  const requiredEnv = {
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
  };

  const missingEnv = Object.entries(requiredEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingEnv.length > 0) {
    throw new Error(
      `Missing Firebase configuration values: ${missingEnv.join(', ')}`
    );
  }

  const options = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
    databaseURL: `https://${FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  };

  if (FIREBASE_MEASUREMENT_ID) {
    options.measurementId = FIREBASE_MEASUREMENT_ID;
  }

  return options;
};

export const initializeFirebaseApp = () => {
  if (firebaseInitializationPromise) {
    return firebaseInitializationPromise;
  }

  if (firebase.apps.length > 0) {
    firebaseInitializationPromise = Promise.resolve(firebase.app());
    return firebaseInitializationPromise;
  }

  firebaseInitializationPromise = firebase
    .initializeApp(getFirebaseOptions())
    .catch(error => {
      firebaseInitializationPromise = null;
      throw error;
    });

  return firebaseInitializationPromise;
};

export const getFirebaseApp = () => {
  if (firebase.apps.length === 0) {
    throw new Error('Firebase has not been initialized yet.');
  }

  return firebase.app();
};

export default firebase;
