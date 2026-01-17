import { motion } from "framer-motion";
import { Dumbbell, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function Loading() {
  const { t, language } = useLanguage();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Rotating Dumbbell */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="relative"
          >
            <Dumbbell className="w-16 h-16 text-primary" />
          </motion.div>
          
          {/* Sparkles around */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              style={{
                transformOrigin: `50% ${60 + i * 20}px`,
              }}
            >
              <Sparkles 
                className="w-4 h-4 text-primary/60" 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-60px)`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-2xl font-display font-bold text-primary mb-2">
            {t.landing.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {language === 'ar' ? 'جاري تحميل رحلة لياقتك...' : 'Loading your fitness journey...'}
          </p>
        </motion.div>

        {/* Animated Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-primary"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-orange-400 to-primary"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Compact loading spinner for buttons/inline
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`${sizes[size]} border-2 border-primary border-t-transparent rounded-full`}
    />
  );
}

// Full page loading wrapper (used inside LanguageProvider)
export function LoadingFullPage() {
  const { language, dir, t } = useLanguage();
  
  const title = t.landing.title;
  const loadingText = language === 'ar' 
    ? 'جاري إعداد رحلة لياقتك الشخصية...' 
    : 'Preparing your personalized fitness journey...';

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/10"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Main Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Dumbbell className="w-24 h-24 text-primary drop-shadow-2xl" />
          </motion.div>
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-primary/30 blur-2xl rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <motion.h1
            className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent mb-3"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: "200%",
            }}
          >
            {title}
          </motion.h1>
          <p className="text-muted-foreground text-lg">{loadingText}</p>
        </motion.div>

        {/* Animated Progress Ring */}
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-secondary"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-primary"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 56}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{
                strokeDashoffset: [2 * Math.PI * 56, 0, 2 * Math.PI * 56],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-4 h-4 rounded-full bg-primary"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

