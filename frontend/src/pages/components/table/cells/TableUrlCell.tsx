import { memo } from "react";
import type { VideoT } from "src/schema";
import { CopyUrlButton } from "./CopyUrlButton";
import { OpenUrlButton } from "./OpenUrlButton";

interface TableUrlCellProps {
  rowData: VideoT;
}

export const TableUrlCell = memo(({ rowData }: TableUrlCellProps) => {
  return (
    <div className="flex items-center gap-1">
      <OpenUrlButton rowData={rowData} />
      <CopyUrlButton rowData={rowData} />
    </div>
  );
});

TableUrlCell.displayName = "TableUrlCell";

export default TableUrlCell;
