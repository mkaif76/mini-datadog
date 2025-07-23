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
        'primary-dark': '#0F172A', // A very dark blue, almost black
        'secondary-dark': '#1F2937', // A slightly lighter dark blue/gray
        'accent-purple': '#8B5CF6', // The purple color for active elements
        'accent-hover': '#7C3AED', // A slightly darker purple for hover
        'text-main': '#E5E7EB', // A light gray for main text
        'text-secondary': '#9CA3AF', // A dimmer gray for secondary text
        'border-dark': '#374151', // The color for borders
        // 'yellow': '#F59E0B', // A bright yellow for warnings
        'cyan': '#06B6D4', // A bright cyan for highlights,
        // datadog purple colour
        'datadog-purple': '#4B3F6B', // The purple color used in Datadog
        'datadog-purple-alt': '#632CA6', // Hex Code: #632CA6, RGB: (99, 44, 166), CMYK: (40%, 74%, 0%, 34.9%)
        'dd-dark': '#2d2d3d',      // Main dark purple background
        'dd-medium': '#39394f',    // Lighter purple for sidebars, cards
        'dd-light': '#4a4a6a',     // Hover states
        'dd-accent': '#7F56D9',     // The main bright purple for active elements
        'dd-accent-hover': '#6941C6', // A darker purple for hover
        'dd-text-main': '#F9FAFB',  // A bright, high-contrast text color
        'dd-text-secondary': '#D1D5DB', // A dimmer text color for secondary info
        'dd-border': '#4a4a6a',      // The color for borders
         'dd-sidebar': '#20202d',      // NEW: A darker purple/gray for the sidebar & header
        'dd-background': '#2d2d3d',    // The main content area background
        'dd-card': '#39394f',        // The color for cards and secondary elements
        'dd-light-hover': '#4a4a6a', // A lighter color for hover states
        'dd-accent': '#7F56D9',         // The main bright purple for active elements
        'dd-accent-hover': '#6941C6', // A darker purple for hover
        'dd-text-main': '#F9FAFB',      // Bright, high-contrast text
        'dd-text-secondary': '#D1D5DB', // Dimmer, secondary text
        'dd-border': '#39394f',          // The color for borders
      },
    },
  },
  plugins: [],
}