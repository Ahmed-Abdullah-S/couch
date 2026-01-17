import { useNutritionPlan } from "@/hooks/use-plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Utensils, PieChart } from "lucide-react";

export default function NutritionPlan() {
  const { plan, generate, isGenerating } = useNutritionPlan();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Nutrition Plan</h1>
          <p className="text-muted-foreground">Fuel for your goals.</p>
        </div>
        <Button onClick={() => generate()} disabled={isGenerating} variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "Calculating..." : "Regenerate Plan"}
        </Button>
      </div>

      {plan ? (
        <div className="space-y-8">
          {/* Macros Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MacroCard label="Calories" value={plan.calories} unit="kcal" color="bg-white text-black" />
            <MacroCard label="Protein" value={plan.protein} unit="g" color="bg-red-500 text-white" />
            <MacroCard label="Carbs" value={plan.carbs} unit="g" color="bg-blue-500 text-white" />
            <MacroCard label="Fats" value={plan.fats} unit="g" color="bg-yellow-500 text-black" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {(plan.mealPlan as any)?.meals?.map((meal: any, idx: number) => (
                <Card key={idx} className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {meal.items.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
             ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <Utensils className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No Nutrition Plan</h3>
          <p className="text-muted-foreground mb-6">Calculate your macros and meal plan.</p>
          <Button onClick={() => generate()} disabled={isGenerating} className="bg-primary text-black">
            Calculate Macros
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
