import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { HeaderSection } from "./sections/HeaderSection";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function Register(): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToMarketing, setAgreeToMarketing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (!agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    
    setIsLoading(true);
    
    const result = await register({ 
      email, 
      name: `${firstName} ${lastName}`.trim(), 
      password 
    });
    
    if (result.success) {
      if (result.message) {
        setSuccess(result.message);
      } else {
        // Auto-login case (shouldn't happen with new flow)
        navigate("/dashboard");
      }
    } else {
      setError(result.error || "Registration failed");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <HeaderSection />
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="w-full max-w-md mx-auto p-6">

        {/* Register Card */}
        <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              Join <span className="text-gradient">KasiViral</span>
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Create your account to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name and Last Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    data-testid="input-firstname"
                    required
                  />
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
                    className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    data-testid="input-lastname"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                  data-testid="input-email"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors pr-10"
                    data-testid="input-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>At least 8 characters</li>
                  <li>Mix of letters and numbers</li>
                  <li>Cannot be too common</li>
                </ul>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors pr-10"
                    data-testid="input-confirm-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Terms and Marketing Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    className="mt-1"
                    data-testid="checkbox-terms"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the <Link href="/terms"><span className="text-primary hover:underline cursor-pointer">Terms of Service</span></Link> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
                  </Label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="marketing"
                    checked={agreeToMarketing}
                    onCheckedChange={(checked) => setAgreeToMarketing(checked as boolean)}
                    className="mt-1"
                    data-testid="checkbox-marketing"
                  />
                  <Label htmlFor="marketing" className="text-sm leading-relaxed cursor-pointer">
                    I would like to receive marketing emails about new features, tips, and product updates from ThreadMaster AI
                  </Label>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div className="text-green-600 dark:text-green-400 text-sm text-center bg-green-50 dark:bg-green-950/50 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                size="lg"
                data-testid="button-register-submit"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-border/50 hover:bg-accent transition-all duration-300 hover:scale-105"
                  data-testid="button-sign-in"
                >
                  Sign In Instead
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}