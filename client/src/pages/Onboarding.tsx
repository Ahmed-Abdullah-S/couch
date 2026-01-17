import { useState } from "react";
import { useLocation } from "wouter";
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

export default function Onboarding() {
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
      name: "Coach",
      style: "strict",
      tone: "energetic",
      language: "English"
    }
  });

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = async () => {
    try {
      const profileData = profileForm.getValues();
      const coachData = coachForm.getValues();

      // Convert numeric strings to numbers if needed (though hook form handles this with correct input types, usually needs coerce)
      await updateProfile({
        ...profileData,
        age: Number(profileData.age),
        height: Number(profileData.height),
        weight: Number(profileData.weight),
        daysPerWeek: Number(profileData.daysPerWeek),
        sessionLength: Number(profileData.sessionLength),
      });

      await updateCoach(coachData);

      toast({ title: "Setup Complete", description: "Your coach is ready for you." });
      setLocation("/app");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-card border-border shadow-2xl overflow-hidden">
        <div className="h-2 bg-secondary w-full">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }} 
          />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold">The Basics</h2>
                  <p className="text-muted-foreground">Tell us about your physical stats.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input type="number" {...profileForm.register("age")} placeholder="25" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select onValueChange={(v) => profileForm.setValue("gender", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <Input type="number" {...profileForm.register("height")} placeholder="180" />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" step="0.1" {...profileForm.register("weight")} placeholder="80" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold">Your Goals</h2>
                  <p className="text-muted-foreground">What are we aiming for?</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Goal</Label>
                    <Select onValueChange={(v) => profileForm.setValue("goal", v)}>
                      <SelectTrigger><SelectValue placeholder="Select Goal" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cut">Fat Loss (Cut)</SelectItem>
                        <SelectItem value="bulk">Muscle Gain (Bulk)</SelectItem>
                        <SelectItem value="recomp">Recomposition</SelectItem>
                        <SelectItem value="strength">Strength</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select onValueChange={(v) => profileForm.setValue("experienceLevel", v)}>
                      <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Days/Week</Label>
                      <Input type="number" max={7} {...profileForm.register("daysPerWeek")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Session Length (mins)</Label>
                      <Input type="number" {...profileForm.register("sessionLength")} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold">Preferences</h2>
                  <p className="text-muted-foreground">Fine-tune your experience.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Equipment Available</Label>
                    <Select onValueChange={(v) => profileForm.setValue("equipment", v)}>
                      <SelectTrigger><SelectValue placeholder="Select Equipment" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_gym">Commercial Gym</SelectItem>
                        <SelectItem value="home_gym">Home Gym</SelectItem>
                        <SelectItem value="dumbbells">Dumbbells Only</SelectItem>
                        <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Injuries (Optional)</Label>
                    <Textarea {...profileForm.register("injuries")} placeholder="e.g. Lower back pain, left shoulder..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Dietary Restrictions</Label>
                    <Textarea {...profileForm.register("allergies")} placeholder="e.g. Nut allergy, lactose intolerance..." />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold">Your Coach</h2>
                  <p className="text-muted-foreground">Design your ideal training partner.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Coach Name</Label>
                    <Input {...coachForm.register("name")} placeholder="Coach Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Coaching Style</Label>
                    <Select onValueChange={(v) => coachForm.setValue("style", v)}>
                      <SelectTrigger><SelectValue placeholder="Select Style" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strict">Strict & Disciplined</SelectItem>
                        <SelectItem value="supportive">Supportive & Encouraging</SelectItem>
                        <SelectItem value="analytical">Technical & Analytical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tone</Label>
                    <Select onValueChange={(v) => coachForm.setValue("tone", v)}>
                      <SelectTrigger><SelectValue placeholder="Select Tone" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="energetic">High Energy</SelectItem>
                        <SelectItem value="calm">Calm & Stoic</SelectItem>
                        <SelectItem value="aggressive">Aggressive/Intense</SelectItem>
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
              Back
            </Button>
            {step < totalSteps ? (
              <Button onClick={nextStep} className="w-32 bg-primary text-black font-bold">Next</Button>
            ) : (
              <Button onClick={onSubmit} className="w-32 bg-primary text-black font-bold">Finish</Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
