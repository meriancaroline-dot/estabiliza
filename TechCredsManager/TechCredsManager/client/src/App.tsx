// Blueprint: javascript_log_in_with_replit
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Mood from "@/pages/mood";
import Reminders from "@/pages/reminders";
import Habits from "@/pages/habits";
import Support from "@/pages/support";
import Professionals from "@/pages/professionals";
import ListeningSpace from "@/pages/listening-space";
import Resources from "@/pages/resources";
import Profile from "@/pages/profile";
import Badges from "@/pages/badges";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/mood" component={Mood} />
          <Route path="/reminders" component={Reminders} />
          <Route path="/habits" component={Habits} />
          <Route path="/support" component={Support} />
          <Route path="/professionals" component={Professionals} />
          <Route path="/listening-space" component={ListeningSpace} />
          <Route path="/resources" component={Resources} />
          <Route path="/profile" component={Profile} />
          <Route path="/badges" component={Badges} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
