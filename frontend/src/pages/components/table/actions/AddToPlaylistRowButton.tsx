import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface AddToPlaylistRowButtonProps {
  onClick: () => void;
}

export function AddToPlaylistRowButton({ onClick }: AddToPlaylistRowButtonProps) {
  return (
    <Button
      onClick={onClick}
      severity="secondary"
      className="px-1.5 py-1 p-button-sm"
      tooltip="Save to Playlist"
      tooltipOptions={{ position: "top" }}
    >
      <Icon icon="tabler:playlist" className="text-lg" />
    </Button>
  );
}

export default AddToPlaylistRowButton;
