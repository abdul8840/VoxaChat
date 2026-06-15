import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Button, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, selectAuthLoading } from '@redux/slices/authSlice';
import { Input } from '@components/common/Input';
import { validateEmail } from '@utils/validators';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ForgotPasswordScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async () => {
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    const result = await dispatch(forgotPassword(email.trim()));

    if (forgotPassword.fulfilled.match(result)) {
      setIsSuccess(true);
      setSnackMessage(
        'Password reset email sent! Check your inbox.'
      );
    } else {
      setSnackMessage(result.payload || 'Failed to send reset email.');
    }
    setSnackVisible(true);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
          <Icon name="lock-reset" size={50} color={theme.colors.primary} />
        </View>

        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.text }]}>
          Forgot Password?
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: theme.colors.subtext }]}>
          Enter your email and we'll send you a reset link
        </Text>

        <Input
          label="Email Address"
          value={email}
          onChangeText={value => {
            setEmail(value);
            setEmailError('');
          }}
          error={emailError}
          icon="email-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleReset}
          loading={isLoading}
          disabled={isLoading || isSuccess}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={theme.colors.primary}>
          {isSuccess ? 'Email Sent!' : 'Send Reset Link'}
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          textColor={theme.colors.primary}
          style={{ marginTop: 8 }}>
          Back to Sign In
        </Button>
      </View>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={5000}
        style={{
          backgroundColor: isSuccess
            ? theme.colors.onlineIndicator
            : theme.colors.notification,
        }}>
        {snackMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    marginTop: 8,
  },
  buttonContent: { height: 50 },
});

export default ForgotPasswordScreen;