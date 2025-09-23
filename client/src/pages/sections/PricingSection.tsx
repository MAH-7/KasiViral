import { CheckIcon } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/contexts/LanguageContext";

export const PricingSection = (): JSX.Element => {
  const { isLoggedIn } = useAuth();
  const { isActive: hasActiveSubscription } = useSubscription();
  const { t } = useLanguage();

  // Determine where "Get Started Now" should redirect
  const getStartedHref = isLoggedIn 
    ? (hasActiveSubscription ? '/dashboard' : '/billing')
    : '/login';

  const getStartedText = isLoggedIn 
    ? (hasActiveSubscription ? t('pricing.goToDashboard') : t('pricing.completeSubscription')) 
    : t('pricing.getStartedNow');

  const features = [
    t('pricing.feature1'),
    t('pricing.feature2'),
    t('pricing.feature3'),
    t('pricing.feature4'),
    t('pricing.feature5'),
  ];

  return (
    <section className="section-padding bg-muted/30" id="pricing">
      <div className="container-custom">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 animate-fade-up">
            {t('pricing.headline')} <span className="text-gradient">{t('pricing.headlineHighlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="flex justify-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Card className="w-full max-w-lg card-hover glass-effect border-2">
            <CardContent className="p-8">
              <div className="text-center space-y-4 mb-8">
                <div className="flex justify-center">
                  <Badge className="gradient-secondary text-white px-4 py-1">
                    {t('pricing.mostPopular')}
                  </Badge>
                </div>
                
                <h3 className="text-2xl font-bold">
                  {t('pricing.productName')}
                </h3>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl lg:text-6xl font-bold text-foreground">
                    RM20
                  </span>
                  <span className="text-xl text-muted-foreground">
                    {t('pricing.perMonth')}
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
                <Link href={getStartedHref}>{getStartedText}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <p className="text-sm text-muted-foreground">
            {t('pricing.guarantee')}
          </p>
        </div>
      </div>
    </section>
  );
};
