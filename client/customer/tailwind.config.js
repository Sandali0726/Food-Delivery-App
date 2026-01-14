/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF8C00',
        secondary: '#FFD700',
        accent: '#FFA500',
        danger: '#D63031',
        success: '#00B894',
      },
      borderRadius: {
        'card': '16px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0,0,0,0.1)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.15)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'toast-progress': 'toast-progress var(--duration) linear forwards',
      },
      keyframes: {
        'slide-in-right': {
          'from': {
            transform: 'translateX(100%)',
            opacity: '0'
          },
          'to': {
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        'toast-progress': {
          'from': {
            width: '100%'
          },
          'to': {
            width: '0%'
          }
        }
      }
    },
  },
  plugins: [],
}
