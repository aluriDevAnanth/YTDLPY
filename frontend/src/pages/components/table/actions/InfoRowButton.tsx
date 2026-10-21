import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "primereact/button";

interface InfoRowButtonProps {
  onClick: () => void;
}

export function InfoRowButton({ onClick }: InfoRowButtonProps) {
  return (
    <Button
      onClick={onClick}
      severity="warning"
      className="px-1.5 py-1 p-button-sm"
      tooltip="Info"
      tooltipOptions={{ position: "top" }}
    >
      <Icon icon="tabler:info-circle" className="text-lg" />
    </Button>
  );
}

export default InfoRowButton;
