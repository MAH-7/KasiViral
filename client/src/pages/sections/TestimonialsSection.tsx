import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const TestimonialsSection = (): JSX.Element => {
  const features = [
    {
      emoji: "⚡",
      title: "AI-Powered Generator",
      description:
        "Creates viral social media threads using OpenAI GPT-5 with fallback generation.",
    },
    {
      emoji: "📚",
      title: "Template Library",
      description:
        "15+ high-performing thread templates with engagement scores and categories.",
    },
    {
      emoji: "🌐",
      title: "Multi-Platform Support",
      description: "Works for Facebook, LinkedIn, Twitter/X, and Threads.",
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="container-custom">
        <div className="text-center mb-12 lg:mb-16 animate-fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            Why Creators Choose <span className="text-gradient">KasiViral</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Streamlined from idea to publish across all major social platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card/50 backdrop-blur border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 card-hover"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <CardContent className="p-6 sm:p-8 text-center space-y-4">
                <div className="text-4xl sm:text-5xl mb-4 animate-bounce" style={{ animationDelay: `${0.2 * index}s` }}>
                  {feature.emoji}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
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
