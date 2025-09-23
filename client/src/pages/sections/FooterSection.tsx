import React from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export const FooterSection = (): JSX.Element => {
  const { t } = useLanguage();

  const footerLinks = [
    { text: t('footer.termsOfService'), href: "/terms" },
    { text: t('footer.privacyPolicy'), href: "#" },
  ];
  return (
    <footer className="border-t bg-muted/30">
      <div className="container-custom py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-0">
          <div className="flex items-center">
            <img
              className="h-8 md:h-10 w-auto object-contain"
              alt="Logo"
              src="/figmaAssets/logo-2-1.png"
              data-testid="footer-logo"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            {footerLinks.map((link, index) => (
              link.href === "#" ? (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid={`footer-link-${link.text.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.text}
                </a>
              ) : (
                <Link key={index} href={link.href}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        data-testid={`footer-link-${link.text.toLowerCase().replace(/\s+/g, '-')}`}>
                    {link.text}
                  </span>
                </Link>
              )
            ))}
          </div>
        </div>
        
        <div className="mt-6 lg:mt-8 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};
