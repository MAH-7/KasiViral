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

  // Simulate successful payment processing for development
  const simulatePaymentSuccess = async () => {
    setIsProcessing(true);
    
    try {
      // Calculate expiration date based on plan
      const now = new Date();
      const expiresAt = new Date(now);
      if (selectedPlan === 'monthly') {
        expiresAt.setMonth(now.getMonth() + 1);
      } else {
        expiresAt.setFullYear(now.getFullYear() + 1);
      }

      // Get auth token for API call
      const supabase = await getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      // Call development endpoint to activate subscription
      const response = await fetch('/api/subscription/dev-activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          expiresAt: expiresAt.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment processing failed: ${response.statusText}`);
      }

      // Success! Invalidate subscription cache and redirect
      invalidateSubscription();
      
      // Small delay to let cache update
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      
    } catch (error) {
      console.error('Payment simulation failed:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulatePaymentSuccess();
  };

  const handleFPXSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) {
      alert("Please select a bank");
      return;
    }
    simulatePaymentSuccess();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <HeaderSection />
      <div className="flex-1 flex items-center justify-center relative overflow-hidden py-8">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="w-full max-w-2xl mx-auto p-6">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild data-testid="button-back">
              <Link href="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </Button>
          </div>

          {/* Plan Selection Card */}
          <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl mb-6 animate-fade-up">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                KasiViral <span className="text-gradient">PRO</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground mb-4">
                Choose your billing cycle
              </CardDescription>
              
              {/* Plan Toggle */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                <button
                  onClick={() => setSelectedPlan("monthly")}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    selectedPlan === "monthly"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid="plan-monthly"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">RM20</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedPlan("annual")}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 relative ${
                    selectedPlan === "annual"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  data-testid="plan-annual"
                >
                  <div className="absolute -top-2 -right-2">
                    <Badge className="gradient-secondary text-white text-xs px-2 py-1">
                      SAVE RM40
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">RM200</div>
                    <div className="text-sm text-muted-foreground">per year</div>
                  </div>
                </button>
              </div>

              {/* Selected Plan Display */}
              <div className="flex items-baseline justify-center gap-1 my-4">
                <span className="text-5xl font-bold text-foreground">{currentPlan.price}</span>
                <span className="text-xl text-muted-foreground">/ {currentPlan.period}</span>
              </div>
              <CardDescription className="text-muted-foreground">
                {currentPlan.description} • Cancel anytime
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Payment Methods Card */}
          <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold">Choose Payment Method</CardTitle>
              <CardDescription>
                Select your preferred payment option for Malaysia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="card" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4" data-testid="tab-card">
                    <CreditCard className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Card</span>
                    <span className="hidden sm:inline">Payment</span>
                  </TabsTrigger>
                  <TabsTrigger value="fpx" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4" data-testid="tab-fpx">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">FPX</span>
                    <span className="hidden sm:inline">(Banks)</span>
                  </TabsTrigger>
                </TabsList>

                {/* Card Payment Tab */}
                <TabsContent value="card" className="space-y-6">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="font-semibold">Pay with Credit or Debit Card</h3>
                    <p className="text-sm text-muted-foreground">Secure payment powered by Stripe</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                      ⚠️ Note: This will be integrated with Stripe Elements for secure card processing
                    </div>
                  </div>
                  
                  <form onSubmit={handleCardSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-name">Cardholder Name</Label>
                      <Input
                        id="card-name"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        data-testid="input-card-name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        data-testid="input-card-number"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          data-testid="input-expiry"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          data-testid="input-cvv"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105 text-lg py-3"
                      data-testid="button-pay-card"
                    >
                      Pay {currentPlan.price} with Card
                    </Button>
                  </form>
                </TabsContent>

                {/* FPX Payment Tab */}
                <TabsContent value="fpx" className="space-y-6">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="font-semibold">Pay with Malaysian Bank Account</h3>
                    <p className="text-sm text-muted-foreground">Secure online banking transfer via FPX</p>
                  </div>

                  <form onSubmit={handleFPXSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Select Your Bank</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {malaysianBanks.map((bank) => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-4 border-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-3 text-left ${
                              selectedBank === bank.id
                                ? "border-primary bg-primary/5"
                                : `border-border hover:border-primary/50 ${bank.color}`
                            }`}
                            data-testid={`bank-${bank.id}`}
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border">
                              <span className="text-lg">{bank.logo}</span>
                            </div>
                            <span className="font-medium text-sm">{bank.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={!selectedBank}
                      className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105 text-lg py-3 disabled:opacity-50 disabled:hover:scale-100"
                      data-testid="button-pay-fpx"
                    >
                      Pay {currentPlan.price} with FPX
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Security Notice */}
              <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>🔒 Secure payment • 💸 30-day money-back guarantee • ❌ Cancel anytime</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}