import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQSection = (): JSX.Element => {
  const faqs = [
    {
      question: "What is KasiViral?",
      answer: "KasiViral helps you create viral social media threads using AI, proven templates, and a viral threads.",
    },
    {
      question: "What do I need to sign up?",
      answer: "Just your email address and a password (8+ characters).",
    },
    {
      question: "Do you support direct posting?",
      answer: "Not yet - KasiViral focuses on content creation; native scheduling is on our roadmap.",
    },
  ];

  return (
    <section className="section-padding relative overflow-hidden" id="faq">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-400/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2.5s" }}></div>
      </div>

      <div className="container-custom">
        <div className="text-center mb-12 lg:mb-16 animate-fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient">Frequently Asked Questions</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Everything you need to know about KasiViral
          </p>
        </div>

        <div className="max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card/50 backdrop-blur border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-6 py-2 card-hover"
                style={{ animationDelay: `${0.1 * index}s` }}
                data-testid={`faq-item-${index}`}
              >
                <AccordionTrigger 
                  className="text-left hover:no-underline text-lg sm:text-xl font-semibold text-foreground py-6"
                  data-testid={`faq-trigger-${index}`}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent 
                  className="text-base sm:text-lg text-muted-foreground leading-relaxed pb-6"
                  data-testid={`faq-content-${index}`}
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};