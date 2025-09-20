import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeaderSection } from "./sections/HeaderSection";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { Eye, EyeOff, KeyRound, CheckCircle, AlertTriangle } from "lucide-react";

export default function ResetPassword(): JSX.Element {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const [, navigate] = useLocation();
  const { resetPassword, logout } = useAuth();

  // Check if we have valid reset session on mount
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const supabase = await getSupabaseClient();
        
        // Clear the URL hash after Supabase processes it for security
        if (window.location.hash) {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
        
        // Check URL for error parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (error) {
          setError(errorDescription || 'Invalid or expired reset link');
          setHasValidSession(false);
          return;
        }
        
        // Verify we have a valid recovery session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setError('Your password reset link has expired or is invalid. Please request a new one.');
          setHasValidSession(false);
          return;
        }
        
        setHasValidSession(true);
      } catch (error) {
        console.error('Error checking recovery session:', error);
        setError('Failed to verify reset link. Please try again.');
        setHasValidSession(false);
      }
    };

    checkRecoverySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    const result = await resetPassword(password);
    
    if (result.success) {
      setIsSuccess(true);
      // Sign out to clear the recovery session and redirect to login after 3 seconds
      setTimeout(async () => {
        await logout();
        navigate("/login");
      }, 3000);
    } else {
      setError(result.error || "Failed to reset password");
    }
    
    setIsLoading(false);
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
        <HeaderSection />
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-400/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          </div>

          <div className="w-full max-w-md mx-auto p-6">
            <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl animate-fade-up text-center">
              <CardHeader className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Password Reset Successful!
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Your password has been successfully updated. You will be redirected to the login page shortly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105"
                  data-testid="button-go-to-login"
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Invalid session state
  if (hasValidSession === false) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
        <HeaderSection />
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-400/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          </div>

          <div className="w-full max-w-md mx-auto p-6">
            <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl animate-fade-up text-center">
              <CardHeader className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                  Invalid Reset Link
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {error || "Your password reset link has expired or is invalid."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please request a new password reset link to continue.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate("/login")}
                    variant="outline"
                    className="flex-1 border-border/50 hover:bg-accent"
                    data-testid="button-back-to-login"
                  >
                    Back to Login
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/login");
                      // A small delay to let navigation happen, then we could trigger the modal
                      // But for now, just navigate - user can click forgot password again
                    }}
                    className="flex-1 gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105"
                    data-testid="button-request-new-reset"
                  >
                    Request New Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while checking session
  if (hasValidSession === null) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
        <HeaderSection />
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="w-full max-w-md mx-auto p-6">
            <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl animate-fade-up text-center">
              <CardContent className="py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Verifying reset link...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
          <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                Reset Your Password
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Enter your new password below to complete the reset process.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors pr-10"
                      data-testid="input-new-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-new-password"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
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

                {/* Password Requirements */}
                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <p className="font-medium mb-1">Password Requirements:</p>
                  <ul className="space-y-1">
                    <li className={password.length >= 6 ? "text-green-600 dark:text-green-400" : ""}>
                      • At least 6 characters long
                    </li>
                    <li className={password === confirmPassword && password.length > 0 ? "text-green-600 dark:text-green-400" : ""}>
                      • Passwords match
                    </li>
                  </ul>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword}
                  className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                  size="lg"
                  data-testid="button-reset-password-submit"
                >
                  {isLoading ? "Updating Password..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}