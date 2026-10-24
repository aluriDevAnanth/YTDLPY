import { memo } from "react";
import type { HoverState } from "./HoverContext";

interface ThumbnailPreviewProps {
  hoveredThumbnail: HoverState;
}

export const ThumbnailPreview = memo(({ hoveredThumbnail }: ThumbnailPreviewProps) => {
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  const previewWidth = Math.min(0.8 * windowWidth, 720);
  const { url, x } = hoveredThumbnail;
  const adjustedX =
    x + previewWidth > windowWidth
      ? Math.max(10, windowWidth - previewWidth - 100)
      : Math.max(10, x);

  return (
    <div
      className="z-50 fixed pointer-events-none shadow-xl rounded-md top-1/10 bg-black/80 p-1 border border-gray-700 max-w-[90vw]"
      style={{
        left: `${adjustedX}px`,
        width: `${previewWidth}px`,
        height: "auto",
      }}
    >
      <img
        src={url}
        alt="Video thumbnail"
        className="w-full h-auto object-contain rounded"
      />
    </div>
  );
});

ThumbnailPreview.displayName = "ThumbnailPreview";

export default ThumbnailPreview;
