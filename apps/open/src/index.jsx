import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import ReactDOM from 'react-dom/client';
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App />
  </>,
);
