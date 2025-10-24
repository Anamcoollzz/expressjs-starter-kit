import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { LanguageDetector, handle } from 'i18next-http-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupI18n(app: any) {
  await i18next
    .use(Backend)
    .use(LanguageDetector)
    .init({
      fallbackLng: process.env.I18N_FALLBACK || 'en',
      preload: ['en', 'id'],
      supportedLngs: ['en', 'id'],
      backend: {
        loadPath: path.join(
          __dirname,
          '..',
          'locales',
          '{{lng}}',
          'common.json',
        ),
      },
      detection: {
        order: ['querystring', 'cookie', 'header'],
        caches: ['cookie'],
      },
      interpolation: { escapeValue: false },
    });
  app.use(handle(i18next));
}
