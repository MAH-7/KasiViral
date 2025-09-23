import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export const TestimonialWallSection = (): JSX.Element => {
  const { t } = useLanguage();
  
  const features = [
    {
      title: t("features.performance.title"),
      description: t("features.performance.description"),
      icon: "📊"
    },
    {
      title: t("features.topics.title"),
      description: t("features.topics.description"),
      icon: "💡"
    },
    {
      title: t("features.viral.title"),
      description: t("features.viral.description"),
      icon: "🔥"
    },
    {
      title: t("features.anonymous.title"),
      description: t("features.anonymous.description"),
      icon: "🔒"
    },
    {
      title: t("features.copy.title"),
      description: t("features.copy.description"),
      icon: "📋"
    },
    {
      title: t("features.multiplatform.title"),
      description: t("features.multiplatform.description"),
      icon: "🌍"
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "3s" }}></div>
      </div>

      <div className="container-custom">
        <div className="text-center mb-12 lg:mb-16 animate-fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            {t("features.headline")} <span className="text-gradient">KasiViral</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card/80 backdrop-blur border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 card-hover h-full"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <CardContent className="p-6 sm:p-8 h-full flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="text-3xl sm:text-4xl mb-3 animate-bounce" style={{ animationDelay: `${0.15 * index}s` }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
