export const COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  MESSAGES: 'messages',
};

export const STORAGE_PATHS = {
  PROFILE_PICTURES: 'profile_pictures',
  CHAT_IMAGES: 'chat_images',
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  EMOJI: 'emoji',
};

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
};

export const SCREEN_NAMES = {
  // Auth
  SIGN_IN: 'SignIn',
  SIGN_UP: 'SignUp',
  FORGOT_PASSWORD: 'ForgotPassword',
  // Main
  HOME: 'Home',
  CHAT: 'Chat',
  PROFILE: 'Profile',
  SEARCH: 'Search',
  // Root
  AUTH: 'Auth',
  MAIN: 'Main',
  SPLASH: 'Splash',
};

export const PAGINATION = {
  MESSAGES_PER_PAGE: 30,
  USERS_PER_SEARCH: 20,
};

export const TYPING_TIMEOUT = 2000; // ms

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB