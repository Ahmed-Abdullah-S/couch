import { useProfile } from "@/hooks/use-profile";
import { useCoach } from "@/hooks/use-coach";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcherSettings } from "@/components/LanguageSwitcher";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Settings() {
  const { t, dir } = useLanguage();
  const { profile, updateProfile, isUpdating } = useProfile();
  const { coach, updateCoach, isUpdating: isUpdatingCoach } = useCoach();
  const { toast } = useToast();

  const { register, handleSubmit, reset } = useForm();
  const { register: registerCoach, handleSubmit: handleSubmitCoach, reset: resetCoach } = useForm();

  useEffect(() => {
    if (profile) reset(profile);
    if (coach) resetCoach(coach);
  }, [profile, coach, reset, resetCoach]);

  const onProfileSubmit = async (data: any) => {
    try {
      await updateProfile({
        ...data,
        age: Number(data.age),
        height: Number(data.height),
        weight: Number(data.weight),
        daysPerWeek: Number(data.daysPerWeek),
        sessionLength: Number(data.sessionLength),
      });
      toast({ title: "Profile updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const onCoachSubmit = async (data: any) => {
    try {
      await updateCoach(data);
      toast({ title: "Coach updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div dir={dir} className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold">{t.settings.title}</h1>
        <p className="text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      {/* Language Switcher Card */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <LanguageSwitcherSettings />
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle>{t.settings.profile}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t.onboarding.step1.weight}</Label><Input type="number" step="0.1" {...register("weight")} /></div>
              <div className="space-y-2"><Label>{t.onboarding.step1.height}</Label><Input type="number" {...register("height")} /></div>
              <div className="space-y-2"><Label>{t.onboarding.step1.age}</Label><Input type="number" {...register("age")} /></div>
              <div className="space-y-2"><Label>{t.onboarding.step2.sessionLength}</Label><Input type="number" {...register("sessionLength")} /></div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating} className="bg-primary text-black">{t.settings.update}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle>{t.settings.coach}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitCoach(onCoachSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>{t.onboarding.step4.coachName}</Label><Input {...registerCoach("name")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t.onboarding.step4.style}</Label><Input {...registerCoach("style")} /></div>
              <div className="space-y-2"><Label>{t.onboarding.step4.tone}</Label><Input {...registerCoach("tone")} /></div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdatingCoach} className="bg-primary text-black">{t.settings.updateCoach}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
