import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const HeaderSection = (): JSX.Element => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navigationItems = [
    { label: "Features", href: "/#features", id: "features" },
    { label: "Pricing", href: "/#pricing", id: "pricing" },
    { label: "FAQ", href: "/#faq", id: "faq" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSectionClick = (e: React.MouseEvent, sectionId: string) => {
    // If we're already on homepage, just smooth scroll
    if (location === "/") {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    // Otherwise, let the Link component handle navigation to homepage
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <img
                className="h-8 md:h-10 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                alt="Logo"
                src="/figmaAssets/logo-2-1.png"
                data-testid="logo"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <span
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 hover:scale-105 cursor-pointer"
                  data-testid={`nav-link-${item.label.toLowerCase()}`}
                  onClick={(e) => handleSectionClick(e, item.id)}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-sm font-medium"
              asChild
              data-testid="button-login"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button 
              size="sm"
              className="gradient-primary text-white hover:opacity-90 transition-opacity"
              asChild
              data-testid="button-get-started"
            >
              <Link href="/register">Get Started</Link>
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
                <Link key={index} href={item.href}>
                  <span
                    className="block px-3 py-2 text-base font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors cursor-pointer"
                    onClick={(e) => handleSectionClick(e, item.id)}
                    data-testid={`mobile-nav-link-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 px-3">
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  asChild
                  data-testid="mobile-button-login"
                >
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                </Button>
                <Button 
                  className="gradient-primary text-white justify-start"
                  asChild
                  data-testid="mobile-button-get-started"
                >
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
