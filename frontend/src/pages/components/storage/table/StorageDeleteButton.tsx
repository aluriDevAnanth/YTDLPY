import { Button } from "primereact/button";
import type { VideoT } from "src/schema";

interface StorageDeleteButtonProps {
  video: VideoT;
  onDelete: (video: VideoT) => void;
}

export function StorageDeleteButton({
  video,
  onDelete,
}: StorageDeleteButtonProps) {
  return (
    <Button
      icon="pi pi-trash"
      severity="danger"
      outlined
      className="p-button-sm py-1 px-2 border-0"
      onClick={() => onDelete(video)}
    />
  );
}

export default StorageDeleteButton;
