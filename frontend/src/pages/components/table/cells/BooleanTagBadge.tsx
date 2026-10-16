import { Tag } from "primereact/tag";
import { memo } from "react";
import type { VideoT } from "src/schema";

interface BooleanTagBadgeProps {
  rowData: VideoT;
  field: keyof VideoT;
}

export const BooleanTagBadge = memo(({ rowData, field }: BooleanTagBadgeProps) => {
  const value =
    field === "downloaded"
      ? rowData["downloadStatus"] === "completed"
      : rowData[field];
  return (
    <Tag
      pt={{ value: { style: { lineHeight: "1" } } }}
      data-pr-tooltip={value ? "" : "Not " + field}
      data-pr-position="top"
      value={field[0].toUpperCase()}
      severity={value ? "success" : "danger"}
      className="text-black text-[9px] sm:text-[10px] font-mono tracking-wider px-1 py-0.5"
    />
  );
});

BooleanTagBadge.displayName = "BooleanTagBadge";

export default BooleanTagBadge;
