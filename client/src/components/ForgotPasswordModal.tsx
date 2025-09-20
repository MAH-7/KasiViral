import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, X } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setMessage(result.message || "Password reset email sent!");
      setEmail(""); // Clear the input
    } else {
      setError(result.error || "Failed to send reset email");
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setEmail("");
    setMessage("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur border border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Reset Your Password
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
              data-testid="input-reset-email"
              required
            />
          </div>

          {/* Success Message */}
          {message && (
            <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-950/50 p-3 rounded-lg border border-green-200 dark:border-green-800">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105 disabled:opacity-50"
              data-testid="button-send-reset-email"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};