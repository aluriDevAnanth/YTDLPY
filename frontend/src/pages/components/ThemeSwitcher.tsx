import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";

const primereact = {
  light: "lara-light-blue",
  dark: "lara-dark-blue",
};

const ThemeSwitcher = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("YTDLP-X-GUI-THEME");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
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
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <Button
      type="button"
      onClick={toggleTheme}
      outlined
      severity="secondary"
      className="p-1.5 flex items-center justify-center cursor-pointer"
      tooltip={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      tooltipOptions={{ position: "bottom" }}
    >
      <Icon
        className="text-lg"
        icon={isDark ? "tabler:sun" : "tabler:moon"}
      />
    </Button>
  );
};

export default ThemeSwitcher;
