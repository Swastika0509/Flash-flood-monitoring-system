export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
// tailwind.config.js (excerpt)
extend: {
  colors: {
    brand: {
      DEFAULT: '#1e40af',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af', // add this line if you want an 800 shade
    },
  },
},
  },
  plugins: [],
}
