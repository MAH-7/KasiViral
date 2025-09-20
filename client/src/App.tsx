import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, BillingRoute, AuthenticatedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";

import { Desktop } from "@/pages/Desktop";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import AuthConfirm from "@/pages/AuthConfirm";
import TermsOfService from "@/pages/TermsOfService";
import Billing from "@/pages/Billing";
import Subscribe from "@/pages/Subscribe";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      <Route path="/" component={Desktop} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/auth/confirm" component={AuthConfirm} />
      
      {/* Protected billing page - only for users without active subscription */}
      <Route path="/billing">
        <BillingRoute>
          <Billing />
        </BillingRoute>
      </Route>
      
      {/* Stripe subscription checkout */}
      <Route path="/subscribe">
        <AuthenticatedRoute>
          <Subscribe />
        </AuthenticatedRoute>
      </Route>
      
      {/* Protected dashboard - only for users with active subscription */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Authenticated settings - accessible to all logged in users */}
      <Route path="/settings">
        <AuthenticatedRoute>
          <Settings />
        </AuthenticatedRoute>
      </Route>
      
      <Route path="/terms" component={TermsOfService} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
