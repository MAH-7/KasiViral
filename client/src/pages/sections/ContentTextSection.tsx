import { PlayIcon } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export const ContentTextSection = (): JSX.Element => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  return (
    <section className="section-padding" id="demo">
      <div className="container-custom">
        <div className="text-center mb-12 lg:mb-16 animate-fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            From <span className="text-gradient">"I have nothing to post"</span>{" "}
            to viral content
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Watch a real aspiring creator transform a simple topic into a thread
            that gets shared, liked, and remembered
          </p>
        </div>

        <div
          className="flex justify-center animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Card className="w-full max-w-4xl gradient-primary border-0 shadow-2xl card-hover">
            <CardContent className="flex items-center justify-center p-8 sm:p-12 lg:p-16 min-h-[300px] sm:min-h-[400px]">
              {!isVideoPlaying ? (
                <button
                  type="button"
                  aria-label="Play demo"
                  className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/90 backdrop-blur rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group focus:outline-none focus:ring-4 focus:ring-primary/50"
                  data-testid="button-demo-play"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <PlayIcon
                    className="w-6 h-6 sm:w-8 sm:h-8 text-primary ml-1 group-hover:ml-2 transition-all"
                    fill="currentColor"
                  />
                </button>
              ) : (
                <div className="w-full max-w-3xl aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/k001JX-D-dA?autoplay=1"
                    title="Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg shadow-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
