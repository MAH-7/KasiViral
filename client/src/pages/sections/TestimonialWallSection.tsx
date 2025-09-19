import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const TestimonialWallSection = (): JSX.Element => {
  const features = [
    {
      title: "Performance content",
      description: "Templates include engagement scores based on real data",
      icon: "📊"
    },
    {
      title: "Topic suggestions",
      description: "Pre-populated ideas for instant inspiration and creation",
      icon: "💡"
    },
    {
      title: "Proven viral formats",
      description: "Based on actual high-performing posts across platforms",
      icon: "🔥"
    },
    {
      title: "Anonymous usage",
      description: "Start instantly without registration or personal information",
      icon: "🔒"
    },
    {
      title: "One-click copy & paste",
      description: "Content is ready to post immediately, no editing required",
      icon: "📋"
    },
    {
      title: "Multi-platform ready",
      description: "Optimized for Facebook, LinkedIn, Twitter/X, and Threads",
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
            Why creators choose <span className="text-gradient">KasiViral</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Everything you need to create viral content, nothing you don't.
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
