export const primeThemeMap = {
  light: "lara-light-blue",
  dark: "lara-dark-blue",
};

export const applyTheme = (isDark: boolean) => {
  const themeName = isDark ? "dark" : "light";
  const primeTheme = isDark ? primeThemeMap.dark : primeThemeMap.light;

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
