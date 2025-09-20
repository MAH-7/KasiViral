import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoaderIcon, CheckIcon } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

// Initialize Stripe - requires VITE_STRIPE_PUBLIC_KEY environment variable
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required environment variable: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscribeFormProps {
  plan: 'monthly' | 'annual';
  pricing: {
    monthly: { displayAmount: string; interval: string };
    annual: { displayAmount: string; interval: string; savings: string };
  };
}

const SubscribeForm = ({ plan, pricing }: SubscribeFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { invalidateSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlan = pricing[plan];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Welcome to KasiViralPro! Redirecting to dashboard...",
        });
        
        // Invalidate subscription cache to refresh status
        invalidateSubscription();
        
        // Navigate to dashboard after short delay
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Badge className="gradient-secondary text-white">KasiViralPro</Badge>
        </CardTitle>
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {currentPlan.displayAmount}
            <span className="text-lg text-muted-foreground">/{currentPlan.interval}</span>
          </div>
          {plan === 'annual' && (
            <div className="text-sm text-green-600 font-medium">
              {pricing.annual.savings} savings vs monthly
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="font-medium">What's included:</h4>
          <ul className="space-y-2 text-sm">
            {[
              "Unlimited AI thread generation",
              "Access to all viral templates", 
              "Thread history and favorites",
              "All platform connections",
              "Cancel anytime — no commitments"
            ].map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || !elements || isProcessing}
            data-testid="button-subscribe"
          >
            {isProcessing ? (
              <>
                <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              `Subscribe for ${currentPlan.displayAmount}/${currentPlan.interval}`
            )}
          </Button>
        </form>

        <div className="text-xs text-muted-foreground text-center">
          Secure payment powered by Stripe. Your card details are never stored on our servers.
        </div>
      </CardContent>
    </Card>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [pricing, setPricing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Get plan from URL params
  const plan = new URLSearchParams(window.location.search).get('plan') as 'monthly' | 'annual' || 'monthly';

  useEffect(() => {
    const initializeSubscription = async () => {
      try {
        // First fetch pricing information
        const pricesResponse = await fetch('/api/stripe/prices');
        if (!pricesResponse.ok) throw new Error('Failed to fetch pricing');
        const pricesData = await pricesResponse.json();
        setPricing(pricesData);

        // Get auth token
        const supabase = await getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          toast({
            title: "Authentication Required",
            description: "Please log in to subscribe",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        // Create subscription
        const response = await fetch('/api/stripe/create-subscription', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan: plan }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create subscription');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);

      } catch (error: any) {
        console.error('Subscription initialization error:', error);
        toast({
          title: "Subscription Error",
          description: error.message || "Failed to initialize subscription. Please try again.",
          variant: "destructive",
        });
        navigate('/billing');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSubscription();
  }, [plan, toast, navigate]);

  if (isLoading || !pricing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <LoaderIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
            <div className="text-lg font-medium mb-2">Setting up your subscription...</div>
            <div className="text-muted-foreground">Please wait while we prepare your payment.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-lg font-medium mb-2">Unable to initialize payment</div>
            <div className="text-muted-foreground mb-4">Please try again or contact support.</div>
            <Button onClick={() => navigate('/billing')} data-testid="button-back-billing">
              Back to Billing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
          <p className="text-muted-foreground">
            You're just one step away from unlimited viral thread generation
          </p>
        </div>

        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: 'hsl(var(--primary))',
              }
            }
          }}
        >
          <SubscribeForm plan={plan} pricing={pricing} />
        </Elements>
      </div>
    </div>
  );
}