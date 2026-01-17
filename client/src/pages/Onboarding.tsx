import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProfile } from "@/hooks/use-profile";
import { useCoach } from "@/hooks/use-coach";
import { insertProfileSchema, insertCoachPersonaSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, User, Target, Settings, Sparkles } from "lucide-react";

export default function Onboarding() {
  const { t, dir, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { updateProfile } = useProfile();
  const { updateCoach } = useCoach();
  const { toast } = useToast();

  const totalSteps = 4;

  const profileForm = useForm<z.infer<typeof insertProfileSchema>>({
    resolver: zodResolver(insertProfileSchema.omit({ userId: true })),
    defaultValues: {
      daysPerWeek: 4,
      sessionLength: 60,
      gender: "male",
      goal: "hypertrophy",
      activityLevel: "sedentary",
      experienceLevel: "beginner",
      equipment: "full_gym",
    }
  });

  const coachForm = useForm<z.infer<typeof insertCoachPersonaSchema>>({
    resolver: zodResolver(insertCoachPersonaSchema.omit({ userId: true })),
    defaultValues: {
      name: language === 'ar' ? "المدرب" : "Coach",
      style: "supportive",
      tone: "energetic",
      language: language === 'ar' ? "Arabic" : "English"
    }
  });

  const nextStep = () => {
    if (step === 1) {
      profileForm.trigger(['age', 'gender', 'height', 'weight']).then(isValid => {
        if (isValid) setStep(2);
      });
    } else if (step === 2) {
      profileForm.trigger(['goal', 'experienceLevel', 'daysPerWeek', 'sessionLength']).then(isValid => {
        if (isValid) setStep(3);
      });
    } else {
      setStep(s => Math.min(s + 1, totalSteps));
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = async () => {
    try {
      const profileData = profileForm.getValues();
      const coachData = coachForm.getValues();

      await updateProfile({
        ...profileData,
        age: Number(profileData.age),
        height: Number(profileData.height),
        weight: Number(profileData.weight),
        daysPerWeek: Number(profileData.daysPerWeek),
        sessionLength: Number(profileData.sessionLength),
      });

      await updateCoach({
        ...coachData,
        language: language === 'ar' ? "Arabic" : "English"
      });

      toast({ 
        title: language === 'ar' ? "اكتمل الإعداد" : "Setup Complete", 
        description: language === 'ar' ? "مدربك جاهز لك!" : "Your coach is ready for you." 
      });
      setLocation("/app");
    } catch (error: any) {
      toast({ 
        title: language === 'ar' ? "خطأ" : "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const steps = [
    { icon: User, title: language === 'ar' ? 'المعلومات الأساسية' : 'The Basics' },
    { icon: Target, title: language === 'ar' ? 'أهدافك' : 'Your Goals' },
    { icon: Settings, title: language === 'ar' ? 'التفضيلات' : 'Preferences' },
    { icon: Sparkles, title: language === 'ar' ? 'مدربك' : 'Your Coach' },
  ];

  return (
    <div dir={dir} className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((stepInfo, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  step > idx + 1 
                    ? 'bg-primary border-primary text-black' 
                    : step === idx + 1 
                    ? 'border-primary text-primary bg-primary/10' 
                    : 'border-border text-muted-foreground'
                }`}>
                  {step > idx + 1 ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <stepInfo.icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-xs mt-2 text-center ${step >= idx + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {stepInfo.title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-orange-400"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <Card className="bg-card border-border shadow-2xl overflow-hidden">
          <div className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold">{language === 'ar' ? 'المعلومات الأساسية' : 'The Basics'}</h2>
                    <p className="text-muted-foreground">{language === 'ar' ? 'أخبرنا عن بياناتك الجسدية' : 'Tell us about your physical stats.'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'العمر' : 'Age'}</Label>
                      <Input type="number" {...profileForm.register("age", { valueAsNumber: true })} placeholder="25" />
                      {profileForm.formState.errors.age && (
                        <span className="text-xs text-destructive">{profileForm.formState.errors.age.message}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الجنس' : 'Gender'}</Label>
                      <Select onValueChange={(v) => profileForm.setValue("gender", v)}>
                        <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر' : 'Select'} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{language === 'ar' ? 'ذكر' : 'Male'}</SelectItem>
                          <SelectItem value="female">{language === 'ar' ? 'أنثى' : 'Female'}</SelectItem>
                          <SelectItem value="other">{language === 'ar' ? 'آخر' : 'Other'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الطول (سم)' : 'Height (cm)'}</Label>
                      <Input type="number" {...profileForm.register("height", { valueAsNumber: true })} placeholder="180" />
                      {profileForm.formState.errors.height && (
                        <span className="text-xs text-destructive">{profileForm.formState.errors.height.message}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الوزن (كجم)' : 'Weight (kg)'}</Label>
                      <Input type="number" step="0.1" {...profileForm.register("weight", { valueAsNumber: true })} placeholder="80" />
                      {profileForm.formState.errors.weight && (
                        <span className="text-xs text-destructive">{profileForm.formState.errors.weight.message}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold">{language === 'ar' ? 'أهدافك' : 'Your Goals'}</h2>
                    <p className="text-muted-foreground">{language === 'ar' ? 'ما الذي نسعى لتحقيقه؟' : 'What are we aiming for?'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الهدف الأساسي' : 'Primary Goal'}</Label>
                      <Select onValueChange={(v) => profileForm.setValue("goal", v)}>
                        <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر الهدف' : 'Select Goal'} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cut">{language === 'ar' ? 'فقدان الدهون' : 'Fat Loss (Cut)'}</SelectItem>
                          <SelectItem value="bulk">{language === 'ar' ? 'زيادة العضلات' : 'Muscle Gain (Bulk)'}</SelectItem>
                          <SelectItem value="recomp">{language === 'ar' ? 'إعادة التركيب' : 'Recomposition'}</SelectItem>
                          <SelectItem value="strength">{language === 'ar' ? 'القوة' : 'Strength'}</SelectItem>
                          <SelectItem value="hypertrophy">{language === 'ar' ? 'التضخم' : 'Hypertrophy'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'مستوى الخبرة' : 'Experience Level'}</Label>
                      <Select onValueChange={(v) => profileForm.setValue("experienceLevel", v)}>
                        <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر المستوى' : 'Select Level'} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">{language === 'ar' ? 'مبتدئ (0-1 سنة)' : 'Beginner (0-1 years)'}</SelectItem>
                          <SelectItem value="intermediate">{language === 'ar' ? 'متوسط (1-3 سنوات)' : 'Intermediate (1-3 years)'}</SelectItem>
                          <SelectItem value="advanced">{language === 'ar' ? 'متقدم (3+ سنوات)' : 'Advanced (3+ years)'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'أيام/أسبوع' : 'Days/Week'}</Label>
                        <Input type="number" max={7} {...profileForm.register("daysPerWeek", { valueAsNumber: true })} />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'مدة الجلسة (دقيقة)' : 'Session Length (mins)'}</Label>
                        <Input type="number" {...profileForm.register("sessionLength", { valueAsNumber: true })} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold">{language === 'ar' ? 'التفضيلات' : 'Preferences'}</h2>
                    <p className="text-muted-foreground">{language === 'ar' ? 'قم بضبط تجربتك' : 'Fine-tune your experience.'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'المعدات المتاحة' : 'Equipment Available'}</Label>
                      <Select onValueChange={(v) => profileForm.setValue("equipment", v)}>
                        <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر المعدات' : 'Select Equipment'} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_gym">{language === 'ar' ? 'صالة رياضية تجارية' : 'Commercial Gym'}</SelectItem>
                          <SelectItem value="home_gym">{language === 'ar' ? 'صالة منزلية' : 'Home Gym'}</SelectItem>
                          <SelectItem value="dumbbells">{language === 'ar' ? 'أثقال فقط' : 'Dumbbells Only'}</SelectItem>
                          <SelectItem value="bodyweight">{language === 'ar' ? 'وزن الجسم فقط' : 'Bodyweight Only'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الإصابات (اختياري)' : 'Injuries (Optional)'}</Label>
                      <Textarea {...profileForm.register("injuries")} placeholder={language === 'ar' ? 'مثال: ألم أسفل الظهر، كتف يسار...' : 'e.g. Lower back pain, left shoulder...'} />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'قيود غذائية' : 'Dietary Restrictions'}</Label>
                      <Textarea {...profileForm.register("allergies")} placeholder={language === 'ar' ? 'مثال: حساسية المكسرات، عدم تحمل اللاكتوز...' : 'e.g. Nut allergy, lactose intolerance...'} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold">{language === 'ar' ? 'مدربك' : 'Your Coach'}</h2>
                    <p className="text-muted-foreground">{language === 'ar' ? 'صمم شريك التدريب المثالي لك' : 'Design your ideal training partner.'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'اسم المدرب' : 'Coach Name'}</Label>
                      <Input {...coachForm.register("name")} placeholder={language === 'ar' ? 'اسم المدرب' : 'Coach Name'} />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'أسلوب التدريب' : 'Coaching Style'}</Label>
                      <Select onValueChange={(v) => coachForm.setValue("style", v)}>
                        <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر الأسلوب' : 'Select Style'} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strict">{language === 'ar' ? 'صارم ومنضبط' : 'Strict & Disciplined'}</SelectItem>
                          <SelectItem value="supportive">{language === 'ar' ? 'داعم ومشجع' : 'Supportive & Encouraging'}</SelectItem>
                          <SelectItem value="analytical">{language === 'ar' ? 'تقني وتحليلي' : 'Technical & Analytical'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'النبرة' : 'Tone'}</Label>
                      <Select onValueChange={(v) => coachForm.setValue("tone", v)}>
                        <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر النبرة' : 'Select Tone'} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="energetic">{language === 'ar' ? 'طاقة عالية' : 'High Energy'}</SelectItem>
                          <SelectItem value="calm">{language === 'ar' ? 'هادئ وثابت' : 'Calm & Stoic'}</SelectItem>
                          <SelectItem value="aggressive">{language === 'ar' ? 'عدواني/مكثف' : 'Aggressive/Intense'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-8 border-t border-border">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={step === 1}
                className="w-32"
              >
                {language === 'ar' ? 'السابق' : 'Back'}
              </Button>
              {step < totalSteps ? (
                <Button onClick={nextStep} className="w-32 bg-primary text-black font-bold">
                  {language === 'ar' ? 'التالي' : 'Next'}
                </Button>
              ) : (
                <Button onClick={onSubmit} className="w-32 bg-primary text-black font-bold">
                  {language === 'ar' ? 'إنهاء' : 'Finish'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
