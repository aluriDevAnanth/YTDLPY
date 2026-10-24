import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface LogsRowButtonProps {
  onClick: () => void;
}

export function LogsRowButton({ onClick }: LogsRowButtonProps) {
  return (
    <Button
      onClick={onClick}
      severity="help"
      className="px-1.5 py-1 p-button-sm"
      tooltip="View Execution Logs"
      tooltipOptions={{ position: "top" }}
    >
      <Icon icon="tabler:terminal-2" className="text-lg" />
    </Button>
  );
}

export default LogsRowButton;
