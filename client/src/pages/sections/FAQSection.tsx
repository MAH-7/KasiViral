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
      question: "I'm not a natural writer. Will this actually help me?",
      answer: "That's exactly who we built this for! You don't need to be a writer. Just tell KasiViral your basic idea - even if it's just 'tips for saving money' - and watch it transform into an engaging thread that sounds authentically you.",
    },
    {
      question: "How is this different from just using ChatGPT?",
      answer: "ChatGPT gives you generic content. KasiViral is trained specifically on viral Malaysian and international threads, understands social media psychology, and creates content optimized for engagement - not just information.",
    },
    {
      question: "Can I really create content in Bahasa Melayu?",
      answer: "Absolutely! KasiViral speaks natural Malaysian BM - not the stiff, textbook version. It understands our slang, cultural references, and how Malaysians actually communicate on social media.",
    },
    {
      question: "What if I don't like what it generates?",
      answer: "Hit regenerate! Every click gives you a completely different angle, tone, and style for the same topic. Think of it as having 5 different copywriters brainstorming for you.",
    },
    {
      question: "Is RM20/month worth it for a content tool?",
      answer: "Compare it to hiring a content writer (RM500+ per month) or spending 2-3 hours daily struggling with posts. KasiViral pays for itself if it saves you just 1 hour per week. Plus, you can cancel anytime.",
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
            <span className="text-gradient">Still wondering if this is for you?</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            These are the real questions aspiring creators ask us
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