import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ms' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2 text-sm font-medium hover:bg-accent/50 transition-colors"
      data-testid="language-toggle"
      title={language === 'en' ? 'Switch to Bahasa Malaysia' : 'Switch to English'}
    >
      <span className="text-lg leading-none" role="img" aria-label={language === 'en' ? 'English' : 'Bahasa Malaysia'}>
        {language === 'en' ? '🇺🇸' : '🇲🇾'}
      </span>
      <span className="text-xs uppercase font-semibold tracking-wide">
        {language === 'en' ? 'EN' : 'BM'}
      </span>
    </Button>
  );
}