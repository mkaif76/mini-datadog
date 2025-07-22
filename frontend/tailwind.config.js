/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- NEW: Define our custom color palette here ---
      colors: {
        'primary-dark': '#111827', // A very dark blue, almost black
        'secondary-dark': '#1F2937', // A slightly lighter dark blue/gray
        'accent-purple': '#8B5CF6', // The purple color for active elements
        'accent-hover': '#7C3AED', // A slightly darker purple for hover
        'text-main': '#E5E7EB', // A light gray for main text
        'text-secondary': '#9CA3AF', // A dimmer gray for secondary text
        'border-dark': '#374151', // The color for borders
      },
    },
  },
  plugins: [],
}