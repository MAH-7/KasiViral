import React from "react";

const footerLinks = [
  { text: "Terms of Service", href: "#" },
  { text: "Privacy Policy", href: "#" },
];

export const FooterSection = (): JSX.Element => {
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
              <a
                key={index}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`footer-link-${link.text.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>
        
        <div className="mt-6 lg:mt-8 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 KasiViral. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
