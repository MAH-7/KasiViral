import { getSupabaseClient } from "@/lib/supabase";

/**
 * Checks subscription status after authentication and redirects user accordingly
 * @param navigate - Navigation function from wouter
 * @param onComplete - Optional callback when the check completes
 * @param delay - Delay in milliseconds before checking (default: 1000ms)
 */
export async function handlePostAuthRedirect(
  navigate: (path: string) => void,
  onComplete?: () => void,
  delay: number = 1000
): Promise<void> {
  setTimeout(async () => {
    try {
      // Make a direct API call to check subscription status
      const client = await getSupabaseClient();
      const { data: { session } } = await client.auth.getSession();
      
      if (session?.access_token) {
        const response = await fetch('/api/subscription/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const subscriptionData = await response.json();
          if (subscriptionData.isActive || subscriptionData.status === 'active') {
            navigate("/dashboard");
          } else {
            navigate("/billing");
          }
        } else {
          // If can't check subscription, default to billing
          navigate("/billing");
        }
      } else {
        navigate("/billing");
      }
    } catch (error) {
      console.error('Error checking subscription after authentication:', error);
      // If error, default to billing page
      navigate("/billing");
    } finally {
      if (onComplete) {
        onComplete();
      }
    }
  }, delay);
}