import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const TestimonialWallSection = (): JSX.Element => {
  const features = [
    {
      title: "Performance content",
      description: "Templates include engagement scores based on real data",
    },
    {
      title: "Topic suggestions",
      description: "Pre-populated ideas for instant inspiration and creation",
    },
    {
      title: "Proven viral formats",
      description: "Based on actual high-performing posts across platforms",
    },
    {
      title: "Anonymous usage",
      description:
        "Start instantly without registration or personal information",
    },
    {
      title: "One-click copy & paste",
      description: "Content is ready to post immediately, no editing required",
    },
    {
      title: "Multi-platform ready",
      description: "Optimized for Facebook, LinkedIn, Twitter/X, and Threads",
    },
  ];

  return (
    <section className="flex flex-col items-center justify-center gap-16 p-[120px] relative self-stretch w-full flex-[0_0_auto]">
      <header className="flex-col gap-4 flex items-start relative self-stretch w-full flex-[0_0_auto]">
        <h2 className="relative flex items-center justify-center self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-bold text-black text-5xl text-center tracking-[-0.96px] leading-[57.6px]">
          Why creators choose KasiViral
        </h2>

        <p className="relative flex items-center justify-center self-stretch [font-family:'Inter',Helvetica] font-medium text-[#0000008c] text-xl text-center tracking-[-0.10px] leading-[29px]">
          Everything you need to create viral content, nothing you don&#39;t.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-8 relative self-stretch w-full">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="h-[230px] border border-solid shadow-[0px_6px_12px_#00000008,0px_4px_8px_#00000005] bg-white rounded-2xl overflow-hidden border-[#0000001a]"
          >
            <CardContent className="p-8 flex flex-col items-start gap-8 h-full">
              <div className="flex items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                <h3 className="relative flex-1 mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#191919] text-2xl text-center tracking-[-0.48px] leading-6">
                  {feature.title}
                </h3>
              </div>

              <p className="relative flex items-center justify-center self-stretch [font-family:'Inter',Helvetica] font-medium text-black text-lg tracking-[-0.09px] leading-[26.1px]">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
