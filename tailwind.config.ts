import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { charcoal:'#121212', ivory:'#F4F0E6', sand:'#DCCFB6', gold:'#BFA160', green:'#2B4A3F' } } },
  plugins: []
} satisfies Config;
