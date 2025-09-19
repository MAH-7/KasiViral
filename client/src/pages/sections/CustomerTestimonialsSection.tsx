import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const CustomerTestimonialsSection = (): JSX.Element => {
  const metrics = [
    {
      value: "95%+",
      title: "Engagement Rate",
      description: "Templates with performance scores up to 95%+ engagement",
    },
    {
      value: "100+",
      title: "Viral Threads",
      description: "Library with proven memes, quotes, and charts",
    },
    {
      value: "10+",
      title: "Categories",
      description: "Business, motivation, education, and more",
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="container-custom">
        <div className="text-center mb-12 lg:mb-16 animate-fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient">Proven results</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Real metrics from our users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {metrics.map((metric, index) => (
            <Card
              key={index}
              className="gradient-primary border-0 shadow-2xl card-hover transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <CardContent className="p-6 sm:p-8 text-center space-y-4">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">
                  {metric.value}
                </div>
                <div className="text-xl sm:text-2xl font-semibold text-white/90 mb-2">
                  {metric.title}
                </div>
                <div className="text-sm sm:text-base text-white/80 leading-relaxed">
                  {metric.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
