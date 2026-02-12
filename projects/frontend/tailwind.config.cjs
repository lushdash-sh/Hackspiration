/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#0a0a0a',
        'cyber-dark': '#1a1a1a',
        'cyber-gray': '#2a2a2a',
        'neon-green': '#00ff88',
        'neon-blue': '#00d4ff',
        'neon-purple': '#ff00ff',
        'neon-pink': '#ff0080',
        'cyber-orange': '#ff6b00',
        'matrix-green': '#00ff41',
        'hacker-green': '#39ff14',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'cyber-pulse': 'cyber-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 255, 136, 0.8), 0 0 40px rgba(0, 255, 136, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'cyber-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
        'cyber': ['Orbitron', 'monospace'],
      },
    },
  },
  daisyui: {
    themes: ['lofi', 'dark'],
    logs: false,
  },
  plugins: [require('daisyui')],
}
