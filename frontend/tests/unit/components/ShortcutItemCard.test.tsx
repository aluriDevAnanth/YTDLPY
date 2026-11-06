import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ShortcutItemCard } from "src/pages/components/shortcuts/ShortcutItemCard";
import type { ShortcutItem } from "src/pages/components/shortcuts/shortcutsData";

const datasets: Array<{ item: ShortcutItem; isMac?: boolean }> = [
  { item: { keys: ["Ctrl", "K"], description: "Open Search Palette", category: "Navigation" }, isMac: false },
  { item: { keys: ["Ctrl", "K"], description: "Open Search Palette", category: "Navigation" }, isMac: true },
  { item: { keys: ["Ctrl", "N"], description: "Add New Download", category: "Actions", badge: "Pro" }, isMac: false },
  { item: { keys: ["Space"], description: "Play / Pause Video", category: "Player" }, isMac: false },
  { item: { keys: ["M"], description: "Mute / Unmute Audio", category: "Player" }, isMac: false },
  { item: { keys: ["F"], description: "Toggle Fullscreen Mode", category: "Player" }, isMac: false },
  { item: { keys: ["Alt", "S"], description: "Open Settings Dialog", category: "Navigation" }, isMac: false },
  { item: { keys: ["Esc"], description: "Close Active Modal", category: "Actions" }, isMac: false },
  { item: { keys: ["Ctrl", "Shift", "L"], description: "Open Log Viewer", category: "Actions", badge: "New" }, isMac: false },
  { item: { keys: ["J"], description: "Jump Backward 10s", category: "Player" }, isMac: false },
];

describe("ShortcutItemCard Unit Tests with 10 Datasets", () => {
  datasets.forEach(({ item, isMac }, index) => {
    it(`dataset #${index}: should render shortcut card: ${item.description}`, () => {
      render(<ShortcutItemCard item={item} isMac={isMac} />);
      expect(screen.getByText(item.description)).toBeInTheDocument();
      expect(screen.getByText(item.category)).toBeInTheDocument();
      if (item.badge) {
        expect(screen.getByText(item.badge)).toBeInTheDocument();
      }
    });
  });
});
