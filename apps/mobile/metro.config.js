const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const workspaceRoot = path.resolve(__dirname, '../..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    extraNodeModules: {
      '@pridicta/access': path.resolve(workspaceRoot, 'packages/access/src'),
      '@pridicta/ai': path.resolve(workspaceRoot, 'packages/ai/src'),
      '@pridicta/astrology': path.resolve(
        workspaceRoot,
        'packages/astrology/src',
      ),
      '@pridicta/config': path.resolve(workspaceRoot, 'packages/config/src'),
      '@pridicta/core': path.resolve(workspaceRoot, 'packages/core/src'),
      '@pridicta/firebase': path.resolve(workspaceRoot, 'packages/firebase/src'),
      '@pridicta/monetization': path.resolve(
        workspaceRoot,
        'packages/monetization/src',
      ),
      '@pridicta/pdf': path.resolve(workspaceRoot, 'packages/pdf/src'),
      '@pridicta/types': path.resolve(workspaceRoot, 'packages/types/src'),
      '@pridicta/ui-tokens': path.resolve(
        workspaceRoot,
        'packages/ui-tokens/src',
      ),
      '@pridicta/utils': path.resolve(workspaceRoot, 'packages/utils/src'),
    },
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
  },
  watchFolders: [workspaceRoot],
});

module.exports = withNativeWind(config, { input: './global.css' });
