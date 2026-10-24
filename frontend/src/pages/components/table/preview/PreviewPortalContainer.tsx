import { useContext, useEffect, useState } from "react";
import { HoverContext, type HoverState } from "./HoverContext";
import { ThumbnailPreview } from "./ThumbnailPreview";

export function PreviewPortalContainer() {
  const context = useContext(HoverContext);
  const [previewState, setPreviewState] = useState<HoverState | null>(null);

  useEffect(() => {
    if (context && context._registerSetter) {
      context._registerSetter(setPreviewState);
    }
  }, [context]);

  if (!previewState) return null;
  return <ThumbnailPreview hoveredThumbnail={previewState} />;
}

export default PreviewPortalContainer;
