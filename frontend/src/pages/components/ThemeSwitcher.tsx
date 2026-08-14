import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

const primereact = {
  light: "lara-light-blue",
  dark: "lara-dark-blue",
};

export const applyTheme = (isDark: boolean) => {
  const themeName = isDark ? "dark" : "light";
  const primeTheme = isDark ? primereact.dark : primereact.light;

  localStorage.setItem("YTDLP-X-GUI-THEME", themeName);
  document.documentElement.setAttribute("tw-data-theme", themeName);
  document.documentElement.setAttribute("data-theme", themeName);

  if (isDark) {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  } else {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }

  let themeLink = document.getElementById("primereact-theme") as HTMLLinkElement;
  if (!themeLink) {
    themeLink = document.createElement("link");
    themeLink.id = "primereact-theme";
    themeLink.rel = "stylesheet";
    document.head.appendChild(themeLink);
  }
  themeLink.href = `/themes/${primeTheme}/theme.css`;
};

/** Headless Theme Initializer Component (renders 0 DOM elements) */
export const ThemeInitializer = () => {
  useEffect(() => {
    const saved = localStorage.getItem("YTDLP-X-GUI-THEME");
    const isDark = saved ? saved === "dark" : true;
    applyTheme(isDark);
  }, []);
  return null;
};

const ThemeSwitcher = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("YTDLP-X-GUI-THEME");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div
      onClick={toggleTheme}
      className="p-1.5 flex items-center justify-center cursor-pointer"
    >
      <Icon
        className="text-lg"
        icon={isDark ? "tabler:sun" : "tabler:moon"}
      />
    </div>
  );
};

export default ThemeSwitcher;
