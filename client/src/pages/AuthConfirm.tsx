import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeaderSection } from "./sections/HeaderSection";
import { getSupabaseClient } from "@/lib/supabase";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AuthConfirm(): JSX.Element {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const supabase = await getSupabaseClient();
        
        // Get the URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setStatus('error');
            setMessage(error.message);
          } else if (data.user) {
            setStatus('success');
            setMessage('Your email has been confirmed successfully! You can now log in.');
            
            // Redirect to login page after 3 seconds
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link. Please try registering again.');
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage('An error occurred while confirming your email. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

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
          <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl animate-fade-up">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                Email Confirmation
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {status === 'loading' && 'Confirming your email address...'}
                {status === 'success' && 'Email confirmed successfully!'}
                {status === 'error' && 'Confirmation failed'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 text-center">
              {status === 'loading' && (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-muted-foreground">Please wait...</span>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                  <p className="text-green-600 dark:text-green-400">{message}</p>
                  <p className="text-sm text-muted-foreground">
                    You will be redirected to the login page shortly...
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <XCircle className="w-16 h-16 text-red-500" />
                  </div>
                  <p className="text-red-600 dark:text-red-400">{message}</p>
                  <div className="space-y-2">
                    <Link href="/login">
                      <Button className="w-full" variant="outline">
                        Go to Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full" variant="default">
                        Try Registering Again
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}