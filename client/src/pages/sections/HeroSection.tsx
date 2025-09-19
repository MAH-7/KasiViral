import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "wouter";

const heroImages = [
  {
    src: "/figmaAssets/image-1.png",
    alt: "Thread Generation Example 1",
    className: "animate-float",
    style: { animationDelay: "0s" }
  },
  {
    src: "/figmaAssets/image-2.png",
    alt: "Thread Generation Example 2",
    className: "animate-float",
    style: { animationDelay: "1s" }
  },
  {
    src: "/figmaAssets/image-3.png",
    alt: "Thread Generation Example 3",
    className: "animate-float",
    style: { animationDelay: "2s" }
  },
  {
    src: "/figmaAssets/image-4.png",
    alt: "Thread Generation Example 4",
    className: "animate-float",
    style: { animationDelay: "3s" }
  },
];

export const HeroSection = (): JSX.Element => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30" id="hero">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="container-custom section-padding">
        <div className="text-center space-y-8 lg:space-y-12">
          {/* Headline */}
          <div className="space-y-4 animate-fade-up">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
              <span className="text-gradient">Generate viral threads</span>
              <br />
              <span className="text-foreground">in seconds</span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              AI-powered generator, performance-scored templates, and viral
              threads — ready to copy-paste across Facebook, LinkedIn, Twitter/X,
              and Threads.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Button
              size="lg"
              className="gradient-primary text-white hover:opacity-90 transition-all duration-300 hover:scale-105 group"
              asChild
              data-testid="button-hero-get-started"
            >
              <Link href="/login">
                <span className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 hover:bg-accent transition-all duration-300 hover:scale-105 group"
              asChild
              data-testid="button-hero-view-features"
            >
              <a href="#features" className="flex items-center gap-2">
                <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                View Features
              </a>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Threads Generated</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Engagement Rate</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">AI Powered</div>
            </div>
          </div>
        </div>

        {/* Hero Images - Infinite Carousel */}
        <div className="mt-16 lg:mt-24">
          <div className="overflow-hidden animate-fade-up" style={{ animationDelay: "0.6s" }}>
            <div 
              className="flex animate-marquee gap-6 lg:gap-8"
              style={{ 
                "--duration": "30s",
                "--gap": "2rem",
                width: "fit-content"
              } as React.CSSProperties}
            >
              {/* First set of images */}
              {heroImages.map((image, index) => (
                <div
                  key={`hero-image-${index}`}
                  className="relative group flex-shrink-0"
                >
                  <img
                    className="w-40 h-44 sm:w-48 sm:h-52 lg:w-60 lg:h-64 rounded-2xl object-cover shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                    alt={image.alt}
                    src={image.src}
                    loading="lazy"
                    data-testid={`hero-image-${index + 1}`}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {heroImages.map((image, index) => (
                <div
                  key={`hero-image-duplicate-${index}`}
                  className="relative group flex-shrink-0"
                >
                  <img
                    className="w-40 h-44 sm:w-48 sm:h-52 lg:w-60 lg:h-64 rounded-2xl object-cover shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                    alt={image.alt}
                    src={image.src}
                    loading="lazy"
                    data-testid={`hero-image-duplicate-${index + 1}`}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-16 animate-bounce-subtle">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
