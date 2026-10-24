import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { applyTheme } from "./themeUtils";

export function ThemeSwitcher() {
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
}

export default ThemeSwitcher;
