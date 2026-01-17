import { useTrainingPlan } from "@/hooks/use-plans";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Dumbbell } from "lucide-react";

export default function TrainingPlan() {
  const { t, dir } = useLanguage();
  const { plan, generate, isGenerating } = useTrainingPlan();

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">{t.training.title}</h1>
          <p className="text-muted-foreground">{t.training.subtitle}</p>
        </div>
        <Button onClick={() => generate()} disabled={isGenerating} variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""} ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
          {isGenerating ? t.training.generating : t.training.regenerate}
        </Button>
      </div>

      {plan ? (
        <div className="grid gap-6">
          {/* Display training plan days */}
          {(plan.plan as any)?.days?.map((day: any, idx: number) => (
            <Card key={idx} className="border-border bg-card overflow-hidden">
              <div className="h-2 bg-primary w-full" />
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{day.name || `Day ${day.dayNumber}`}</span>
                  <span className="text-sm font-normal text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    {day.exercises?.length || 0} exercises
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {day.exercises?.map((ex: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{ex.name}</p>
                          <p className="text-xs text-muted-foreground">{ex.sets} sets × {ex.reps} {ex.rest ? `· ${ex.rest} rest` : ""}</p>
                        </div>
                      </div>
                      {ex.notes && <p className="text-xs text-muted-foreground max-w-[200px] text-right">{ex.notes}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )) || <pre className="p-4 bg-secondary rounded text-xs overflow-auto">{JSON.stringify(plan.plan, null, 2)}</pre>}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">{t.training.noPlan}</h3>
          <p className="text-muted-foreground mb-6">{t.training.noPlanDesc}</p>
          <Button onClick={() => generate()} disabled={isGenerating} className="bg-primary text-black">
            {t.training.generateButton}
          </Button>
        </div>
      )}
    </div>
  );
}
