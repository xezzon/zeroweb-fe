// oxlint-disable-next-line no-unused-vars
import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import App from './App';

i18next
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    lng: navigator.language,
    fallbackLng: {
      default: ['zh-CN'],
    },
    ns: ['translation', 'error_code'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
  });

createRoot(document.getElementById('root')).render(
  <>
    <App />
  </>,
);
