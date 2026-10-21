import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "primereact/button";

interface DeleteRowButtonProps {
  onClick: () => void;
}

export function DeleteRowButton({ onClick }: DeleteRowButtonProps) {
  return (
    <Button
      onClick={onClick}
      severity="danger"
      className="px-1.5 py-1 p-button-sm"
      tooltip="Delete"
      tooltipOptions={{ position: "top" }}
    >
      <Icon icon="tabler:trash" className="text-lg" />
    </Button>
  );
}

export default DeleteRowButton;
