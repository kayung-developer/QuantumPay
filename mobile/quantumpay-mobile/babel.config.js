// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel', // ADD THIS LINE
      'react-native-reanimated/plugin',
    ],
  };
};