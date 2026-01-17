import { useProfile } from "@/hooks/use-profile";
import { useCoach } from "@/hooks/use-coach";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Settings() {
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and coach.</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle>Physical Stats</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" step="0.1" {...register("weight")} /></div>
              <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" {...register("height")} /></div>
              <div className="space-y-2"><Label>Age</Label><Input type="number" {...register("age")} /></div>
              <div className="space-y-2"><Label>Session Length</Label><Input type="number" {...register("sessionLength")} /></div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating} className="bg-primary text-black">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle>Coach Persona</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitCoach(onCoachSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>Coach Name</Label><Input {...registerCoach("name")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Style</Label><Input {...registerCoach("style")} /></div>
              <div className="space-y-2"><Label>Tone</Label><Input {...registerCoach("tone")} /></div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdatingCoach} className="bg-primary text-black">Update Coach</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
