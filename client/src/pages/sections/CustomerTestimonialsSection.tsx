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
    <section className="flex flex-col items-center justify-center gap-12 px-[120px] py-12 relative self-stretch w-full flex-[0_0_auto]">
      <header className="flex-col gap-4 flex items-start relative self-stretch w-full flex-[0_0_auto]">
        <h2 className="relative flex items-center justify-center self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-bold text-black text-5xl text-center tracking-[-0.96px] leading-[57.6px]">
          Proven results
        </h2>

        <p className="relative flex items-center justify-center self-stretch [font-family:'Inter',Helvetica] font-medium text-[#0000008c] text-xl text-center tracking-[-0.10px] leading-[29px]">
          Real metrics from our users
        </p>
      </header>

      <div className="self-stretch w-full flex items-center justify-center gap-8 relative flex-[0_0_auto]">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className="flex flex-col min-w-[324px] items-start gap-4 pt-6 pb-0 px-0 relative flex-1 grow border-t [border-top-style:solid] border-[#00000026] bg-transparent shadow-none"
          >
            <CardContent className="p-0 w-full flex flex-col gap-4">
              <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#191919] text-2xl text-center tracking-[-0.48px] leading-6">
                {metric.value}
              </div>

              <div className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#191919] text-2xl text-center tracking-[-0.48px] leading-6">
                {metric.title}
              </div>

              <div className="relative flex items-center justify-center self-stretch [font-family:'Inter',Helvetica] font-medium text-[#0000008c] text-base text-center tracking-[-0.08px] leading-6">
                {metric.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
