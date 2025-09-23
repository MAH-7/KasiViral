import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, HelpCircle, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

export const HeaderSection = (): JSX.Element => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const { clearSubscriptionCache, isActive: hasActiveSubscription } = useSubscription();

  // Different navigation items based on login state
  const guestNavigationItems = [
    { label: "Features", href: "/#features", id: "features" },
    { label: "Pricing", href: "/#pricing", id: "pricing" },
    { label: "FAQ", href: "/#faq", id: "faq" },
  ];

  const loggedInNavigationItems = [
    { label: "Thread Writer", href: "/dashboard", id: "thread-writer" },
  ];

  const navigationItems = isLoggedIn ? loggedInNavigationItems : guestNavigationItems;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSectionClick = (e: React.MouseEvent, sectionId: string) => {
    // If we're already on homepage, just smooth scroll
    if (location === "/" && !isLoggedIn) {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    // Otherwise, let the Link component handle navigation
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Clear subscription cache before logging out
    clearSubscriptionCache();
    logout();
    setIsMobileMenuOpen(false);
  };

  // Determine where "Get Started" should redirect
  const getStartedHref = isLoggedIn 
    ? (hasActiveSubscription ? '/dashboard' : '/billing')
    : '/login';

  const getStartedText = isLoggedIn 
    ? (hasActiveSubscription ? 'Dashboard' : 'Complete Setup') 
    : 'Get Started';

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
            {isLoggedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm font-medium"
                  data-testid="button-help"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </Button>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-sm font-medium flex items-center space-x-2"
                    asChild
                    data-testid="button-user-profile"
                  >
                    <Link href="/settings">
                      <User className="w-4 h-4" />
                      <span>{user?.name || 'User'}</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-sm font-medium"
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
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
                  <Link href={getStartedHref}>{getStartedText}</Link>
                </Button>
              </>
            )}
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
                {isLoggedIn ? (
                  <>
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      data-testid="mobile-button-help"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      asChild
                      data-testid="mobile-button-user-profile"
                    >
                      <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                        <User className="w-4 h-4 mr-2" />
                        {user?.name || 'User'}
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={handleLogout}
                      data-testid="mobile-button-logout"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
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
                      <Link href={getStartedHref} onClick={() => setIsMobileMenuOpen(false)}>{getStartedText}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
