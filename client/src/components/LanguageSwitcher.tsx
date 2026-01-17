import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
  const handleToggle = () => {
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);
  };

  const isEnglish = language === "en";

  return (
    <div className="relative inline-flex items-center p-1 bg-black/40 rounded-full border border-white/10 backdrop-blur-sm shadow-2xl w-[160px] h-[48px]">
      {/* Yellow Slider */}
      <motion.div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-[#DAFF00] shadow-lg z-0"
        initial={false}
        animate={{
          left: isEnglish ? "4px" : "calc(50% + 4px)",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
      
      {/* Single Toggle Button */}
      <button
        onClick={handleToggle}
        className="relative z-10 w-full h-full flex items-center justify-between px-3 cursor-pointer bg-transparent"
        type="button"
      >
        {/* English */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <span className="text-base">🇺🇸</span>
          <span 
            className="text-xs font-bold transition-colors duration-300"
            style={{ 
              color: isEnglish ? '#000000' : '#FFFFFF',
              fontWeight: 'bold'
            }}
          >
            EN
          </span>
        </div>

        {/* Arabic */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <span className="text-base">🇸🇦</span>
          <span 
            className="text-xs font-bold transition-colors duration-300"
            style={{ 
              color: !isEnglish ? '#000000' : '#FFFFFF',
              fontWeight: 'bold'
            }}
          >
            AR
          </span>
        </div>
      </button>
    </div>
  );
}

export function LanguageSwitcherCompact() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      className="h-10 w-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
    >
      <span className="text-xl">{language === "en" ? "🇺🇸" : "🇸🇦"}</span>
    </button>
  );
}

export function LanguageSwitcherSettings() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-sm">{t.settings.language}</h3>
          <p className="text-xs text-muted-foreground">
            {language === 'en' ? 'Select your language' : 'اختر لغتك'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setLanguage("en")}
          className={`relative p-6 rounded-2xl border-2 transition-all ${
            language === "en"
              ? "border-primary bg-primary/10 shadow-lg"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          {language === "en" && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl">🇺🇸</span>
            <span className="font-bold">English</span>
          </div>
        </button>

        <button
          onClick={() => setLanguage("ar")}
          className={`relative p-6 rounded-2xl border-2 transition-all ${
            language === "ar"
              ? "border-primary bg-primary/10 shadow-lg"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          {language === "ar" && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <div className="flex flex-col items-center gap-3">
            <span className="text-5xl">🇸🇦</span>
            <span className="font-bold">العربية</span>
          </div>
        </button>
      </div>
    </div>
  );
}
