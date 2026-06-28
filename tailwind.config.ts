import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme inspired by miguelsolorio/min-theme
        // Near-black backgrounds, muted warm-gray surfaces
        bg: {
          base: '#0d0d0d',
          surface: '#111111',
          raised: '#161616',
          hover: '#1c1c1c',
          active: '#222222'
        },
        ink: {
          // Warm-gray text scale
          high: '#e8e6e3',
          mid: '#a8a39d',
          low: '#6b6660',
          dim: '#45413c'
        },
        accent: {
          DEFAULT: '#d4a373',
          hover: '#e0b384',
          muted: 'rgba(212, 163, 115, 0.12)'
        },
        line: {
          DEFAULT: '#1f1f1f',
          strong: '#2a2a2a'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'SFMono-Regular',
          'ui-monospace',
          'Menlo',
          'Consolas',
          'monospace'
        ]
      },
      fontSize: {
        // Auorum-style tight type scale
        '2xs': ['11px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '22px' }],
        md: ['15px', { lineHeight: '24px' }],
        lg: ['17px', { lineHeight: '26px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['32px', { lineHeight: '40px' }]
      },
      spacing: {
        // Tight Raycast-style spacing
        '0.5': '2px',
        '1.5': '6px',
        '2.5': '10px',
        '3.5': '14px',
        '4.5': '18px',
        '13': '52px',
        '15': '60px'
      },
      borderRadius: {
        xs: '3px',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px'
      },
      transitionDuration: {
        instant: '80ms',
        fast: '140ms',
        DEFAULT: '200ms'
      },
      transitionTimingFunction: {
        snap: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      animation: {
        'fade-in': 'fadeIn 140ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 140ms cubic-bezier(0.4, 0, 0.2, 1)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: []
}

export default config
