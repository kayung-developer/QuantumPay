const { colors, fonts } = require('./src/theme/theme'); // <-- IMPORT FROM OUR THEME FILE

module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: colors, // <-- USE THE IMPORTED COLORS
      fontFamily: fonts, // <-- USE THE IMPORTED FONTS
    },
  },
  plugins: [],
};