import { memo, useContext } from "react";
import type { VideoT } from "src/schema";
import { getAuthToken } from "src/store/useAppStore";
import { HoverContext } from "../preview/HoverContext";
import { BooleanTagBadge } from "./BooleanTagBadge";

interface TableTagsCellProps {
  rowData: VideoT;
  onTagDoubleClick?: (video: VideoT) => void;
}

export const TableTagsCell = memo(
  ({ rowData, onTagDoubleClick }: TableTagsCellProps) => {
    const hoverCtx = useContext(HoverContext);

    const handleMouseEnter = (event: React.MouseEvent) => {
      if (!hoverCtx) return;
      const rect = event.currentTarget.getBoundingClientRect();
      hoverCtx.setHoveredThumbnail({
        url: `${
          import.meta.env.VITE_FILE_BASE_URL ||
          "http://localhost:8000/api/files/"
        }${rowData.id}_thumbnail?token=${getAuthToken() || ""}`,
        x: rect.right + 60,
        y: rect.top,
      });
    };

    const handleMouseLeave = () => {
      if (hoverCtx) hoverCtx.setHoveredThumbnail(null);
    };

    return (
      <div
        className="flex gap-2 cursor-pointer select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onTagDoubleClick?.(rowData);
        }}
      >
        <BooleanTagBadge rowData={rowData} field="watched" />
        <BooleanTagBadge rowData={rowData} field="downloaded" />
      </div>
    );
  },
);

TableTagsCell.displayName = "TableTagsCell";

export default TableTagsCell;
