/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app.vue",
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.{vue,js,ts}",
    "./pages/**/*.{vue,js,ts}",
    "./plugins/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'anton': ['Anton', 'sans-serif'],
        'inter': ['Inter', 'serif'],
      },
    },
  },
  plugins: [],
}

