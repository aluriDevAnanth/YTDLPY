import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface ShortcutsHelpButtonProps {
  onClick: () => void;
}

export function ShortcutsHelpButton({ onClick }: ShortcutsHelpButtonProps) {
  return (
    <Button
      onClick={onClick}
      severity="secondary"
      outlined
      className="p-button-sm p-1.5 !border-gray-200 dark:!border-gray-800 !text-gray-600 dark:!text-gray-300 hover:!bg-gray-100 dark:hover:!bg-gray-800"
      tooltip="Keyboard Shortcuts (?)"
      tooltipOptions={{ position: "bottom" }}
    >
      <Icon icon="tabler:keyboard" className="text-lg text-cyan-500" />
    </Button>
  );
}

export default ShortcutsHelpButton;
