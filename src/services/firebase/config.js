import firebase from '@react-native-firebase/app';

// Firebase is auto-configured via google-services.json (Android)
// and GoogleService-Info.plist (iOS)
// No manual initialization needed with @react-native-firebase

export const getFirebaseApp = () => {
  return firebase.app();
};

export default firebase;