import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const sharedColors = {
  primary: '#075E54',
  notification: '#D32F2F',
  onlineIndicator: '#25D366',
  offlineIndicator: '#9AA0A6',
  unreadBadge: '#25D366',
  readReceipt: '#34B7F1',
};

export const lightTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    ...sharedColors,
    background: '#F7F9F8',
    surface: '#FFFFFF',
    text: '#111B21',
    subtext: '#667781',
    border: '#E2E8E5',
    inputBackground: '#F0F4F3',
    headerBackground: '#075E54',
    headerText: '#FFFFFF',
    timestamp: '#8696A0',
    chatBubbleSent: '#DCF8C6',
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
    primary: '#00A884',
    background: '#0B141A',
    surface: '#202C33',
    text: '#E9EDEF',
    subtext: '#8696A0',
    border: '#2A3942',
    inputBackground: '#2A3942',
    headerBackground: '#202C33',
    headerText: '#E9EDEF',
    timestamp: '#8696A0',
    chatBubbleSent: '#005C4B',
    chatBubbleReceived: '#202C33',
    chatBubbleSentText: '#E9EDEF',
    chatBubbleReceivedText: '#E9EDEF',
  },
};
