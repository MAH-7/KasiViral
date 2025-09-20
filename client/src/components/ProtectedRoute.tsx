import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { isActive: hasActiveSubscription, isLoading: subscriptionLoading, isError } = useSubscription();
  const [, navigate] = useLocation();

  // Handle redirects in useEffect to avoid side effects during render
  useEffect(() => {
    if (authLoading || (isLoggedIn && subscriptionLoading)) {
      return; // Still loading
    }

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (!hasActiveSubscription && !isError) {
      navigate('/billing');
      return;
    }
  }, [isLoggedIn, hasActiveSubscription, authLoading, subscriptionLoading, isError, navigate]);

  // Show loading while checking auth and subscription
  if (authLoading || (isLoggedIn && subscriptionLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state for subscription check failures
  if (isLoggedIn && isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="text-center space-y-4">
          <p className="text-red-600">Unable to verify subscription status</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Don't render children during redirects
  if (!isLoggedIn || (!hasActiveSubscription && !isError)) {
    return null;
  }

  // User is authenticated and has active subscription
  return <>{children}</>;
}

interface BillingRouteProps {
  children: React.ReactNode;
}

export function BillingRoute({ children }: BillingRouteProps) {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { isActive: hasActiveSubscription, isLoading: subscriptionLoading, isError } = useSubscription();
  const [, navigate] = useLocation();

  // Handle redirects in useEffect to avoid side effects during render
  useEffect(() => {
    if (authLoading || (isLoggedIn && subscriptionLoading)) {
      return; // Still loading
    }

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (hasActiveSubscription && !isError) {
      navigate('/dashboard');
      return;
    }
  }, [isLoggedIn, hasActiveSubscription, authLoading, subscriptionLoading, isError, navigate]);

  // Show loading while checking auth and subscription
  if (authLoading || (isLoggedIn && subscriptionLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children during redirects
  if (!isLoggedIn || (hasActiveSubscription && !isError)) {
    return null;
  }

  // User is authenticated but needs to subscribe (or there's an error)
  return <>{children}</>;
}