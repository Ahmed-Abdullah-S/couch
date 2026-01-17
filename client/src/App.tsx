import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";

import Landing from "@/pages/Landing";
import AuthPage from "@/pages/AuthPage";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import TrainingPlan from "@/pages/TrainingPlan";
import NutritionPlan from "@/pages/NutritionPlan";
import Progress from "@/pages/Progress";
import Workouts from "@/pages/Workouts";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;
  if (!user) return <Redirect to="/auth" />;

  // Note: Could add check for !user.profile here and redirect to /app/onboarding if missing
  // But strictly 'user' check is enough for auth protection.

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes */}
      <Route path="/app/onboarding">
        {/* Onboarding doesn't use standard Layout usually, to focus attention */}
        {() => {
           const { user, isLoading } = useAuth();
           if (isLoading) return null;
           if (!user) return <Redirect to="/auth" />;
           return <Onboarding />;
        }}
      </Route>

      <Route path="/app" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/app/chat" component={() => <ProtectedRoute component={Chat} />} />
      <Route path="/app/plan/training" component={() => <ProtectedRoute component={TrainingPlan} />} />
      <Route path="/app/plan/nutrition" component={() => <ProtectedRoute component={NutritionPlan} />} />
      <Route path="/app/progress" component={() => <ProtectedRoute component={Progress} />} />
      <Route path="/app/workouts" component={() => <ProtectedRoute component={Workouts} />} />
      <Route path="/app/settings" component={() => <ProtectedRoute component={Settings} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
