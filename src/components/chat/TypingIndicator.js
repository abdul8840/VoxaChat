import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { selectThemeMode } from '@redux/slices/themeSlice';
import { lightTheme, darkTheme } from '@theme';

const Dot = ({ delay, theme }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity,
          backgroundColor: theme.colors.subtext,
        },
      ]}
    />
  );
};

const TypingIndicator = ({ visible }) => {
  const themeMode = useSelector(selectThemeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  if (!visible) return null;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.chatBubbleReceived },
        ]}>
        <Dot delay={0} theme={theme} />
        <Dot delay={200} theme={theme} />
        <Dot delay={400} theme={theme} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginVertical: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 2,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default TypingIndicator;