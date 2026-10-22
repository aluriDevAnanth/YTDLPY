import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface RetryRowButtonProps {
  onClick: () => void;
}

export function RetryRowButton({ onClick }: RetryRowButtonProps) {
  return (
    <Button
      onClick={onClick}
      severity="info"
      className="px-1.5 py-1 p-button-sm"
      tooltip="Retry Download"
      tooltipOptions={{ position: "top" }}
    >
      <Icon icon="tabler:refresh" className="text-lg" />
    </Button>
  );
}

export default RetryRowButton;
