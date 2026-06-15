import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  signUp,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from '@redux/slices/authSlice';
import { Input } from '@components/common/Input';
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  validateConfirmPassword,
} from '@utils/validators';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';
import { SCREEN_NAMES } from '@utils/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SignUpScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [snackVisible, setSnackVisible] = useState(false);

  const updateField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const validate = () => {
    const newErrors = {};
    const nameError = validateDisplayName(form.displayName);
    if (nameError) newErrors.displayName = nameError;
    const emailError = validateEmail(form.email);
    if (emailError) newErrors.email = emailError;
    const passwordError = validatePassword(form.password);
    if (passwordError) newErrors.password = passwordError;
    const confirmError = validateConfirmPassword(
      form.password,
      form.confirmPassword
    );
    if (confirmError) newErrors.confirmPassword = confirmError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    const result = await dispatch(
      signUp({
        email: form.email.trim(),
        password: form.password,
        displayName: form.displayName.trim(),
      })
    );

    if (signUp.rejected.match(result)) {
      setSnackVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: theme.colors.primary },
            ]}>
            <Icon name="account-plus" size={40} color="#fff" />
          </View>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.text }]}>
            Create Account
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.subtext }]}>
            Join us today!
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={form.displayName}
            onChangeText={value => updateField('displayName', value)}
            error={errors.displayName}
            icon="account-outline"
            autoCapitalize="words"
          />

          <Input
            label="Email"
            value={form.email}
            onChangeText={value => updateField('email', value)}
            error={errors.email}
            icon="email-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            value={form.password}
            onChangeText={value => updateField('password', value)}
            error={errors.password}
            icon="lock-outline"
            secureTextEntry
            autoCapitalize="none"
          />

          <Input
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={value => updateField('confirmPassword', value)}
            error={errors.confirmPassword}
            icon="lock-check-outline"
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            mode="contained"
            onPress={handleSignUp}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor={theme.colors.primary}>
            Create Account
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={{ color: theme.colors.subtext }}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.signInLink, { color: theme.colors.primary }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => {
          setSnackVisible(false);
          dispatch(clearError());
        }}
        duration={4000}
        action={{ label: 'Dismiss', onPress: () => setSnackVisible(false) }}>
        {authError}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#075E54',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  form: { gap: 4 },
  button: {
    marginTop: 16,
    borderRadius: 12,
  },
  buttonContent: { height: 50 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  signInLink: {
    fontWeight: '700',
    fontSize: 14,
  },
});

export default SignUpScreen;