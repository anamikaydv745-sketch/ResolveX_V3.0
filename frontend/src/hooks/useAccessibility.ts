import { useEffect, useState } from "react";

export type TextSize = "small" | "medium" | "large";
export type Theme = "light" | "dark" | "system";

interface AccessibilitySettings {
  dyslexiaFont: boolean;
  textSize: TextSize;
  theme: Theme;
}

const STORAGE_KEY = "accessibility-settings";

const defaultSettings: AccessibilitySettings = {
  dyslexiaFont: false,
  textSize: "medium",
  theme: "light",
};

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Apply dyslexia font
    if (settings.dyslexiaFont) {
      document.documentElement.classList.add("dyslexia-font");
    } else {
      document.documentElement.classList.remove("dyslexia-font");
    }

    // Apply text size
    document.documentElement.classList.remove("text-small", "text-large");
    if (settings.textSize === "small") {
      document.documentElement.classList.add("text-small");
    } else if (settings.textSize === "large") {
      document.documentElement.classList.add("text-large");
    }

    // Apply theme
    const applyTheme = (theme: Theme) => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.classList.toggle("dark", systemTheme === "dark");
      } else {
        document.documentElement.classList.toggle("dark", theme === "dark");
      }
    };

    applyTheme(settings.theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (settings.theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings]);

  const toggleDyslexiaFont = () => {
    setSettings((prev) => ({ ...prev, dyslexiaFont: !prev.dyslexiaFont }));
  };

  const setTextSize = (size: TextSize) => {
    setSettings((prev) => ({ ...prev, textSize: size }));
  };

  const setTheme = (theme: Theme) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  return {
    settings,
    toggleDyslexiaFont,
    setTextSize,
    setTheme,
  };
};
