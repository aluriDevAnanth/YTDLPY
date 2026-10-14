import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import type { PlaylistT } from "src/schema";

interface PlaylistRowActionsProps {
  playlist: PlaylistT;
  isActive: boolean;
  onView: () => void;
  onDelete: () => void;
}

export function PlaylistRowActions({
  playlist,
  isActive,
  onView,
  onDelete,
}: PlaylistRowActionsProps) {
  return (
    <div className="flex items-center gap-1.5 justify-end">
      <Button
        severity={isActive ? "success" : "secondary"}
        outlined={!isActive}
        size="small"
        onClick={onView}
        tooltip={isActive ? "Currently Viewing" : "Open Playlist"}
        className="text-xs px-2.5 py-1 rounded-lg"
      >
        <Icon
          icon={isActive ? "tabler:check" : "tabler:eye"}
          className="mr-1 text-sm"
        />
        <span>{isActive ? "Active" : "View"}</span>
      </Button>

      {!playlist.is_default && (
        <Button
          severity="danger"
          text
          size="small"
          onClick={onDelete}
          tooltip="Delete Playlist"
          className="p-1 rounded-lg hover:bg-red-500/10"
        >
          <Icon icon="tabler:trash" className="text-base text-red-400" />
        </Button>
      )}
    </div>
  );
}

export default PlaylistRowActions;
