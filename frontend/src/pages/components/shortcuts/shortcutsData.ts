export interface ShortcutItem {
  keys: string[];
  description: string;
  category: "Navigation" | "Actions" | "Player";
  badge?: string;
}

export const SHORTCUTS_DATA: ShortcutItem[] = [
  // Navigation
  {
    keys: ["Alt", "1"],
    description: "Go to Home / All Downloads",
    category: "Navigation",
  },
  {
    keys: ["Alt", "H"],
    description: "Go to Home (Alternative)",
    category: "Navigation",
  },
  {
    keys: ["1"],
    description: "Quick Home Switch (when not typing)",
    category: "Navigation",
  },
  {
    keys: ["Alt", "2"],
    description: "Go to Watch Later",
    category: "Navigation",
  },
  {
    keys: ["Alt", "W"],
    description: "Go to Watch Later (Alternative)",
    category: "Navigation",
  },
  {
    keys: ["2"],
    description: "Quick Watch Later Switch (when not typing)",
    category: "Navigation",
  },
  {
    keys: ["Alt", "3"],
    description: "Open Playlists / Playlist Studio",
    category: "Navigation",
  },
  {
    keys: ["Alt", "P"],
    description: "Open Playlists (Alternative)",
    category: "Navigation",
  },
  {
    keys: ["3"],
    description: "Quick Playlists Switch (when not typing)",
    category: "Navigation",
  },
  {
    keys: ["Alt", "4"],
    description: "Go to Toast Studio Sandbox",
    category: "Navigation",
  },
  {
    keys: ["Alt", "U"],
    description: "Go to Toast Studio (Alternative)",
    category: "Navigation",
  },
  {
    keys: ["4"],
    description: "Quick Toast Studio Switch (when not typing)",
    category: "Navigation",
  },
  {
    keys: ["Alt", "5"],
    description: "Open Admin Dashboard (Admins)",
    category: "Navigation",
    badge: "Admin",
  },
  {
    keys: ["Alt", "A"],
    description: "Open Admin Dashboard (Alternative)",
    category: "Navigation",
    badge: "Admin",
  },
  {
    keys: ["5"],
    description: "Quick Admin Switch (when not typing)",
    category: "Navigation",
    badge: "Admin",
  },
  {
    keys: ["Alt", "M"],
    description: "Open Storage & Cleanup Manager",
    category: "Navigation",
  },
  {
    keys: ["Ctrl", "Shift", "M"],
    description: "Open Storage Manager (Alternative)",
    category: "Navigation",
  },
  {
    keys: ["Home"],
    description: "Smooth Scroll to Top of Page",
    category: "Navigation",
  },
  {
    keys: ["End"],
    description: "Smooth Scroll to Bottom of Page",
    category: "Navigation",
  },

  // Actions
  {
    keys: ["Ctrl", "N"],
    description: "Add New Video Download",
    category: "Actions",
    badge: "Global",
  },
  {
    keys: ["Alt", "N"],
    description: "Add New Download (Alternative)",
    category: "Actions",
  },
  {
    keys: ["N"],
    description: "Quick Add Download (when not typing)",
    category: "Actions",
  },
  {
    keys: ["Ctrl", "K"],
    description: "Focus Global Search Bar",
    category: "Actions",
  },
  {
    keys: ["Ctrl", "F"],
    description: "Find / Search Videos",
    category: "Actions",
  },
  {
    keys: ["/"],
    description: "Quick Search Bar Focus (when not typing)",
    category: "Actions",
  },
  {
    keys: ["Alt", "C"],
    description: "Clear Search Query & Filters",
    category: "Actions",
  },
  {
    keys: ["Ctrl", ","],
    description: "Open Settings Dialog",
    category: "Actions",
  },
  {
    keys: ["Alt", "S"],
    description: "Alternate Settings Shortcut",
    category: "Actions",
  },
  {
    keys: ["Alt", "V"],
    description: "Toggle Grid / Table View Mode",
    category: "Actions",
  },
  {
    keys: ["V"],
    description: "Quick View Switch (when not typing)",
    category: "Actions",
  },
  {
    keys: ["Alt", "T"],
    description: "Toggle Dark / Light Theme",
    category: "Actions",
  },
  {
    keys: ["T"],
    description: "Quick Theme Toggle (when not typing)",
    category: "Actions",
  },
  {
    keys: ["D"],
    description: "Quick Dark / Light Toggle (when not typing)",
    category: "Actions",
  },
  {
    keys: ["Alt", "R"],
    description: "Refresh Downloads & Playlists",
    category: "Actions",
  },
  {
    keys: ["R"],
    description: "Quick Refresh Data (when not typing)",
    category: "Actions",
  },
  {
    keys: ["?"],
    description: "Open Keyboard Shortcuts Cheat Sheet",
    category: "Actions",
  },
  {
    keys: ["Ctrl", "/"],
    description: "Open Shortcuts Sheet (Alternative)",
    category: "Actions",
  },
  {
    keys: ["F1"],
    description: "Help & Shortcuts Sheet",
    category: "Actions",
  },
  {
    keys: ["Esc"],
    description: "Close Open Dialogs / Clear Search Focus",
    category: "Actions",
  },

  // Player
  {
    keys: ["Space"],
    description: "Play / Pause Video",
    category: "Player",
  },
  {
    keys: ["K"],
    description: "Alternate Play / Pause",
    category: "Player",
  },
  {
    keys: ["F"],
    description: "Toggle Fullscreen Mode",
    category: "Player",
  },
  {
    keys: ["M"],
    description: "Mute / Unmute Audio",
    category: "Player",
  },
  {
    keys: ["I"],
    description: "Toggle Picture-in-Picture (PiP)",
    category: "Player",
  },
  {
    keys: ["C"],
    description: "Toggle Captions / Subtitles",
    category: "Player",
  },
  {
    keys: ["←"],
    description: "Seek Backward 5 Seconds",
    category: "Player",
  },
  {
    keys: ["→"],
    description: "Seek Forward 5 Seconds",
    category: "Player",
  },
  {
    keys: ["J"],
    description: "Seek Backward 10 Seconds",
    category: "Player",
  },
  {
    keys: ["L"],
    description: "Seek Forward 10 Seconds",
    category: "Player",
  },
  {
    keys: ["↑"],
    description: "Volume Up (+10%)",
    category: "Player",
  },
  {
    keys: ["↓"],
    description: "Volume Down (-10%)",
    category: "Player",
  },
  {
    keys: ["D"],
    description: "Increase Playback Speed",
    category: "Player",
  },
  {
    keys: ["A"],
    description: "Decrease Playback Speed",
    category: "Player",
  },
  {
    keys: ["S"],
    description: "Reset Playback Speed to 1.0x",
    category: "Player",
  },
  {
    keys: ["W"],
    description: "Toggle Fast Playback Speed Preset",
    category: "Player",
  },
  {
    keys: ["0", "–", "9"],
    description: "Jump to 0% – 90% of Video Timeline",
    category: "Player",
  },
  {
    keys: ["Esc"],
    description: "Exit Video Player",
    category: "Player",
  },
];
