"use client";
import Script from "next/script";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: any;
      };
    };
    __gtInit: () => void;
  }
}


const languages = [
  { label: "English", value: "en" },
  { label: "Spanish", value: "es" },
];


const includedLanguages = languages.map((lang) => lang.value).join(",");

export function GoogleTranslate() {
  const [langCookie, setLangCookie] = React.useState("/auto/en");

  React.useEffect(() => {
    const match = document.cookie.match(/(^| )googtrans=([^;]+)/);
    const cookieVal = match ? decodeURIComponent(match[2]) : "/auto/en";
    setLangCookie(cookieVal);
  }, []);

  const initTranslate = () => {
    if (typeof window !== "undefined" && window.google?.translate?.TranslateElement) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    } else {
      setTimeout(initTranslate, 300);
    }
  };

  const applyTranslation = (lang: string) => {
    const interval = setInterval(() => {
      const frame = document.querySelector("iframe.goog-te-banner-frame");
      if (frame) frame.remove();
      document.body.style.top = "0px";
      document.body.style.marginTop = "0px";
      document.body.style.paddingTop = "0px";
      const element = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (element) {
        element.value = lang;
        element.dispatchEvent(new Event("change"));
        clearInterval(interval);
      }
    }, 100);
  };

  const onChange = (value: string) => {
    const cookieVal = `/auto/${value}`;
    document.cookie = `googtrans=${cookieVal}; path=/`;
    setLangCookie(cookieVal);
    window.location.reload();
  };

  React.useEffect(() => {
    const lang = langCookie.split("/")[2];
    if (lang) applyTranslation(lang);
  }, [langCookie]);

  return (
    <div>
      <div
        id="google_translate_element"
        style={{ visibility: "hidden", width: "1px", height: "1px" }}
      />
      <LanguageSelector onChange={onChange} value={langCookie} />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=__gtInit"
        strategy="afterInteractive"
        onLoad={() => {
          window.__gtInit = initTranslate;
        }}
      />
    </div>
  );
}

function LanguageSelector({
  onChange,
  value,
}: {
  onChange: (val: string) => void;
  value: string;
}) {
  const currentLang = value.split("/")[2] || "en";
  return (
    <Select onValueChange={onChange} value={currentLang}>
      <SelectTrigger className="w-full border border-gray-300 rounded-md p-2">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent className="z-[10000]">
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            <span>{lang.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
