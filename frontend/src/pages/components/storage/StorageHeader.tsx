import { Icon } from "@iconify/react";
import { Tag } from "primereact/tag";
import { memo } from "react";
import type { UserStorageStats } from "src/store/useAppStore";

interface StorageHeaderProps {
  storageStats: UserStorageStats | null;
}

export const StorageHeader = memo(({ storageStats }: StorageHeaderProps) => {
  return (
    <div className="flex items-center gap-2 font-sans">
      <Icon icon="tabler:database" className="text-xl text-amber-400" />
      <span className="font-semibold text-base text-gray-100">
        Memory & Storage Manager
      </span>
      <Tag
        value={storageStats?.formatted_bytes || "0 B Used"}
        severity="warning"
        className="text-black text-[10px] font-mono tracking-wider ml-2"
      />
    </div>
  );
});

StorageHeader.displayName = "StorageHeader";
