import React, { useEffect } from "react";
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
  // Handle hash scrolling when component mounts or hash changes
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash) {
        // Use requestAnimationFrame to ensure the component is fully rendered
        requestAnimationFrame(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }
    };

    // Scroll on mount if there's a hash
    scrollToHash();

    // Listen for hash changes
    window.addEventListener('hashchange', scrollToHash);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, []);

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
