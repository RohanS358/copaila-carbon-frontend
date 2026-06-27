/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#cbdbf5',
          bright: '#f8f9ff',
          container: {
            lowest: '#ffffff',
            low: '#eff4ff',
            DEFAULT: '#e5eeff',
            high: '#dce9ff',
            highest: '#d3e4fe',
          },
          variant: '#d3e4fe',
        },
        'on-surface': {
          DEFAULT: '#0b1c30',
          variant: '#414944',
        },
        inverse: {
          surface: '#213145',
          'on-surface': '#eaf1ff',
          primary: '#a4d0b8',
        },
        outline: {
          DEFAULT: '#717973',
          variant: '#c1c8c2',
        },
        primary: {
          DEFAULT: '#002d1c',
          on: '#ffffff',
          container: '#1a4331',
          'on-container': '#85b098',
          fixed: {
            DEFAULT: '#c0edd3',
            dim: '#a4d0b8',
            on: '#002114',
            'on-variant': '#264e3c',
          }
        },
        secondary: {
          DEFAULT: '#506600',
          on: '#ffffff',
          container: '#c9f24a',
          'on-container': '#566d00',
          fixed: {
            DEFAULT: '#c9f24a',
            dim: '#aed52e',
            on: '#161e00',
            'on-variant': '#3c4d00',
          }
        },
        tertiary: {
          DEFAULT: '#332300',
          on: '#ffffff',
          container: '#4e3800',
          'on-container': '#d39d00',
          fixed: {
            DEFAULT: '#ffdf9f',
            dim: '#f9bd22',
            on: '#261a00',
            'on-variant': '#5c4300',
          }
        },
        error: {
          DEFAULT: '#ba1a1a',
          on: '#ffffff',
          container: '#ffdad6',
          'on-container': '#93000a',
        },
        background: {
          DEFAULT: '#f8f9ff',
          on: '#0b1c30',
        },
      },
      fontFamily: {
        display: ['"Google Sans"', 'sans-serif'],
        body: ['"Google Sans"', 'sans-serif'],
        mono: ['"Google Sans"', 'monospace'],
        sans: ['"Google Sans"', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', fontWeight: '800', letterSpacing: '-0.02em' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', fontWeight: '800', letterSpacing: '-0.02em' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.05em' }],
        'data-mono': ['14px', { lineHeight: '20px', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        'container-max': '1280px',
        'gutter': '1.5rem',
        'margin-mobile': '1rem',
        'margin-desktop': '2.5rem',
        'stack-gap': '1rem',
        'section-gap': '4rem',
      },
      boxShadow: {
        none: 'none',
        ambient: 'none',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseSoft: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } },
        wiggle: { '0%, 100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}