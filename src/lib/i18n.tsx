"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

// Bengali translations. Keys are the English source strings; missing keys fall back to English.
const BN: Record<string, string> = {
  // nav groups
  Main: "মূল", Content: "কনটেন্ট", Connect: "কানেক্ট", Optional: "অতিরিক্ত",
  // nav items
  Overview: "ওভারভিউ", Profile: "প্রোফাইল", About: "সম্পর্কে", Contact: "যোগাযোগ",
  "Resume / CV": "রেজিউমে / সিভি", Projects: "প্রজেক্ট", Skills: "স্কিল",
  Experience: "অভিজ্ঞতা", Education: "শিক্ষা", "Social links": "সোশ্যাল লিংক",
  Services: "সার্ভিস", Certifications: "সার্টিফিকেশন", Achievements: "অ্যাচিভমেন্ট",
  Testimonials: "টেস্টিমোনিয়াল", Publications: "প্রকাশনা", Gallery: "গ্যালারি",
  Videos: "ভিডিও", Templates: "টেমপ্লেট", Customize: "কাস্টমাইজ", Analytics: "অ্যানালিটিক্স",
  "SEO / Sharing": "এসইও / শেয়ারিং", Messages: "মেসেজ", "Contact inbox": "কন্টাক্ট ইনবক্স",
  Notifications: "নোটিফিকেশন", Upgrade: "আপগ্রেড", Settings: "সেটিংস", Admin: "অ্যাডমিন",
  // common actions
  Save: "সেভ", Cancel: "বাতিল", Delete: "ডিলিট", Edit: "এডিট", Add: "যোগ করুন",
  Publish: "পাবলিশ", Unpublish: "আনপাবলিশ", "Preview draft": "ড্রাফট প্রিভিউ",
  "Sign out": "সাইন আউট", Loading: "লোড হচ্ছে…", Published: "পাবলিশড", Draft: "ড্রাফট",
  Language: "ভাষা",
};

const DICT: Record<Lang, Record<string, string>> = { en: {}, bn: BN };

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; }
const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const l = localStorage.getItem("folio_lang");
      if (l === "en" || l === "bn") setLangState(l);
    } catch { /* ignore */ }
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("folio_lang", l); } catch { /* ignore */ }
    try { document.documentElement.lang = l; } catch { /* ignore */ }
  };
  const t = (k: string) => DICT[lang][k] ?? DICT.en[k] ?? k;
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useT = () => useContext(LangContext).t;
export const useLang = () => useContext(LangContext);
