module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: [
    'react-native-gesture-handler/jestSetup',
    '<rootDir>/jest.setup.js',
  ],
  moduleNameMapper: {
    '^react-redux$': '<rootDir>/node_modules/react-redux/dist/cjs/index.js',
    '^immer$': '<rootDir>/node_modules/immer/dist/cjs/index.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-.*|@react-native-.*|@react-native-firebase|@reduxjs)/)',
  ],
};
