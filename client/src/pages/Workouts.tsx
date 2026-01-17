import { useWorkouts } from "@/hooks/use-workouts";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

export default function Workouts() {
  const { t, dir } = useLanguage();
  const { workouts, logWorkout, isLogging } = useWorkouts();
  const [open, setOpen] = useState(false);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      sets: [{ exercise: "", sets: 3, reps: 10, weight: 0, rpe: 8 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sets"
  });

  const onSubmit = async (data: any) => {
    // Format data to match database schema (exercises instead of sets)
    const formattedData = {
      name: data.name,
      duration: 60, // Default duration
      exercises: data.sets.map((s: any) => ({
        name: s.exercise,
        sets: Number(s.sets),
        reps: Number(s.reps),
        weight: Number(s.weight),
      }))
    };
    await logWorkout(formattedData);
    setOpen(false);
    reset();
  };

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">{t.workouts.title}</h1>
          <p className="text-muted-foreground">{t.workouts.subtitle}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-black font-bold">
              <Plus className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} /> {t.workouts.logWorkout}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.workouts.logSession}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label>{t.workouts.workoutName}</Label>
                <Input {...register("name")} placeholder="Push Day A" required />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">{t.workouts.exercises}</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ exercise: "", sets: 3, reps: 10, weight: 0, rpe: 8 })}>
                    {t.workouts.addExercise}
                  </Button>
                </div>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-4 bg-secondary/20 rounded-lg">
                    <div className="col-span-12 sm:col-span-4 space-y-1">
                      <Label className="text-xs">{t.workouts.exercise}</Label>
                      <Input {...register(`sets.${index}.exercise`)} placeholder="Bench Press" />
                    </div>
                    <div className="col-span-3 sm:col-span-2 space-y-1">
                      <Label className="text-xs">Sets</Label>
                      <Input type="number" {...register(`sets.${index}.sets`)} />
                    </div>
                    <div className="col-span-3 sm:col-span-2 space-y-1">
                      <Label className="text-xs">Reps</Label>
                      <Input type="number" {...register(`sets.${index}.reps`)} />
                    </div>
                    <div className="col-span-3 sm:col-span-2 space-y-1">
                      <Label className="text-xs">Kg</Label>
                      <Input type="number" {...register(`sets.${index}.weight`)} />
                    </div>
                    <div className="col-span-3 sm:col-span-1 space-y-1">
                      <Label className="text-xs">RPE</Label>
                      <Input type="number" {...register(`sets.${index}.rpe`)} />
                    </div>
                    <div className="col-span-12 sm:col-span-1 flex justify-end">
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full bg-primary text-black font-bold" disabled={isLogging}>{t.workouts.save}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {workouts?.map((workout) => (
          <Card key={workout.id} className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{workout.name}</h3>
                  <p className="text-sm text-muted-foreground">{format(new Date(workout.date!), 'PPP p')}</p>
                </div>
                <div className="bg-secondary px-3 py-1 rounded-full text-xs font-mono">
                  {workout.duration || 60} min
                </div>
              </div>
              <div className="space-y-2">
                {workout.exercises && Array.isArray(workout.exercises) && workout.exercises.map((exercise: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0">
                    <span className="font-medium">{exercise.name || exercise.exercise}</span>
                    <span className="text-muted-foreground font-mono">
                      {exercise.sets} x {exercise.reps} @ {exercise.weight}kg{exercise.rpe ? ` (RPE ${exercise.rpe})` : ''}
                    </span>
                  </div>
                ))}
                {(!workout.exercises || workout.exercises.length === 0) && (
                  <p className="text-sm text-muted-foreground">No exercises recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!workouts?.length && (
          <div className="text-center py-20 text-muted-foreground">{t.workouts.noWorkouts}</div>
        )}
      </div>
    </div>
  );
}
