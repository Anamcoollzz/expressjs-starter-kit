import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const i18n = i18next;

export async function setupI18n() {
  if (!i18next.isInitialized) {
    await i18next
      .use(Backend)
      .use(middleware.LanguageDetector)
      .init({
        fallbackLng: process.env.I18N_FALLBACK || "en",
        preload: ["en", "id"],
        supportedLngs: ["en", "id"],
        ns: ["common"],
        defaultNS: "common",
        backend: {
          loadPath: path.join(__dirname, "../locales/{{lng}}/{{ns}}.json"),
        },
        detection: {
          order: ["querystring", "header", "cookie"],
          lookupQuerystring: "lang",
          caches: false,
        },
        interpolation: { escapeValue: false },
        debug: false,
      });
  }
  return i18next;
}

export { middleware };
