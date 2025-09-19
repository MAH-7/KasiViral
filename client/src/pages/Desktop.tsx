import React from "react";
import { ContentTextSection } from "./sections/ContentTextSection";
import { CustomerTestimonialsSection } from "./sections/CustomerTestimonialsSection";
import { FAQSection } from "./sections/FAQSection";
import { FooterSection } from "./sections/FooterSection";
import { HeaderSection } from "./sections/HeaderSection";
import { HeroSection } from "./sections/HeroSection";
import { PricingSection } from "./sections/PricingSection";
import { TestimonialWallSection } from "./sections/TestimonialWallSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";

export const Desktop = (): JSX.Element => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <HeaderSection />
      <main className="flex-1">
        <HeroSection />
        <div id="features">
          <ContentTextSection />
          <CustomerTestimonialsSection />
          <TestimonialsSection />
          <TestimonialWallSection />
        </div>
        <PricingSection />
        <FAQSection />
      </main>
      <FooterSection />
    </div>
  );
};
