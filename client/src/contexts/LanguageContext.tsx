import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Language = "en" | "ms";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Translation constants
const translations = {
  en: {
    // Header/Navigation
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.faq": "FAQ",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.help": "Help",
    "nav.getStarted": "Get Started",
    "nav.dashboard": "Dashboard",
    "nav.completeSetup": "Complete Setup",
    "nav.threadWriter": "Thread Writer",

    // Hero Section
    "hero.headline1": "Staring at a blank post again?",
    "hero.headline2": "Your AI content partner is here",
    "hero.subtitle":
      'Stop struggling with "what should I post today?" KasiViral turns your random thoughts into viral threads that actually get engagement. In English or Bahasa Melayu. In seconds, not hours.',
    "hero.getStarted": "Get Started",
    "hero.goToDashboard": "Go to Dashboard",
    "hero.completeSubscription": "Complete Subscription",
    "hero.viewFeatures": "View Features",
    "hero.feature1Title": "Zero",
    "hero.feature1Subtitle": "Writer's Block",
    "hero.feature2Title": "2 Languages",
    "hero.feature2Subtitle": "English & BM",
    "hero.feature3Title": "30 Seconds",
    "hero.feature3Subtitle": "From Idea to Post",

    // Content/Demo Section
    "demo.headline1": "From",
    "demo.headline2": '"I have nothing to post"',
    "demo.headline3": "to viral content",
    "demo.subtitle":
      "Watch a real aspiring creator transform a simple topic into a thread that gets shared, liked, and remembered",

    // Pricing Section
    "pricing.headline": "Less than a",
    "pricing.headlineHighlight": "nasi lemak per day",
    "pricing.subtitle":
      "Stop letting great ideas die in your drafts folder. For less than your daily coffee, never run out of content again.",
    "pricing.mostPopular": "MOST POPULAR",
    "pricing.productName": "KasiViral PRO",
    "pricing.perMonth": "/ month",
    "pricing.feature1": "Never stare at a blank post again",
    "pricing.feature2": "Unlimited viral thread creation",
    "pricing.feature3": "Both English & Bahasa Melayu",
    "pricing.feature4": "Save your best threads forever",
    "pricing.feature5": "Cancel anytime — no drama, no questions",
    "pricing.getStartedNow": "Get Started Now",
    "pricing.goToDashboard": "Go to Dashboard",
    "pricing.completeSubscription": "Complete Subscription",
    "pricing.guarantee": "🔒 Secure payment • ❌ Cancel anytime",

    // FAQ Section
    "faq.headline": "Still wondering if this is for you?",
    "faq.subtitle": "These are the real questions aspiring creators ask us",
    "faq.q1": "I'm not a natural writer. Will this actually help me?",
    "faq.a1":
      "That's exactly who we built this for! You don't need to be a writer. Just tell KasiViral your basic idea - even if it's just 'tips for saving money' - and watch it transform into an engaging thread that sounds authentically you.",
    "faq.q2": "How is this different from just using ChatGPT?",
    "faq.a2":
      "ChatGPT gives you generic content. KasiViral is trained specifically on viral Malaysian and international threads, understands social media psychology, and creates content optimized for engagement - not just information.",
    "faq.q3": "Can I really create content in Bahasa Melayu?",
    "faq.a3":
      "Absolutely! KasiViral speaks natural Malaysian BM - not the stiff, textbook version. It understands our slang, cultural references, and how Malaysians actually communicate on social media.",
    "faq.q4": "What if I don't like what it generates?",
    "faq.a4":
      "Hit regenerate! Every click gives you a completely different angle, tone, and style for the same topic. Think of it as having 5 different copywriters brainstorming for you.",
    "faq.q5": "Is RM20/month worth it for a content tool?",
    "faq.a5":
      "Compare it to hiring a content writer (RM500+ per month) or spending 2-3 hours daily struggling with posts. KasiViral pays for itself if it saves you just 1 hour per week. Plus, you can cancel anytime.",

    // Footer Section
    "footer.termsOfService": "Terms of Service",
    "footer.privacyPolicy": "Privacy Policy",
    "footer.copyright": "© 2025 KasiViral. All rights reserved.",

    // TestimonialWall Section (Features)
    "features.headline": "Why creators choose",
    "features.subtitle": "Everything you need to create viral content, nothing you don't.",
    "features.performance.title": "Performance content",
    "features.performance.description": "Templates include engagement scores based on real data",
    "features.topics.title": "Topic suggestions", 
    "features.topics.description": "Pre-populated ideas for instant inspiration and creation",
    "features.viral.title": "Proven viral formats",
    "features.viral.description": "Based on actual high-performing posts across platforms",
    "features.anonymous.title": "Anonymous usage",
    "features.anonymous.description": "Start instantly without registration or personal information",
    "features.copy.title": "One-click copy & paste",
    "features.copy.description": "Content is ready to post immediately, no editing required",
    "features.multiplatform.title": "Multi-platform ready",
    "features.multiplatform.description": "Optimized for Facebook, LinkedIn, Twitter/X, and Threads",
  },
  ms: {
    // Header/Navigation
    "nav.features": "Ciri-Ciri",
    "nav.pricing": "Harga",
    "nav.faq": "Soalan Lazim",
    "nav.login": "Log Masuk",
    "nav.logout": "Log Keluar",
    "nav.help": "Bantuan",
    "nav.getStarted": "Mula Sekarang",
    "nav.dashboard": "Dashboard",
    "nav.completeSetup": "Lengkapkan Tetapan",
    "nav.threadWriter": "Penulis Thread",

    // Hero Section
    "hero.headline1": "Merenung skrin kosong lagi?",
    "hero.headline2": "Rakan kandungan AI anda di sini",
    "hero.subtitle":
      'Berhenti bergelut dengan "apa yang patut saya post hari ini?" KasiViral tukar idea rawak anda jadi thread viral yang benar-benar mendapat engagement. Dalam Bahasa Inggeris atau Bahasa Melayu. Dalam masa saat, bukan jam.',
    "hero.getStarted": "Mula Sekarang",
    "hero.goToDashboard": "Pergi ke Dashboard",
    "hero.completeSubscription": "Lengkapkan Langganan",
    "hero.viewFeatures": "Lihat Ciri-Ciri",
    "hero.feature1Title": "Sifar",
    "hero.feature1Subtitle": "Writer's Block",
    "hero.feature2Title": "2 Bahasa",
    "hero.feature2Subtitle": "Inggeris & BM",
    "hero.feature3Title": "30 Saat",
    "hero.feature3Subtitle": "Dari Idea ke Post",

    // Content/Demo Section
    "demo.headline1": "Dari",
    "demo.headline2": '"Tak tahu nak post apa"',
    "demo.headline3": "kepada kandungan viral",
    "demo.subtitle":
      "Tengok macam mana seorang creator tukar topik simple jadi thread yang orang share, like, dan ingat",

    // Pricing Section
    "pricing.headline": "Kurang dari harga",
    "pricing.headlineHighlight": "nasi lemak sehari",
    "pricing.subtitle":
      "Jangan biar idea bagus mati dalam draft folder. Dengan harga kurang dari kopi harian, tak akan kehabisan content lagi.",
    "pricing.mostPopular": "PALING POPULAR",
    "pricing.productName": "KasiViral PRO",
    "pricing.perMonth": "/ sebulan",
    "pricing.feature1": "Tak akan tatap skrin kosong lagi",
    "pricing.feature2": "Thread viral tanpa had",
    "pricing.feature3": "Bahasa Inggeris & Bahasa Melayu",
    "pricing.feature4": "Simpan thread terbaik selamanya",
    "pricing.feature5": "Batal bila-bila masa — takde drama",
    "pricing.getStartedNow": "Mula Sekarang",
    "pricing.goToDashboard": "Pergi ke Dashboard",
    "pricing.completeSubscription": "Lengkapkan Langganan",
    "pricing.guarantee": "🔒 Bayaran selamat  • ❌ Batal bila-bila masa",

    // FAQ Section
    "faq.headline": "Masih tertanya-tanya sesuai ke tak?",
    "faq.subtitle": "Ini soalan sebenar yang creator tanya kepada kami",
    "faq.q1": "Saya bukan penulis semulajadi. Betul ke boleh tolong?",
    "faq.a1":
      "Tu lah target kami! Anda tak perlu jadi penulis. Cuma bagitau KasiViral idea asas - walau sekadar 'tips jimat duit' - dan tengok ia bertukar jadi thread menarik yang bunyi macam anda sendiri.",
    "faq.q2": "Apa bezanya dengan guna ChatGPT je?",
    "faq.a2":
      "ChatGPT bagi content generic. KasiViral dilatih khusus untuk thread viral Malaysia dan antarabangsa, faham psikologi social media, dan cipta content untuk engagement - bukan sekadar maklumat.",
    "faq.q3": "Betul ke boleh buat content dalam Bahasa Melayu?",
    "faq.a3":
      "Mestilah! KasiViral cakap BM Malaysia yang natural - bukan versi buku teks kaku. Ia faham slang kita, rujukan budaya, dan cara orang Malaysia communicate dalam social media.",
    "faq.q4": "Kalau tak suka hasil yang dihasilkan?",
    "faq.a4":
      "Klik regenerate! Setiap klik bagi sudut pandang, tone, dan style berbeza untuk topik sama. Macam ada 5 copywriter berbeza brainstorm untuk anda.",
    "faq.q5": "RM20/bulan berbaloi ke untuk content tool?",
    "faq.a5":
      "Bandingkan dengan upah content writer (RM500+ sebulan) atau spend 2-3 jam sehari struggle dengan posts. KasiViral untung balik kalau jimat 1 jam seminggu. Plus, boleh cancel bila-bila masa.",

    // Footer Section
    "footer.termsOfService": "Terma Perkhidmatan",
    "footer.privacyPolicy": "Dasar Privasi",
    "footer.copyright": "© 2025 KasiViral. Hak cipta terpelihara.",

    // TestimonialWall Section (Features)
    "features.headline": "Kenapa creators pilih",
    "features.subtitle": "Semua yang anda perlukan untuk cipta kandungan viral, tak lebih tak kurang.",
    "features.performance.title": "Kandungan prestasi tinggi",
    "features.performance.description": "Template ada skor engagement berdasarkan data sebenar",
    "features.topics.title": "Cadangan topik", 
    "features.topics.description": "Idea siap sedia untuk inspirasi dan penghasilan segera",
    "features.viral.title": "Format viral terbukti",
    "features.viral.description": "Berdasarkan post berprestasi tinggi merentas platform",
    "features.anonymous.title": "Guna tanpa nama",
    "features.anonymous.description": "Mula terus tanpa daftar atau info peribadi",
    "features.copy.title": "Copy & paste sekali klik",
    "features.copy.description": "Kandungan ready nak post terus, tak payah edit",
    "features.multiplatform.title": "Siap untuk multi-platform",
    "features.multiplatform.description": "Dioptimumkan untuk Facebook, LinkedIn, Twitter/X, dan Threads",
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "kasiviral-language",
    ) as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ms")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("kasiviral-language", lang);
  };

  // Translation function
  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    );
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
