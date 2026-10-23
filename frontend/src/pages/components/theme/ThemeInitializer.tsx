import { useEffect } from "react";
import { applyTheme } from "./themeUtils";

/** Headless Theme Initializer Component (renders 0 DOM elements) */
export function ThemeInitializer() {
  useEffect(() => {
    const saved = localStorage.getItem("YTDLP-X-GUI-THEME");
    const isDark = saved ? saved === "dark" : true;
    applyTheme(isDark);
  }, []);

  return null;
}

export default ThemeInitializer;
