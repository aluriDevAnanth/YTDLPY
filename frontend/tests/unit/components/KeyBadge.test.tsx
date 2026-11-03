import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { KeyBadge } from "src/pages/components/shortcuts/KeyBadge";

const datasets = [
  { keys: ["Ctrl", "K"], isMac: false, expected: ["Ctrl", "K"] },
  { keys: ["Ctrl", "K"], isMac: true, expected: ["⌘", "K"] },
  { keys: ["Alt", "D"], isMac: false, expected: ["Alt", "D"] },
  { keys: ["Alt", "D"], isMac: true, expected: ["⌥", "D"] },
  { keys: ["Shift", "Tab"], isMac: false, expected: ["Shift", "Tab"] },
  { keys: ["Space"], isMac: false, expected: ["Space"] },
  { keys: ["Esc"], isMac: true, expected: ["Esc"] },
  { keys: ["Ctrl", "Shift", "P"], isMac: false, expected: ["Ctrl", "Shift", "P"] },
  { keys: ["Ctrl", "Shift", "P"], isMac: true, expected: ["⌘", "Shift", "P"] },
  { keys: ["1", "–", "9"], isMac: false, expected: ["1", "–", "9"] },
];

describe("KeyBadge Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should render key badges correctly for [${data.keys.join(", ")}] (Mac: ${data.isMac})`, () => {
      render(<KeyBadge keys={data.keys} isMac={data.isMac} />);
      data.expected.forEach((exp) => {
        expect(screen.getByText(exp)).toBeInTheDocument();
      });
    });
  });
});
