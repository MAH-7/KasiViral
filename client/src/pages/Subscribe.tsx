import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckIcon } from 'lucide-react';

export default function Subscribe() {
  const [, navigate] = useLocation();
  
  // Get plan from URL params
  const plan = new URLSearchParams(window.location.search).get('plan') as 'monthly' | 'annual' || 'monthly';

  const planDetails = {
    monthly: { price: 'RM20', interval: 'month' },
    annual: { price: 'RM200', interval: 'year' }
  };

  const currentPlan = planDetails[plan];

  useEffect(() => {
    // Redirect to billing page since subscriptions are temporarily unavailable
    navigate('/billing');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Coming Soon</h1>
          <p className="text-muted-foreground">
            We're setting up payment processing. Please check back soon!
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
              {plan === 'annual' && (
                <div className="text-sm text-green-600 font-medium">
                  Save RM40 vs monthly
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

            <Button 
              onClick={() => navigate('/billing')} 
              className="w-full" 
              data-testid="button-back-billing"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Billing
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              Payment processing will be available soon. Thank you for your patience!
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

