import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Lock, Loader2, CheckCircle2, Sparkles } from "lucide-react";

export default function AuthPage() {
  const { t, dir, language } = useLanguage();
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get("mode") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register, isPending } = useAuth();
  const { toast } = useToast();
  const usernameRef = useRef<HTMLInputElement>(null);

  const formSchema = insertUserSchema;
  type FormData = z.infer<typeof formSchema>;

  const { register: registerField, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const watchedPassword = watch("password", "");

  // Calculate password strength
  useEffect(() => {
    if (activeTab === "register" && watchedPassword) {
      let strength = 0;
      if (watchedPassword.length >= 6) strength += 1;
      if (watchedPassword.length >= 8) strength += 1;
      if (/[A-Z]/.test(watchedPassword)) strength += 1;
      if (/[a-z]/.test(watchedPassword)) strength += 1;
      if (/[0-9]/.test(watchedPassword)) strength += 1;
      if (/[^A-Za-z0-9]/.test(watchedPassword)) strength += 1;
      setPasswordStrength(Math.min(strength, 4));
    } else {
      setPasswordStrength(0);
    }
  }, [watchedPassword, activeTab]);

  // Auto-focus username on mount
  useEffect(() => {
    if (usernameRef.current) {
      setTimeout(() => usernameRef.current?.focus(), 100);
    }
  }, [activeTab]);

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    const labels = language === 'ar' 
      ? ['ضعيف', 'متوسط', 'جيد', 'قوي']
      : ['Weak', 'Fair', 'Good', 'Strong'];
    return labels[Math.min(passwordStrength - 1, 3)];
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const onSubmit = async (data: FormData, type: "login" | "register") => {
    setIsSubmitting(true);
    try {
      if (type === "login") {
        await login(data);
        await new Promise(resolve => setTimeout(resolve, 200));
        try {
          const profileRes = await fetch("/api/profile");
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (!profile) {
              setLocation("/app/onboarding");
              return;
            }
          }
          setLocation("/app");
        } catch {
          setLocation("/app/onboarding");
        }
      } else {
        await register(data);
        toast({ 
          title: language === 'ar' ? 'نجح' : "Success", 
          description: language === 'ar' ? 'مرحباً بك! دعنا نبدأ بإعداد ملفك الشخصي' : "Welcome! Let's set up your profile." 
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        setLocation("/app/onboarding");
      }
    } catch (error: any) {
      let errorMessage = language === 'ar' ? 'حدث خطأ' : 'An error occurred';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      if (language === 'ar') {
        const translations: Record<string, string> = {
          'Invalid username or password': 'اسم المستخدم أو كلمة المرور غير صحيحة',
          'Username already exists': 'اسم المستخدم موجود بالفعل',
          'This username is already taken. Please choose another one.': 'اسم المستخدم هذا مستخدم بالفعل. يرجى اختيار اسم آخر',
          'Username must be at least 3 characters long': 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
          'Password must be at least 6 characters long': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
          'Username and password are required': 'اسم المستخدم وكلمة المرور مطلوبان',
          'Missing required fields': 'الحقول المطلوبة مفقودة',
          'Invalid registration data. Please check your input': 'بيانات التسجيل غير صحيحة. يرجى التحقق من المدخلات',
          'Registration failed. Please try again.': 'فشل التسجيل. يرجى المحاولة مرة أخرى',
          'Network error. Please check your connection and try again.': 'خطأ في الاتصال. يرجى التحقق من اتصالك والمحاولة مرة أخرى',
          'Server error. Please try again later.': 'خطأ في الخادم. يرجى المحاولة لاحقاً',
        };
        errorMessage = translations[errorMessage] || errorMessage;
      }

      toast({ 
        title: language === 'ar' ? 'خطأ' : "Error", 
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-orange-400/10 blur-[100px] rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-border bg-card/95 backdrop-blur-md shadow-2xl" dir={dir}>
          <CardHeader className="text-center space-y-2 pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center mb-2"
            >
              <Sparkles className="w-8 h-8 text-black" />
            </motion.div>
            <CardTitle className="text-3xl sm:text-4xl font-display font-bold text-primary">
              {t.landing.title}
            </CardTitle>
            <CardDescription className="text-base">
              {language === 'ar' ? 'ابدأ رحلة تحولك اليوم' : 'Begin your transformation journey today'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir={dir}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 p-1">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  {t.auth.signIn}
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  {t.auth.signUp}
                </TabsTrigger>
              </TabsList>
              
              <AnimatePresence mode="wait">
                <TabsContent value="login" key="login" className="mt-0">
                  <motion.form
                    initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit((d) => onSubmit(d, "login"))}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {t.common.username}
                      </Label>
                      <div className="relative">
                        <Input 
                          {...registerField("username", { 
                            required: language === 'ar' ? 'اسم المستخدم مطلوب' : 'Username is required',
                            minLength: {
                              value: 3,
                              message: language === 'ar' ? 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' : 'Username must be at least 3 characters'
                            }
                          })} 
                          id="username" 
                          placeholder={language === 'ar' ? 'اسم المستخدم' : 'Enter your username'}
                          disabled={isPending || isSubmitting}
                          className={`h-11 ${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                          dir={dir}
                          ref={usernameRef}
                        />
                        <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      </div>
                      <AnimatePresence>
                        {errors.username && (
                          <motion.span
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-destructive block mt-1 flex items-center gap-1"
                          >
                            {errors.username.message}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        {t.common.password}
                      </Label>
                      <div className="relative">
                        <Input 
                          {...registerField("password", { 
                            required: language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required',
                            minLength: {
                              value: 6,
                              message: language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
                            }
                          })} 
                          id="password" 
                          type={showPassword ? "text" : "password"}
                          placeholder={language === 'ar' ? 'كلمة المرور' : 'Enter your password'}
                          disabled={isPending || isSubmitting}
                          className={`h-11 ${dir === 'rtl' ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                          dir={dir}
                        />
                        <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <AnimatePresence>
                        {errors.password && (
                          <motion.span
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-destructive block mt-1 flex items-center gap-1"
                          >
                            {errors.password.message}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 font-bold bg-primary text-black hover:bg-primary/90 transition-all relative overflow-hidden group" 
                      disabled={isPending || isSubmitting}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isPending || isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t.common.loading}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            {t.auth.signInButton}
                          </>
                        )}
                      </span>
                      {(isPending || isSubmitting) && (
                        <motion.div
                          className="absolute inset-0 bg-primary/80"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </Button>
                  </motion.form>
                </TabsContent>

                <TabsContent value="register" key="register" className="mt-0">
                  <motion.form
                    initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit((d) => onSubmit(d, "register"))}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="reg-username" className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {t.common.username}
                      </Label>
                      <div className="relative">
                        <Input 
                          {...registerField("username", { 
                            required: language === 'ar' ? 'اسم المستخدم مطلوب' : 'Username is required',
                            minLength: {
                              value: 3,
                              message: language === 'ar' ? 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' : 'Username must be at least 3 characters'
                            }
                          })} 
                          id="reg-username" 
                          placeholder={language === 'ar' ? 'اسم المستخدم' : 'Choose a username'}
                          disabled={isPending || isSubmitting}
                          className={`h-11 ${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                          dir={dir}
                        />
                        <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      </div>
                      <AnimatePresence>
                        {errors.username && (
                          <motion.span
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-destructive block mt-1 flex items-center gap-1"
                          >
                            {errors.username.message}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        {t.common.password}
                      </Label>
                      <div className="relative">
                        <Input 
                          {...registerField("password", { 
                            required: language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required',
                            minLength: {
                              value: 6,
                              message: language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
                            }
                          })} 
                          id="reg-password" 
                          type={showPassword ? "text" : "password"}
                          placeholder={language === 'ar' ? 'كلمة المرور' : 'Create a password'}
                          disabled={isPending || isSubmitting}
                          className={`h-11 ${dir === 'rtl' ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                          dir={dir}
                        />
                        <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {activeTab === "register" && watchedPassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 mt-2"
                          dir={dir}
                        >
                          <div className={`flex gap-1 h-1.5 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                            {[1, 2, 3, 4].map((level) => (
                              <motion.div
                                key={level}
                                className={`flex-1 rounded-full ${
                                  level <= passwordStrength ? getPasswordStrengthColor() : "bg-secondary"
                                }`}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: level <= passwordStrength ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                              />
                            ))}
                          </div>
                          {passwordStrength > 0 && (
                            <p className={`text-xs text-start ${
                              passwordStrength <= 1 ? "text-red-500" :
                              passwordStrength === 2 ? "text-orange-500" :
                              passwordStrength === 3 ? "text-yellow-500" :
                              "text-green-500"
                            }`}>
                              {language === 'ar' ? `قوة كلمة المرور: ${getPasswordStrengthLabel()}` : `Password strength: ${getPasswordStrengthLabel()}`}
                            </p>
                          )}
                        </motion.div>
                      )}
                      
                      <AnimatePresence>
                        {errors.password && (
                          <motion.span
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-destructive block mt-1 flex items-center gap-1"
                          >
                            {errors.password.message}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 font-bold bg-primary text-black hover:bg-primary/90 transition-all relative overflow-hidden group" 
                      disabled={isPending || isSubmitting}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isPending || isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t.common.loading}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            {t.auth.signUpButton}
                          </>
                        )}
                      </span>
                      {(isPending || isSubmitting) && (
                        <motion.div
                          className="absolute inset-0 bg-primary/80"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </Button>
                  </motion.form>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
