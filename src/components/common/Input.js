import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';

export const Input = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
  icon,
  style,
  ...props
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        error={!!error}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        left={icon ? <TextInput.Icon icon={icon} /> : null}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={isPasswordVisible ? 'eye-off' : 'eye'}
              onPress={() => setPasswordVisible(!isPasswordVisible)}
            />
          ) : null
        }
        theme={{
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            text: theme.colors.text,
            placeholder: theme.colors.subtext,
            onSurfaceVariant: theme.colors.subtext,
          },
        }}
        style={[
          styles.input,
          { backgroundColor: theme.colors.background },
        ]}
        {...props}
      />
      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
  },
});