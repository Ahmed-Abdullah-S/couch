import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { t, dir, language } = useLanguage();
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get("mode") === "register" ? "register" : "login";
  
  const { login, register, isPending } = useAuth();
  const { toast } = useToast();

  const formSchema = insertUserSchema;
  type FormData = z.infer<typeof formSchema>;

  const { register: registerField, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData, type: "login" | "register") => {
    try {
      if (type === "login") {
        await login(data);
        // After login, check if profile exists
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (!profile) {
            setLocation("/app/onboarding");
            return;
          }
        }
        setLocation("/app");
      } else {
        await register(data);
        toast({ title: "Success", description: language === 'ar' ? 'مرحباً بك! دعنا نبدأ بإعداد ملفك الشخصي' : "Welcome! Let's set up your profile." });
        setLocation("/app/onboarding");
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div dir={dir} className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
      </div>

      <Card className="w-full max-w-md border-border bg-card/90 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-display font-bold text-primary">{t.landing.title}</CardTitle>
          <CardDescription>{dir === 'ar' ? 'ابدأ رحلة تحولك اليوم' : 'Begin your transformation journey today'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
              <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:text-primary">{t.auth.signIn}</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-background data-[state=active]:text-primary">{t.auth.signUp}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit((d) => onSubmit(d, "login"))} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t.common.username}</Label>
                  <Input {...registerField("username")} id="username" placeholder="johndoe" />
                  {errors.username && <span className="text-xs text-destructive">{errors.username.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t.common.password}</Label>
                  <Input {...registerField("password")} id="password" type="password" />
                  {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
                </div>
                <Button type="submit" className="w-full font-bold bg-primary text-black hover:bg-primary/90" disabled={isPending}>
                  {isPending ? t.common.loading : t.auth.signInButton}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSubmit((d) => onSubmit(d, "register"))} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username">{t.common.username}</Label>
                  <Input {...registerField("username")} id="reg-username" placeholder="johndoe" />
                  {errors.username && <span className="text-xs text-destructive">{errors.username.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">{t.common.password}</Label>
                  <Input {...registerField("password")} id="reg-password" type="password" />
                  {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
                </div>
                <Button type="submit" className="w-full font-bold bg-primary text-black hover:bg-primary/90" disabled={isPending}>
                  {isPending ? t.common.loading : t.auth.signUpButton}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
