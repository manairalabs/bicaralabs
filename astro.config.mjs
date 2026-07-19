// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://bicaralabs.com',
  integrations: [
    sitemap({
      filter: (page) => !/\/artwork\/?$/.test(page),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', id: 'id' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
