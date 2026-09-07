/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Clash Display'", "'Outfit'", "sans-serif"],
        sans: ["'Outfit'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        white: 'rgb(var(--color-content) / <alpha-value>)',
        void: 'rgb(var(--color-void) / <alpha-value>)',
        navy: 'rgb(var(--color-navy) / <alpha-value>)',
        tinted: 'rgb(var(--color-tinted) / <alpha-value>)',
        cyan: {
          DEFAULT: 'rgb(var(--color-accent-primary) / <alpha-value>)',
        },
        magenta: {
          DEFAULT: 'rgb(var(--color-accent-secondary) / <alpha-value>)',
        },
        laser: {
          DEFAULT: 'rgb(var(--color-accent-primary-deep) / <alpha-value>)',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        eq: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' }
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        marquee: 'marquee 46s linear infinite',
        'marquee-medium': 'marquee 46s linear infinite',
        'marquee-slow': 'marquee 46s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
