import { useNutritionPlan } from "@/hooks/use-plans";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Utensils, PieChart } from "lucide-react";

export default function NutritionPlan() {
  const { t, dir } = useLanguage();
  const { plan, generate, isGenerating } = useNutritionPlan();

  return (
    <div dir={dir} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">{t.nutrition.title}</h1>
          <p className="text-muted-foreground">{t.nutrition.subtitle}</p>
        </div>
        <Button onClick={() => generate()} disabled={isGenerating} variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""} ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
          {isGenerating ? t.nutrition.calculating : t.nutrition.regenerate}
        </Button>
      </div>

      {plan ? (
        <div className="space-y-8">
          {/* Macros Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MacroCard label={t.nutrition.calories} value={plan.calories} unit="kcal" color="bg-white text-black" />
            <MacroCard label={t.nutrition.protein} value={plan.protein} unit="g" color="bg-red-500 text-white" />
            <MacroCard label={t.nutrition.carbs} value={plan.carbs} unit="g" color="bg-blue-500 text-white" />
            <MacroCard label={t.nutrition.fats} value={plan.fats} unit="g" color="bg-yellow-500 text-black" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {(plan.mealSuggestions as any)?.mealPlan?.map((meal: any, idx: number) => (
                <Card key={idx} className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{meal.meal}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {meal.suggestions?.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {meal.macros && (
                      <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex gap-3">
                        <span>P: {meal.macros.protein}g</span>
                        <span>C: {meal.macros.carbs}g</span>
                        <span>F: {meal.macros.fats}g</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
             )) || (
               <Card className="border-border bg-card col-span-full">
                 <CardHeader>
                   <CardTitle className="text-lg">Meal Suggestions</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-sm text-muted-foreground">
                     Your calculated macros are above. Ask your coach for specific meal ideas!
                   </p>
                 </CardContent>
               </Card>
             )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <Utensils className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">{t.nutrition.noPlan}</h3>
          <p className="text-muted-foreground mb-6">{t.nutrition.noPlanDesc}</p>
          <Button onClick={() => generate()} disabled={isGenerating} className="bg-primary text-black">
            {t.nutrition.calculateButton}
          </Button>
        </div>
      )}
    </div>
  );
}

function MacroCard({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) {
  return (
    <div className={`p-6 rounded-xl ${color} shadow-lg flex flex-col items-center justify-center text-center`}>
      <span className="text-sm font-bold opacity-80 uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-display font-bold mt-1">{value}{unit}</span>
    </div>
  );
}
