import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const sharedColors = {
  primary: '#0F766E',
  notification: '#D32F2F',
  onlineIndicator: '#25D366',
  offlineIndicator: '#9AA0A6',
  unreadBadge: '#25D366',
  readReceipt: '#34B7F1',
  accent: '#2563EB',
};

export const lightTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    ...sharedColors,
    background: '#F6F8FA',
    surface: '#FFFFFF',
    surfaceVariant: '#EEF4F2',
    elevatedSurface: '#FFFFFF',
    text: '#111B21',
    subtext: '#64716F',
    border: '#E0E7E5',
    inputBackground: '#F0F5F4',
    primaryContainer: '#DDF7F1',
    headerBackground: '#0F766E',
    headerText: '#FFFFFF',
    timestamp: '#7B8A88',
    chatBubbleSent: '#DDF7D8',
    chatBubbleReceived: '#FFFFFF',
    chatBubbleSentText: '#111B21',
    chatBubbleReceivedText: '#111B21',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    ...sharedColors,
    primary: '#5EEAD4',
    background: '#091114',
    surface: '#172126',
    surfaceVariant: '#203038',
    elevatedSurface: '#1D2A30',
    text: '#F1F5F4',
    subtext: '#9AA8A6',
    border: '#2B3B42',
    inputBackground: '#22333B',
    primaryContainer: '#123D39',
    headerBackground: '#111C21',
    headerText: '#E9EDEF',
    timestamp: '#9AA8A6',
    chatBubbleSent: '#0E5F54',
    chatBubbleReceived: '#1D2A30',
    chatBubbleSentText: '#E9EDEF',
    chatBubbleReceivedText: '#E9EDEF',
  },
};
