import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const HeaderSection = (): JSX.Element => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img
              className="h-8 md:h-10 w-auto object-contain"
              alt="Logo"
              src="/figmaAssets/logo-2-1.png"
              data-testid="logo"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 hover:scale-105"
                data-testid={`nav-link-${item.label.toLowerCase()}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-sm font-medium"
              data-testid="button-login"
            >
              Login
            </Button>
            <Button 
              size="sm"
              className="gradient-primary text-white hover:opacity-90 transition-opacity"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden border-t animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid={`mobile-nav-link-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 px-3">
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  data-testid="mobile-button-login"
                >
                  Login
                </Button>
                <Button 
                  className="gradient-primary text-white justify-start"
                  data-testid="mobile-button-get-started"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
