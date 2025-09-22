import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HeaderSection } from "./sections/HeaderSection";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Settings as SettingsIcon, 
  Save,
  Shield,
  Clock,
  Loader2
} from "lucide-react";

export default function Settings(): JSX.Element {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  // Split the user name into first and last name for editing
  const nameParts = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingPortalSession, setIsCreatingPortalSession] = useState(false);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      const parts = user.name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setEmail(user.email);
    }
  }, [user]);

  // Fetch subscription data using existing hook
  const { subscription, isLoading: subscriptionLoading, isError: subscriptionError } = useSubscription();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const result = await updateProfile({
        email: email.trim(),
        name: fullName
      });
      
      if (result.success) {
        toast({
          title: "Profile updated successfully!",
          description: "Your profile information has been saved.",
        });
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManageBilling = async () => {
    setIsCreatingPortalSession(true);
    
    try {
      // Get auth token for API call
      const { getSupabaseClient } = await import("@/lib/supabase");
      const supabase = await getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast({
          title: "Authentication required",
          description: "Please sign in to manage your billing.",
          variant: "destructive",
        });
        return;
      }

      // Call your existing portal session API
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create billing session');
      }

      const result = await response.json();
      
      if (result.url) {
        // Redirect to Stripe Customer Portal
        window.location.href = result.url;
      } else {
        throw new Error('No portal URL received');
      }

    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Unable to access billing portal",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPortalSession(false);
    }
  };

  // Format subscription data with correct field mappings
  const isSubscriptionUser = subscription?.stripeSubscriptionId && subscription.stripeSubscriptionId.trim() !== "";
  const hasEverPaid = subscription?.stripeCustomerId && subscription.stripeCustomerId.trim() !== "";
  const isRegisteredOnly = !hasEverPaid; // User registered but never made any payment
  const isFPXUser = hasEverPaid && !isSubscriptionUser; // Made payment but no recurring subscription
  
  const paymentMethod = isSubscriptionUser ? "Card Payment (Recurring)" : 
                       isFPXUser ? "FPX - One-time Payment" : 
                       "No payment method";
  const planName = subscription?.plan ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan` : "No Plan";
  const planStatus = subscription?.status === 'active' ? "Active" : "Inactive";
  // Only show expiry date for users who have actually paid (have stripeCustomerId)
  const expiryDate = hasEverPaid && subscription?.expiresAt && subscription.expiresAt !== null ? 
                     new Date(subscription.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 
                     "N/A";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <HeaderSection />
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account and subscription preferences
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Account Information */}
            <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Current Account Info Display */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Full Name</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.name || 'No name provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Email Address</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email || 'No email provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* First Name and Last Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        First Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="pl-10"
                          data-testid="input-firstname"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        data-testid="input-lastname"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                    data-testid="button-save-profile"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Subscription Information */}
            <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Subscription Information
                </CardTitle>
                <CardDescription>
                  View and manage your subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Plan with Status */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Current Plan</p>
                      <div className="text-sm text-muted-foreground">
                        {subscriptionLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Loading...
                          </div>
                        ) : subscriptionError ? (
                          "Failed to load"
                        ) : planName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      planStatus === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {subscriptionLoading ? '...' : subscriptionError ? 'Error' : planStatus}
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Payment Method</p>
                      <p className="text-sm text-muted-foreground">{paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Subscription Expiry */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Expires On</p>
                      <div className="text-sm text-muted-foreground">
                        {subscriptionLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Loading...
                          </div>
                        ) : subscriptionError ? (
                          "Failed to load"
                        ) : expiryDate}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons - Different for Subscription vs FPX users */}
                <div className="space-y-3">
                  {isSubscriptionUser ? (
                    // Subscription users can access Customer Portal
                    <Button
                      onClick={handleManageBilling}
                      disabled={isCreatingPortalSession}
                      variant="outline"
                      className="w-full border-border/50 hover:bg-accent transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      data-testid="button-manage-billing"
                    >
                      {isCreatingPortalSession ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Opening Portal...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Manage Billing
                        </>
                      )}
                    </Button>
                  ) : isFPXUser ? (
                    // FPX users get different options
                    <div className="space-y-3">
                      <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              One-time Payment Plan
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              You purchased a {subscription?.plan} plan with FPX payment. No recurring billing to manage.
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-border/50 hover:bg-accent transition-all duration-300 hover:scale-105"
                        onClick={() => window.location.href = '/billing'}
                        data-testid="button-upgrade-plan"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Upgrade or Renew Plan
                      </Button>
                    </div>
                  ) : (
                    // Registered users with no plan yet
                    <div className="space-y-3">
                      <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 mt-0.5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              No Active Plan
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Choose a plan to start using kasiviral's features.
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-border/50 hover:bg-accent transition-all duration-300 hover:scale-105"
                        onClick={() => window.location.href = '/billing'}
                        data-testid="button-choose-plan"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Choose Your Plan
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}