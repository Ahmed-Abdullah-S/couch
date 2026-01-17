import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getLanguage, setLanguage as saveLanguage, getDirection } from '@/lib/i18n';
import { translations } from '@/lib/translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  dir: 'ltr' | 'rtl';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(getLanguage());
  const dir = getDirection(language);

  useEffect(() => {
    // Set initial language on mount
    saveLanguage(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLang(lang);
    saveLanguage(lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
