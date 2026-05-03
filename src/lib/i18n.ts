import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import ptCommon from '@/locales/pt-BR/common.json';
import ptBarbecue from '@/locales/pt-BR/barbecue.json';
import ptCooking from '@/locales/pt-BR/cooking.json';
import ptGuest from '@/locales/pt-BR/guest.json';
import ptCatalog from '@/locales/pt-BR/catalog.json';

import enCommon from '@/locales/en/common.json';
import enBarbecue from '@/locales/en/barbecue.json';
import enCooking from '@/locales/en/cooking.json';
import enGuest from '@/locales/en/guest.json';
import enCatalog from '@/locales/en/catalog.json';

const resources = {
  'pt-BR': {
    common: ptCommon,
    barbecue: ptBarbecue,
    cooking: ptCooking,
    guest: ptGuest,
    catalog: ptCatalog,
  },
  en: {
    common: enCommon,
    barbecue: enBarbecue,
    cooking: enCooking,
    guest: enGuest,
    catalog: enCatalog,
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en'],
    ns: ['common', 'barbecue', 'cooking', 'guest', 'catalog'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    // Sem 'navigator' na ordem: se o usuário ainda não escolheu nada,
    // o app abre em pt-BR (fallbackLng) em vez de seguir o idioma do
    // sistema. Quem quiser EN usa o toggle no header — fica salvo.
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'fogo-alto.language',
      caches: ['localStorage'],
    },
  });

export default i18n;
