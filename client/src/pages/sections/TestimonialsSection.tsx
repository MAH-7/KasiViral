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
    <section className="flex flex-col items-center justify-center gap-16 p-[120px] w-full">
      <div className="flex flex-col items-center justify-center gap-12 px-16 py-12 w-full">
        <div className="flex-col gap-4 flex items-start w-full">
          <h2 className="flex items-center justify-center w-full mt-[-1.00px] [font-family:'Inter',Helvetica] font-bold text-black text-5xl text-center tracking-[-0.96px] leading-[57.6px]">
            Why Creators Choose KasiViral
          </h2>

          <p className="flex items-center justify-center w-full [font-family:'Inter',Helvetica] font-medium text-[#0000008c] text-xl text-center tracking-[-0.10px] leading-[29px]">
            Streamlined from idea to publish across all major social platforms.
          </p>
        </div>

        <div className="w-[1040px] ml-[-51.00px] mr-[-51.00px] flex items-center justify-center gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="min-w-[324px] h-44 flex-1 grow border-0 border-t border-solid border-[#00000026] rounded-none bg-transparent shadow-none"
            >
              <CardContent className="flex flex-col items-start gap-4 pt-6 pb-0 px-0 h-full">
                <div className="w-full mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#191919] text-2xl text-center tracking-[-0.48px] leading-6">
                  {feature.emoji}
                </div>

                <h3 className="w-full [font-family:'Inter',Helvetica] font-normal text-[#191919] text-2xl text-center tracking-[-0.48px] leading-6">
                  {feature.title}
                </h3>

                <p className="flex items-center justify-center w-full [font-family:'Inter',Helvetica] font-medium text-[#0000008c] text-base text-center tracking-[-0.08px] leading-6">
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
