import { Column, type ColumnProps } from "primereact/column";
import type { VideoT } from "src/schema";
import { TableTagsCell } from "../cells/TableTagsCell";

interface TagsColumnProps extends ColumnProps {
  onTagDoubleClick?: (video: VideoT) => void;
}

export function TagsColumn({ onTagDoubleClick, ...props }: TagsColumnProps) {
  return (
    <Column
      header="Tags"
      body={(rowData: VideoT) => (
        <TableTagsCell rowData={rowData} onTagDoubleClick={onTagDoubleClick} />
      )}
      {...props}
    />
  );
}

export default TagsColumn;
