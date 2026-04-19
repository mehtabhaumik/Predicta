module.exports = {
  moduleNameMapper: {
    '^@pridicta/access$': '<rootDir>/../../packages/access/src/index.ts',
    '^@pridicta/access/(.*)$': '<rootDir>/../../packages/access/src/$1',
    '^@pridicta/ai$': '<rootDir>/../../packages/ai/src/index.ts',
    '^@pridicta/ai/(.*)$': '<rootDir>/../../packages/ai/src/$1',
    '^@pridicta/astrology$':
      '<rootDir>/../../packages/astrology/src/index.ts',
    '^@pridicta/astrology/(.*)$':
      '<rootDir>/../../packages/astrology/src/$1',
    '^@pridicta/config$': '<rootDir>/../../packages/config/src/index.ts',
    '^@pridicta/config/(.*)$': '<rootDir>/../../packages/config/src/$1',
    '^@pridicta/firebase$': '<rootDir>/../../packages/firebase/src/index.ts',
    '^@pridicta/firebase/(.*)$':
      '<rootDir>/../../packages/firebase/src/$1',
    '^@pridicta/monetization$':
      '<rootDir>/../../packages/monetization/src/index.ts',
    '^@pridicta/monetization/(.*)$':
      '<rootDir>/../../packages/monetization/src/$1',
    '^@pridicta/types$': '<rootDir>/../../packages/types/src/index.ts',
    '^@pridicta/types/(.*)$': '<rootDir>/../../packages/types/src/$1',
    '^@pridicta/utils$': '<rootDir>/../../packages/utils/src/index.ts',
    '^@pridicta/utils/(.*)$': '<rootDir>/../../packages/utils/src/$1',
    '^@react-native-masked-view/masked-view$':
      '<rootDir>/__mocks__/maskedView.js',
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/reactNativeReanimated.js',
    '^react-native-sound$': '<rootDir>/__mocks__/reactNativeSound.js',
    '^react-native-keychain$': '<rootDir>/__mocks__/reactNativeKeychain.js',
    '^react-native-html-to-pdf$': '<rootDir>/__mocks__/reactNativeHtmlToPdf.js',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/asyncStorage.js',
    '^@react-native-firebase/auth$':
      '<rootDir>/__mocks__/reactNativeFirebaseAuth.js',
    '^@react-native-firebase/firestore$':
      '<rootDir>/__mocks__/reactNativeFirebaseFirestore.js',
    '^@react-native-firebase/storage$':
      '<rootDir>/__mocks__/reactNativeFirebaseStorage.js',
    '^@react-native-google-signin/google-signin$':
      '<rootDir>/__mocks__/googleSignin.js',
    '\\.(png|jpg|jpeg|gif|webp|wav|mp3)$': '<rootDir>/__mocks__/fileMock.js',
  },
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!\\.pnpm|((jest-)?react-native|@react-native(-community)?|@react-navigation|nativewind|react-native-css-interop|react-native-gesture-handler|react-native-linear-gradient|react-native-reanimated|react-native-safe-area-context|react-native-screens|react-native-worklets)/)',
  ],
};
