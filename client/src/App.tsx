import { Switch, Route, Redirect } from "wouter";
import React from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { LoadingFullPage } from "@/components/Loading";
import { useAuth } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";

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
  const [profile, setProfile] = React.useState<any>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      fetch("/api/profile")
        .then(res => {
          if (res.ok) return res.json();
          return null;
        })
        .then(data => {
          setProfile(data);
          setProfileLoading(false);
        })
        .catch(() => {
          setProfile(null);
          setProfileLoading(false);
        });
    }
  }, [user]);

  if (isLoading || profileLoading) {
    return <LoadingFullPage />;
  }
  
  if (!user) return <Redirect to="/auth" />;
  
  // Redirect to onboarding if no profile
  if (!profile) return <Redirect to="/app/onboarding" />;

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
           if (isLoading) return <LoadingFullPage />;
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
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
