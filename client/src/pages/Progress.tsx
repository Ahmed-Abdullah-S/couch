import { useProgress } from "@/hooks/use-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus } from "lucide-react";

export default function Progress() {
  const { logs, logProgress, isLogging } = useProgress();
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logProgress({ weight: Number(weight) });
    setOpen(false);
    setWeight("");
  };

  const data = logs?.map(log => ({
    date: format(new Date(log.date!), 'MMM d'),
    weight: Number(log.weight),
  })).reverse() || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Progress Tracking</h1>
          <p className="text-muted-foreground">Visualize your gains.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-black font-bold">
              <Plus className="mr-2 h-4 w-4" /> Log Weight
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Check-in</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Current Weight (kg)</Label>
                <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-primary text-black" disabled={isLogging}>Save Log</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Body Weight Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        {logs?.map((log) => (
           <div key={log.id} className="p-4 rounded-xl bg-card border border-border flex justify-between items-center">
             <span className="text-muted-foreground">{format(new Date(log.date!), 'PPP p')}</span>
             <span className="font-bold text-xl">{log.weight} kg</span>
           </div>
        ))}
      </div>
    </div>
  );
}
