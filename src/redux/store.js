import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import chatsReducer from './slices/chatsSlice';
import messagesReducer from './slices/messagesSlice';
import presenceReducer from './slices/presenceSlice';
import themeReducer from './slices/themeSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'theme'], // Only persist auth and theme
};

const rootReducer = combineReducers({
  auth: authReducer,
  chats: chatsReducer,
  messages: messagesReducer,
  presence: presenceReducer,
  theme: themeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/FLUSH',
          'persist/REGISTER',
        ],
      },
    }),
});

export const persistor = persistStore(store);