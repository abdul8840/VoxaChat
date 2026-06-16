import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';
import { getInitials } from '@utils/helpers';

export const Avatar = ({
  uri,
  name,
  size = 50,
  style,
  showOnline = false,
  isOnline = false,
}) => {
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const containerSize = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.container, containerSize, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            containerSize,
            { borderColor: theme.colors.border },
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            containerSize,
            {
              backgroundColor: theme.colors.primaryContainer,
              borderColor: theme.colors.border,
            },
          ]}>
          <Text
            style={[
              styles.initials,
              { fontSize: size * 0.35, color: theme.colors.primary },
            ]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
      {showOnline && (
        <View
          style={[
            styles.onlineIndicator,
            {
              backgroundColor: isOnline
                ? theme.colors.onlineIndicator
                : theme.colors.offlineIndicator,
              borderColor: theme.colors.background,
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: (size * 0.28) / 2,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  initials: {
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});

export default Avatar;
