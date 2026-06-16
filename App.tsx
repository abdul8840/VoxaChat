import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { store, persistor } from '@redux/store';
import AppNavigator from '@navigation/AppNavigator';
import ErrorBoundary from '@components/common/ErrorBoundary';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';
import SplashScreen from '@screens/SplashScreen';
import { initializeFirebaseApp } from '@services/firebase/config';

const AppContent = () => {
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ErrorBoundary>
            <AppNavigator />
          </ErrorBoundary>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

const App = () => {
  const [isFirebaseReady, setIsFirebaseReady] = React.useState(false);
  const [firebaseError, setFirebaseError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    initializeFirebaseApp()
      .then(() => {
        if (isMounted) {
          setIsFirebaseReady(true);
        }
      })
      .catch((error: unknown) => {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));

        console.error('Firebase initialization failed:', normalizedError);

        if (isMounted) {
          setFirebaseError(normalizedError);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (firebaseError) {
    throw firebaseError;
  }

  if (!isFirebaseReady) {
    return <SplashScreen />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

export default App;
