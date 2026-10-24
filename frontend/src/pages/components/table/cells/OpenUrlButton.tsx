import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import type { VideoT } from "src/schema";

interface OpenUrlButtonProps {
  rowData: VideoT;
}

export function OpenUrlButton({ rowData }: OpenUrlButtonProps) {
  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        window.open(rowData.url, "_blank");
      }}
      className="p-1 p-button-sm shrink-0"
      severity="info"
      tooltip="Open Link"
      tooltipOptions={{ position: "top" }}
    >
      <Icon icon="tabler:external-link" className="text-base" />
    </Button>
  );
}

export default OpenUrlButton;
