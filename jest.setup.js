jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();

  return {
    getItem: jest.fn(key => Promise.resolve(store.get(key) ?? null)),
    setItem: jest.fn((key, value) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn(key => {
      store.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store.clear();
      return Promise.resolve();
    }),
    multiGet: jest.fn(keys =>
      Promise.resolve(keys.map(key => [key, store.get(key) ?? null]))
    ),
    multiSet: jest.fn(entries => {
      entries.forEach(([key, value]) => store.set(key, value));
      return Promise.resolve();
    }),
    multiRemove: jest.fn(keys => {
      keys.forEach(key => store.delete(key));
      return Promise.resolve();
    }),
  };
});

jest.mock('redux-persist', () => ({
  persistReducer: jest.fn((config, reducer) => reducer),
  persistStore: jest.fn(() => ({
    dispatch: jest.fn(),
    flush: jest.fn(() => Promise.resolve()),
    getState: jest.fn(() => ({ bootstrapped: true })),
    pause: jest.fn(),
    persist: jest.fn(),
    purge: jest.fn(() => Promise.resolve()),
    subscribe: jest.fn(() => jest.fn()),
  })),
}));

jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }) => children,
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => ({
  __esModule: true,
  default: 'Icon',
}));

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn(() => Promise.reject({ code: 'E_PICKER_CANCELLED' })),
  openCamera: jest.fn(() => Promise.reject({ code: 'E_PICKER_CANCELLED' })),
}));

jest.mock('react-native-permissions', () => ({
  check: jest.fn(() => Promise.resolve('granted')),
  request: jest.fn(() => Promise.resolve('granted')),
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
  },
}));

jest.mock('@react-native-firebase/app', () => {
  const defaultApp = {};

  return {
    apps: [defaultApp],
    app: jest.fn(() => defaultApp),
    initializeApp: jest.fn(() => Promise.resolve(defaultApp)),
  };
});

jest.mock('@react-native-firebase/auth', () => {
  const auth = jest.fn(() => ({
    currentUser: null,
    createUserWithEmailAndPassword: jest.fn(() =>
      Promise.resolve({ user: { uid: 'test-user', email: 'test@example.com' } })
    ),
    signInWithEmailAndPassword: jest.fn(() =>
      Promise.resolve({ user: { uid: 'test-user', email: 'test@example.com' } })
    ),
    signOut: jest.fn(() => Promise.resolve()),
    sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn(callback => {
      callback(null);
      return jest.fn();
    }),
  }));

  auth.EmailAuthProvider = {
    credential: jest.fn(() => ({})),
  };

  return auth;
});

jest.mock('@react-native-firebase/firestore', () => {
  const createRef = () => {
    const ref = {
      id: 'mock-doc',
      exists: false,
      data: jest.fn(() => ({})),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
      add: jest.fn(() => Promise.resolve({ id: 'mock-doc' })),
      get: jest.fn(() =>
        Promise.resolve({
          id: 'mock-doc',
          exists: false,
          data: jest.fn(() => ({})),
          docs: [],
        })
      ),
      onSnapshot: jest.fn(callback => {
        callback?.({
          id: 'mock-doc',
          exists: false,
          data: jest.fn(() => ({})),
          docs: [],
        });
        return jest.fn();
      }),
      doc: jest.fn(() => createRef()),
      collection: jest.fn(() => createRef()),
      where: jest.fn(() => ref),
      orderBy: jest.fn(() => ref),
      limit: jest.fn(() => ref),
      startAfter: jest.fn(() => ref),
    };

    return ref;
  };

  const firestore = jest.fn(() => ({
    collection: jest.fn(() => createRef()),
    batch: jest.fn(() => ({
      update: jest.fn(),
      commit: jest.fn(() => Promise.resolve()),
    })),
  }));

  firestore.FieldValue = {
    serverTimestamp: jest.fn(() => ({ seconds: 0, nanoseconds: 0 })),
    increment: jest.fn(value => value),
    arrayUnion: jest.fn((...values) => values),
  };

  return firestore;
});

jest.mock('@react-native-firebase/messaging', () => {
  const messaging = jest.fn(() => ({
    requestPermission: jest.fn(() =>
      Promise.resolve(messaging.AuthorizationStatus.AUTHORIZED)
    ),
    registerDeviceForRemoteMessages: jest.fn(() => Promise.resolve()),
    getToken: jest.fn(() => Promise.resolve(null)),
    onMessage: jest.fn(() => jest.fn()),
    setBackgroundMessageHandler: jest.fn(),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    onTokenRefresh: jest.fn(() => jest.fn()),
  }));

  messaging.AuthorizationStatus = {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  };

  return messaging;
});

jest.mock('@react-native-firebase/storage', () => {
  const storageRef = {
    putFile: jest.fn(() => ({
      on: jest.fn((event, onProgress, onError, onComplete) => onComplete?.()),
    })),
    getDownloadURL: jest.fn(() => Promise.resolve('https://example.test/file')),
    delete: jest.fn(() => Promise.resolve()),
  };

  return jest.fn(() => ({
    ref: jest.fn(() => storageRef),
  }));
});
