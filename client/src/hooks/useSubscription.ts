import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionStatus {
  status: 'active' | 'inactive';
  plan: 'monthly' | 'annual' | null;
  expiresAt: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  isActive: boolean;
}

// Helper function to make authenticated API requests
async function makeAuthenticatedRequest(url: string): Promise<SubscriptionStatus> {
  const supabase = await getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useSubscription() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['/api/subscription', 'me'],
    queryFn: () => makeAuthenticatedRequest('/api/subscription/me'),
    enabled: isLoggedIn && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Function to invalidate subscription cache (call after payment/logout)
  const invalidateSubscription = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/subscription', 'me'] });
  };

  // Function to clear subscription cache (call on logout)
  const clearSubscriptionCache = () => {
    queryClient.removeQueries({ queryKey: ['/api/subscription', 'me'] });
  };

  return {
    subscription: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isActive: query.data?.isActive ?? false,
    plan: query.data?.plan ?? null,
    status: query.data?.status ?? 'inactive',
    expiresAt: query.data?.expiresAt,
    invalidateSubscription,
    clearSubscriptionCache,
  };
}