export const formatOptions = [
  {
    label: "Best (Video + Audio)",
    value: "BEST",
    desc: "Highest available video and audio resolution",
  },
  {
    label: "Best Audio Only",
    value: "BESTAUDIO",
    desc: "Extract highest quality audio stream (MP3/M4A)",
  },
  {
    label: "Worst / Low Bandwidth",
    value: "WORST",
    desc: "Lowest resolution file to minimize bandwidth",
  },
];

export const defaultBrowserList = [
  { id: "firefox", name: "Mozilla Firefox (Default)", installed: true, icon: "logos:firefox" },
  { id: "auto", name: "Auto (Firefox Priority + Mix Others)", installed: true, icon: "tabler:browser" },
  { id: "brave", name: "Brave Browser", installed: false, icon: "logos:brave" },
  { id: "opera", name: "Opera", installed: false, icon: "logos:opera" },
  { id: "opera-gx", name: "Opera GX", installed: false, icon: "simple-icons:operagx" },
  { id: "vivaldi", name: "Vivaldi", installed: false, icon: "logos:vivaldi-icon" },
  { id: "zen", name: "Zen Browser", installed: false, icon: "simple-icons:firefoxbrowser" },
  { id: "floorp", name: "Floorp", installed: false, icon: "simple-icons:firefoxbrowser" },
  { id: "chrome", name: "Google Chrome", installed: false, icon: "logos:chrome" },
  { id: "edge", name: "Microsoft Edge", installed: false, icon: "logos:microsoft-edge" },
  { id: "chromium", name: "Chromium", installed: false, icon: "logos:chromium" },
  { id: "safari", name: "Apple Safari", installed: false, icon: "logos:safari" },
];

export const viewModeOptions = [
  { label: "YouTube Grid View (Default)", value: "grid" },
  { label: "Table Grid View", value: "table" },
];
