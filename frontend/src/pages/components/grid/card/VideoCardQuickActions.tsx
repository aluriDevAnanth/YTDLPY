import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface VideoCardQuickActionsProps {
  isCopied: boolean;
  onCopyUrl: (e: React.MouseEvent) => void;
  onOpenMenuButton: (e: React.MouseEvent) => void;
}

export function VideoCardQuickActions({
  isCopied,
  onCopyUrl,
  onOpenMenuButton,
}: VideoCardQuickActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon
        onClick={onCopyUrl}
        icon={isCopied ? "tabler:check" : "tabler:copy"}
        className={`text-sm ${
          isCopied
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        } transition-colors cursor-pointer`}
      />
      <Button
        type="button"
        rounded
        text
        severity="secondary"
        onClick={onOpenMenuButton}
        className="!p-[1px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        title="Options Menu"
      >
        <Icon icon="tabler:dots-vertical" className="text-sm" />
      </Button>
    </div>
  );
}

export default VideoCardQuickActions;
