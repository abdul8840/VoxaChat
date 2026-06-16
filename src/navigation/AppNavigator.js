import React, { useEffect } from 'react';
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'react-native';
import { navigationRef } from './navigationRef';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '@screens/SplashScreen';
import { useAuth } from '@hooks/useAuth';
import { usePresence } from '@hooks/usePresence';
import { messagingService } from '@services/firebase/messagingService';
import {
  selectIsAuthenticated,
  selectIsInitialized,
  selectUser,
} from '@redux/slices/authSlice';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';
import { SCREEN_NAMES } from '@utils/constants';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const user = useSelector(selectUser);
  const isInitialized = useSelector(selectIsInitialized);
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const navigationTheme =
    themeMode === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme;

  // Manage user presence
  usePresence(user?.uid);

  useEffect(() => {
    // Setup FCM
    const setupNotifications = async () => {
      try {
        if (user?.uid) {
          await messagingService.requestPermission();
          await messagingService.updateTokenInFirestore(user.uid);
          const cleanup = messagingService.setupMessageHandlers(dispatch);
          return cleanup;
        }
      } catch (error) {
        console.warn('Notification setup failed:', error);
      }
    };

    const cleanupPromise = setupNotifications();
    return () => {
      cleanupPromise
        .then(cleanup => cleanup?.())
        .catch(error => console.warn('Notification cleanup failed:', error));
    };
  }, [user?.uid, dispatch]);

  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.notification,
          primary: theme.colors.primary,
        },
        dark: themeMode === 'dark',
      }}>
      <StatusBar
        backgroundColor={theme.colors.headerBackground}
        barStyle={themeMode === 'dark' ? 'light-content' : 'light-content'}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name={SCREEN_NAMES.MAIN} component={MainNavigator} />
        ) : (
          <Stack.Screen name={SCREEN_NAMES.AUTH} component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
