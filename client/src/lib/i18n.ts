// Internationalization system for English and Arabic

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export const STORAGE_KEY = 'app-language';

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem(STORAGE_KEY) as Language) || 'en';
}

export function setLanguage(lang: Language) {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

export function getDirection(lang: Language): Direction {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export const languages = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' as Direction },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' as Direction },
};
