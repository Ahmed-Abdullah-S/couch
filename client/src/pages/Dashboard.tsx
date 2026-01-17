import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useWorkouts } from "@/hooks/use-workouts";
import { useTrainingPlan } from "@/hooks/use-plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, ChevronRight, Dumbbell, Flame, Trophy } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { workouts } = useWorkouts();
  const { plan } = useTrainingPlan();

  const lastWorkout = workouts?.[0];
  const workoutCount = workouts?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-white uppercase">
            Welcome Back, {user?.username}
          </h1>
          <p className="text-muted-foreground mt-1">Ready to crush today's session?</p>
        </div>
        <Link href="/app/workouts">
          <Button className="bg-primary text-black font-bold hover:bg-primary/90">
            <Dumbbell className="mr-2 h-4 w-4" /> Log Workout
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          icon={<Flame className="h-6 w-6 text-orange-500" />}
          label="Current Goal"
          value={profile?.goal?.toUpperCase() || "NOT SET"}
          subValue={`${profile?.weight || 0} kg`}
        />
        <StatsCard 
          icon={<Trophy className="h-6 w-6 text-yellow-500" />}
          label="Total Workouts"
          value={workoutCount.toString()}
          subValue="Keep grinding!"
        />
        <StatsCard 
          icon={<Calendar className="h-6 w-6 text-blue-500" />}
          label="Last Session"
          value={lastWorkout ? format(new Date(lastWorkout.date!), 'MMM d') : "None"}
          subValue={lastWorkout?.name || "No data"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Link href="/app/plan/training">
              <Button variant="ghost" size="sm" className="text-primary">View Full <ChevronRight className="w-4 h-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {plan ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span className="bg-background px-2 py-1 rounded">4 Day Split</span>
                    <span className="bg-background px-2 py-1 rounded">Hypertrophy</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No active training plan.
                <br />
                <Link href="/app/plan/training">
                  <Button variant="link" className="text-primary">Generate one now</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workouts?.slice(0, 3).map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">{workout.name}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(workout.date!), 'PPP')}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm">{workout.duration} min</span>
                </div>
              ))}
              {!workouts?.length && <p className="text-muted-foreground text-center py-4">No recent activity.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, subValue }: { icon: any, label: string, value: string, subValue: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-secondary">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <h3 className="text-2xl font-display font-bold">{value}</h3>
            <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
