import { CheckIcon } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export const PricingSection = (): JSX.Element => {
  const features = [
    "Unlimited AI thread generation",
    "Access to all viral templates",
    "Thread history and favorites",
    "All platform connections",
    "Cancel anytime — no commitments",
  ];

  return (
    <section className="section-padding bg-muted/30" id="pricing">
      <div className="container-custom">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 animate-fade-up">
            Simple, <span className="text-gradient">transparent pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Get started with our powerful AI thread generator. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="flex justify-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Card className="w-full max-w-lg card-hover glass-effect border-2">
            <CardContent className="p-8">
              <div className="text-center space-y-4 mb-8">
                <div className="flex justify-center">
                  <Badge className="gradient-secondary text-white px-4 py-1">
                    MOST POPULAR
                  </Badge>
                </div>
                
                <h3 className="text-2xl font-bold">
                  KasiViral PRO
                </h3>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl lg:text-6xl font-bold text-foreground">
                    RM20
                  </span>
                  <span className="text-xl text-muted-foreground">
                    / month
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105 text-lg py-3"
                asChild
                data-testid="button-pricing-get-started"
              >
                <Link href="/login">Get Started Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <p className="text-sm text-muted-foreground">
            🔒 Secure payment • 💸 30-day money-back guarantee • ❌ Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};
