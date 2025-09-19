import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HeaderSection } from "./sections/HeaderSection";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Settings as SettingsIcon, 
  ArrowLeft,
  Save,
  Shield,
  Clock
} from "lucide-react";

export default function Settings(): JSX.Element {
  const { user } = useAuth();
  // Split the user name into first and last name for editing
  const nameParts = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update logic
    console.log("Saving profile:", { firstName, lastName, email });
  };

  const handleManageBilling = () => {
    // TODO: Implement billing management
    console.log("Managing billing");
  };

  // Mock data for subscription info
  const memberSince = "January 2024";
  const paymentMethod = "FPX - Maybank";
  const planName = "Pro Plan";
  const planStatus = "Active";
  const expiryDate = "March 15, 2025";

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
          <div className="flex items-center mb-8">
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                size="sm"
                className="mr-4 hover:bg-accent"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <SettingsIcon className="w-6 h-6 text-primary" />
                Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account and subscription preferences
              </p>
            </div>
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
                    className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105"
                    data-testid="button-save-profile"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
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
                {/* Subscription Plan */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Current Plan</p>
                      <p className="text-sm text-muted-foreground">{planName}</p>
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">{memberSince}</p>
                    </div>
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

                {/* Plan Status */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Plan Status</p>
                      <p className={`text-sm font-medium ${
                        planStatus === 'Active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {planStatus}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subscription Expiry */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Expires On</p>
                      <p className="text-sm text-muted-foreground">{expiryDate}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleManageBilling}
                    variant="outline"
                    className="w-full border-border/50 hover:bg-accent transition-all duration-300 hover:scale-105"
                    data-testid="button-manage-billing"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}