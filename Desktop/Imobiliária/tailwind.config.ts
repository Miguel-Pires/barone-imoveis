import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          900: '#0f172a',
        },
        whatsapp: '#25D366',
      },
    },
  },
  plugins: [],
}

export default config
