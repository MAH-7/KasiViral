import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderSection } from "./sections/HeaderSection";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, CreditCard, Building2, Shield, ArrowLeft } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { getSupabaseClient } from "@/lib/supabase";

export default function Billing(): JSX.Element {
  const [activeTab, setActiveTab] = useState("card");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const { invalidateSubscription } = useSubscription();
  const [, navigate] = useLocation();
  
  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const malaysianBanks = [
    { id: "maybank2u", name: "Maybank2u", logo: "🏦", color: "bg-yellow-50 border-yellow-200" },
    { id: "cimb", name: "CIMB Bank", logo: "🔴", color: "bg-red-50 border-red-200" },
    { id: "public_bank", name: "Public Bank", logo: "🟦", color: "bg-blue-50 border-blue-200" },
    { id: "rhb", name: "RHB Bank", logo: "🟨", color: "bg-yellow-50 border-yellow-200" },
    { id: "hong_leong", name: "Hong Leong Bank", logo: "🟢", color: "bg-green-50 border-green-200" },
    { id: "ambank", name: "AmBank", logo: "🟦", color: "bg-blue-50 border-blue-200" },
    { id: "bank_islam", name: "Bank Islam", logo: "🟩", color: "bg-emerald-50 border-emerald-200" },
    { id: "uob", name: "UOB Bank", logo: "🔵", color: "bg-blue-50 border-blue-200" },
  ];

  const plans = {
    monthly: {
      price: "RM20",
      amount: 20,
      period: "month",
      description: "Billed monthly"
    },
    annual: {
      price: "RM200", 
      amount: 200,
      period: "year",
      description: "Billed yearly • Save RM40"
    }
  };

  const features = [
    "Unlimited AI thread generation",
    "Access to all viral templates", 
    "Thread history and favorites",
    "All platform connections",
    "Cancel anytime — no commitments",
  ];

  const currentPlan = plans[selectedPlan];

  // Handle secure checkout
  const handleCheckout = async (plan: 'monthly' | 'annual', mode: 'subscription' | 'payment' = 'subscription') => {
    setIsProcessing(true);
    try {
      // Get Stripe configuration and create checkout session
      const configResponse = await fetch('/api/stripe/config');
      const config = await configResponse.json();
      
      const priceId = mode === 'subscription' 
        ? (plan === 'monthly' ? config.pricing.subscription.monthly.priceId : config.pricing.subscription.annual.priceId)
        : (plan === 'monthly' ? config.pricing.oneTime.monthly.priceId : config.pricing.oneTime.annual.priceId);

      if (!priceId) {
        // Fallback to subscribe page for manual setup
        navigate(`/subscribe?plan=${plan}&mode=${mode}`);
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await (await getSupabaseClient()).auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          priceId,
          mode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        // Fallback to subscribe page
        navigate(`/subscribe?plan=${plan}&mode=${mode}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // Fallback to subscribe page
      navigate(`/subscribe?plan=${plan}&mode=${mode}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlanSelect = (plan: 'monthly' | 'annual') => {
    const mode = activeTab === 'fpx' ? 'payment' : 'subscription';
    handleCheckout(plan, mode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderSection />
      
      <div className="flex-1 flex items-center justify-center py-6 px-4">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          
          {/* Back Navigation */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="hover:bg-muted rounded-lg" 
              data-testid="button-back"
            >
              <Link href="/settings">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm">Back to Settings</span>
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              KasiViral <span className="text-primary">PRO</span>
            </h1>
            <p className="text-muted-foreground">
              Choose your billing cycle and upgrade today
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Monthly Plan */}
            <Card 
              className={`cursor-pointer transition-all border ${
                selectedPlan === "monthly" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedPlan("monthly")}
              data-testid="plan-monthly"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Monthly</h3>
                    <p className="text-sm text-muted-foreground">Perfect for testing</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === "monthly" ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {selectedPlan === "monthly" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-foreground">RM20</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Billed monthly • Cancel anytime</p>
                </div>
              </CardContent>
            </Card>

            {/* Annual Plan */}
            <Card 
              className={`cursor-pointer transition-all border relative ${
                selectedPlan === "annual" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedPlan("annual")}
              data-testid="plan-annual"
            >
              {/* Popular badge */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-xs px-3 py-1">
                  Most Popular
                </Badge>
              </div>
              
              <CardContent className="p-6 pt-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Annual</h3>
                    <p className="text-sm text-muted-foreground">Best value option</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === "annual" ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {selectedPlan === "annual" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-foreground">RM200</span>
                    <span className="text-sm text-muted-foreground">/year</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-primary font-medium">Save RM40</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">17% OFF</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Equivalent to RM16.67/month</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features List */}
          <div className="bg-muted/50 rounded-lg p-4 mb-8">
            <h3 className="font-medium text-foreground mb-3 text-center">What's included:</h3>
            <div className="space-y-2 max-w-md mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-center gap-2 text-sm">
                  <CheckIcon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Card */}
          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-foreground text-center">
                Choose Payment Method
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Simple Tab Selector */}
                <div className="flex bg-muted rounded-lg p-1 mb-6">
                  <button
                    onClick={() => setActiveTab("card")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
                      activeTab === "card"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="tab-card"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm font-medium">Card</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("fpx")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
                      activeTab === "fpx"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="tab-fpx"
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm font-medium">FPX</span>
                  </button>
                </div>

                {/* Card Payment Tab */}
                <TabsContent value="card" className="space-y-4">
                  <div className="text-center space-y-3 mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                      <CreditCard className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Credit & Debit Cards</h3>
                      <p className="text-sm text-muted-foreground">Secure recurring subscription payments</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center justify-center gap-2 text-sm text-foreground font-medium">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Best for recurring subscriptions • Auto-renewal • Cancel anytime</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handlePlanSelect(selectedPlan)}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
                    data-testid="button-pay-card"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Redirecting to Checkout...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        <span>Pay {currentPlan.price} - Continue to Stripe</span>
                      </div>
                    )}
                  </Button>
                  
                  {/* Trust indicators */}
                  <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-green-500" />
                      <span>PCI DSS Level 1</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Stripe Secure</span>
                    </div>
                  </div>
                </TabsContent>

                {/* FPX Payment Tab */}
                <TabsContent value="fpx" className="space-y-4">
                  <div className="text-center space-y-3 mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Malaysian Online Banking</h3>
                      <p className="text-sm text-muted-foreground">One-time payment via FPX • All major banks</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center justify-center gap-2 text-sm text-foreground font-medium">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Perfect for one-time purchases • Instant activation • No recurring charges</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handlePlanSelect(selectedPlan)}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
                    data-testid="button-pay-fpx"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Redirecting to Checkout...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        <span>Pay {currentPlan.price} - Continue to Stripe</span>
                      </div>
                    )}
                  </Button>
                  
                  {/* Trust indicators */}
                  <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Instant Transfer</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-green-500" />
                      <span>Bank Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>FPX Certified</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Enhanced Security Notice */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="bg-gradient-to-r from-muted/30 to-muted/50 rounded-xl p-6 border border-border/50">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span>Powered by Stripe • Bank-level Security</span>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                      <span>🔒 Secure encrypted payment</span>
                      <span>⚡ Instant activation</span>
                      <span>🚫 Cancel anytime</span>
                    </div>
                    <p className="text-xs text-muted-foreground/80 max-w-md mx-auto">
                      Your payment information is processed securely. We don't store your payment details.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}