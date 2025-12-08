module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        pinky: {
          light: "#ffe6f2",
          DEFAULT: "#ffb3d9",
          dark: "#ff80bf",
          text: "#b30059"
        }
      }
    }
  },
  plugins: [],
};
