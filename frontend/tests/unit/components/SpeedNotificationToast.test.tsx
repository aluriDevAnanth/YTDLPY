import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SpeedNotificationToast } from "src/pages/components/player/controls/SpeedNotificationToast";

const datasets = [
  { show: false, playbackRate: 1.0, shouldShow: false },
  { show: true, playbackRate: 1.0, shouldShow: true, expected: "🚀 1X SPEED" },
  { show: true, playbackRate: 1.25, shouldShow: true, expected: "🚀 1.25X SPEED" },
  { show: true, playbackRate: 1.5, shouldShow: true, expected: "🚀 1.5X SPEED" },
  { show: true, playbackRate: 1.75, shouldShow: true, expected: "🚀 1.75X SPEED" },
  { show: true, playbackRate: 2.0, shouldShow: true, expected: "🚀 2X SPEED" },
  { show: true, playbackRate: 2.5, shouldShow: true, expected: "🚀 2.5X SPEED" },
  { show: true, playbackRate: 3.0, shouldShow: true, expected: "🚀 3X SPEED" },
  { show: false, playbackRate: 4.0, shouldShow: false },
  { show: true, playbackRate: 4.0, shouldShow: true, expected: "🚀 4X SPEED" },
];

describe("SpeedNotificationToast Unit Tests with 10 Datasets", () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should handle show=${data.show} with speed=${data.playbackRate}X`, () => {
      render(<SpeedNotificationToast show={data.show} playbackRate={data.playbackRate} />);
      if (data.shouldShow) {
        expect(screen.getByText(data.expected!)).toBeInTheDocument();
      } else {
        expect(screen.queryByText(/X SPEED/i)).not.toBeInTheDocument();
      }
    });
  });
});
