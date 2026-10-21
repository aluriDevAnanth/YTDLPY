import { Tag } from "primereact/tag";

interface StorageWatchedTagProps {
  watched: boolean;
}

export function StorageWatchedTag({ watched }: StorageWatchedTagProps) {
  return (
    <Tag
      value={watched ? "WATCHED" : "UNWATCHED"}
      severity={watched ? "info" : "secondary"}
      className="text-black text-[9px] font-mono px-1 py-0.5"
    />
  );
}

export default StorageWatchedTag;
