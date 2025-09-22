import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckIcon, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface CheckoutFormProps {
  plan: 'monthly' | 'annual';
  priceId: string;
  mode: 'subscription' | 'payment';
}

function CheckoutForm({ plan, priceId, mode }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/billing?session_success=true`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Payment Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/billing')}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Complete Payment`
          )}
        </Button>
      </div>
    </form>
  );
}

export default function Subscribe() {
  const [, navigate] = useLocation();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [stripeConfig, setStripeConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Get plan and mode from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const plan = (searchParams.get('plan') as 'monthly' | 'annual') || 'monthly';
  const mode = (searchParams.get('mode') as 'subscription' | 'payment') || 'subscription';

  const planDetails = {
    monthly: { price: 'RM20', interval: 'month', description: 'Billed monthly' },
    annual: { price: 'RM200', interval: 'year', description: 'Billed yearly • Save RM40' }
  };

  const currentPlan = planDetails[plan];

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        // Get Stripe configuration
        const configResponse = await apiRequest('GET', '/api/stripe/config');
        const config = await configResponse.json();
        setStripeConfig(config);

        // Create checkout session
        const priceId = mode === 'subscription' 
          ? (plan === 'monthly' ? config.pricing.subscription.monthly.priceId : config.pricing.subscription.annual.priceId)
          : (plan === 'monthly' ? config.pricing.oneTime.monthly.priceId : config.pricing.oneTime.annual.priceId);

        if (!priceId) {
          throw new Error('Price ID not configured. Please set up products in Stripe Dashboard.');
        }

        const response = await apiRequest('POST', '/api/create-checkout-session', {
          priceId,
          mode
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const data = await response.json();
        
        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
          return;
        }

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }

      } catch (error: any) {
        console.error('Checkout initialization error:', error);
        toast({
          title: "Setup Error",
          description: error.message || 'Failed to initialize payment. Please try again.',
          variant: "destructive",
        });
        navigate('/billing');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCheckout();
  }, [plan, mode, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                  <p className="text-muted-foreground">Setting up your payment...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Redirecting to secure checkout...</p>
                <Button onClick={() => navigate('/billing')} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Billing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: 'hsl(var(--primary))',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
          <p className="text-muted-foreground">
            Secure payment powered by Stripe
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Badge className="gradient-secondary text-white">KasiViralPro</Badge>
            </CardTitle>
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                {currentPlan.price}
                <span className="text-lg text-muted-foreground">/{currentPlan.interval}</span>
              </div>
              <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
              {plan === 'annual' && (
                <div className="text-sm text-green-600 font-medium">
                  Save RM40 vs monthly
                </div>
              )}
              {mode === 'payment' && (
                <Badge variant="secondary" className="text-xs">
                  One-time payment via FPX
                </Badge>
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

            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm 
                plan={plan} 
                priceId={''} 
                mode={mode}
              />
            </Elements>

            <div className="text-xs text-muted-foreground text-center">
              Secure payment processing • SSL encrypted • Cancel anytime
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

