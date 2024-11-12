import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import XHR from "i18next-xhr-backend";
import LanguageDetector from "i18next-browser-languagedetector";

if (localStorage.getItem("i18nextLng") === null) {
  localStorage.setItem("i18nextLng", "en");
}

i18next
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: `/locales/{{lng}}.json`
    },
    react: {
      useSuspense: true
    },
    fallbackLng: "en",
    preload: ["en"],
    keySeparator: false,
    interpolation: { escapeValue: false }
  });

export default i18next;
