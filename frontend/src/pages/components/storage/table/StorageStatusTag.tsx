import { Tag } from "primereact/tag";

interface StorageStatusTagProps {
  status: string;
}

export function StorageStatusTag({ status }: StorageStatusTagProps) {
  return (
    <Tag
      value={status.toUpperCase()}
      severity={
        status === "completed"
          ? "success"
          : status === "downloading"
            ? "info"
            : "danger"
      }
      className="text-black text-[9px] font-mono px-1 py-0.5"
    />
  );
}

export default StorageStatusTag;
