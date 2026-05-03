import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        body: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Fogo Alto — paleta "Domingo de tarde"
        cream: {
          DEFAULT: '#FFF4E0',
          warm: '#FFF6E2',
          paper: '#FFFBF2',
        },
        amber: {
          mid: '#FCE4B6',
          bottom: '#F5C77E',
        },
        tomato: {
          DEFAULT: '#F15A22',
          deep: '#C43217',
        },
        ember: {
          DEFAULT: '#E8930C',
        },
        olive: {
          DEFAULT: '#7A8B3D',
          deep: '#5A6B2D',
        },
        burgundy: {
          DEFAULT: '#7A2828',
        },
        ink: {
          DEFAULT: '#3D2817',
        },
        // shadcn semantic tokens (mapeados pra paleta)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 12px -4px rgba(120,60,20,0.15)',
        cost: '0 8px 24px -8px rgba(196,50,23,0.5)',
        cta: '0 10px 30px -8px rgba(196,50,23,0.6)',
      },
      letterSpacing: {
        stamp: '0.18em',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        ember: {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px rgba(241,90,34,0.35))' },
          '50%': { filter: 'drop-shadow(0 0 10px rgba(241,90,34,0.55))' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 4s ease-in-out infinite',
        ember: 'ember 3s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
};

export default config;
