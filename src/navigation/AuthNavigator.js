import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '@screens/auth/SignInScreen';
import SignUpScreen from '@screens/auth/SignUpScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import { SCREEN_NAMES } from '@utils/constants';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={SCREEN_NAMES.SIGN_IN}>
      <Stack.Screen name={SCREEN_NAMES.SIGN_IN} component={SignInScreen} />
      <Stack.Screen name={SCREEN_NAMES.SIGN_UP} component={SignUpScreen} />
      <Stack.Screen
        name={SCREEN_NAMES.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;