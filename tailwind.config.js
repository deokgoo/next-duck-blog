// @ts-check
const { fontFamily } = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

/** @type {import("tailwindcss/types").Config } */
module.exports = {
  content: [
    './node_modules/pliny/**/*.js',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './layouts/**/*.{js,ts,tsx}',
    './data/**/*.mdx',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      lineHeight: {
        11: '2.75rem',
        12: '3rem',
        13: '3.25rem',
        14: '3.5rem',
      },
      fontSize: {
        'hero-display': ['80px', { lineHeight: '1.05', letterSpacing: '-2px' }],
        'display-lg': ['56px', { lineHeight: '1.10', letterSpacing: '-1px' }],
        'heading-1': ['48px', { lineHeight: '1.15', letterSpacing: '-0.5px' }],
        'heading-2': ['36px', { lineHeight: '1.20', letterSpacing: '-0.5px' }],
        'heading-3': ['28px', { lineHeight: '1.25', letterSpacing: '0' }],
        'heading-4': ['22px', { lineHeight: '1.30', letterSpacing: '0' }],
        'heading-5': ['18px', { lineHeight: '1.40', letterSpacing: '0' }],
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        'xxl': '32px',
        'xxxl': '40px',
        'section-sm': '48px',
        'section': '64px',
        'section-lg': '96px',
        'hero': '120px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'xxl': '20px',
        'xxxl': '24px',
      },
      boxShadow: {
        'subtle': 'rgba(15, 15, 15, 0.04) 0px 1px 2px 0px',
        'card': 'rgba(15, 15, 15, 0.08) 0px 4px 12px 0px',
        'elevated': 'rgba(15, 15, 15, 0.20) 0px 24px 48px -8px',
        'modal': 'rgba(15, 15, 15, 0.16) 0px 16px 48px -8px',
      },
      maxWidth: {
        'container': '1280px',
      },
      screens: {
        'xs': '480px',
      },
      keyframes: {
        'like-heart': {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.3)' },
          '50%': { transform: 'scale(0.9)' },
          '75%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'like-heart': 'like-heart 0.5s ease-in-out',
      },
      height: {
        'input': '44px',
      },
      minHeight: {
        'input': '44px',
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'var(--font-inter)', ...fontFamily.sans],
        display: ['var(--font-space-grotesk)', 'var(--font-pretendard)', ...fontFamily.sans],
        mono: ['var(--font-fira-code)', 'ui-monospace', 'SFMono-Regular', ...fontFamily.mono],
      },
      colors: {
        primary: colors.emerald, // 핑크 → 네온 그린
        gray: colors.gray,
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme('colors.primary.500'),
              '&:hover': {
                color: `${theme('colors.primary.600')}`,
              },
              code: { color: theme('colors.primary.400') },
            },
            'h1,h2': {
              fontFamily: theme('fontFamily.display').join(', '),
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
            },
            h3: {
              fontWeight: '600',
              marginBottom: '1rem', // 12px → 16px
            },
            code: {
              fontFamily: theme('fontFamily.mono').join(', '),
              color: theme('colors.indigo.500'),
              fontFeatureSettings: '"calt" 1, "liga" 1',
            },
            pre: {
              fontFamily: theme('fontFamily.mono').join(', '),
              marginTop: '2rem', // 24px → 32px
              marginBottom: '2rem',
              fontFeatureSettings: '"calt" 1, "liga" 1',
            },
            blockquote: {
              backgroundColor: 'rgba(16, 185, 129, 0.05)', // 은은한 그린 배경
              padding: '1rem 1.5rem',
              borderLeftColor: theme('colors.primary.500'),
              borderLeftWidth: '4px',
              borderRadius: '0.25rem',
            },
            // 리스트 스타일 개선
            'ul, ol': {
              paddingLeft: '2rem', // 32px - 명확한 들여쓰기
            },
            'ul > li, ol > li': {
              paddingLeft: '0.375rem', // 6px - 불릿/숫자와 텍스트 간격
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            'ul > li::marker': {
              color: theme('colors.primary.500'),
            },
            'ol > li::marker': {
              color: theme('colors.primary.500'),
              fontWeight: '600',
            },
            // 중첩 리스트
            'ul ul, ol ol, ul ol, ol ul': {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
          },
        },
        invert: {
          css: {
            a: {
              color: theme('colors.primary.500'),
              '&:hover': {
                color: `${theme('colors.primary.400')}`,
              },
              code: { color: theme('colors.primary.400') },
            },
            'h1,h2,h3,h4,h5,h6': {
              color: theme('colors.gray.100'),
            },
            blockquote: {
              backgroundColor: 'rgba(16, 185, 129, 0.1)', // 다크모드에서 조금 더 진하게
              borderLeftColor: theme('colors.primary.400'),
            },
            // 다크모드 리스트 마커 색상
            'ul > li::marker': {
              color: theme('colors.primary.400'),
            },
            'ol > li::marker': {
              color: theme('colors.primary.400'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
