import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { memo } from "react";

interface ViewModeToggleProps {
  viewMode: "table" | "grid";
  onToggleViewMode: () => void;
  isMac?: boolean;
  isMobile?: boolean;
}

export const ViewModeToggle = memo(
  ({
    viewMode,
    onToggleViewMode,
    isMac = false,
    isMobile = false,
  }: ViewModeToggleProps) => {
    if (isMobile) {
      return (
        <Button
          onClick={onToggleViewMode}
          severity="info"
          outlined
          aria-label="Toggle View Mode"
          tooltip="Toggle View (V)"
          className="p-button-sm !p-1"
        >
          <Icon
            icon={viewMode === "table" ? "tabler:layout-grid" : "tabler:table"}
            className="text-base"
          />
        </Button>
      );
    }

    return (
      <Button
        onClick={onToggleViewMode}
        severity="info"
        outlined
        className="p-button-sm p-1.5"
        tooltip={`Toggle View (${isMac ? "⌥V" : "Alt+V"})`}
        tooltipOptions={{ position: "bottom" }}
      >
        <Icon
          icon={viewMode === "table" ? "tabler:layout-grid" : "tabler:table"}
          className="text-lg"
        />
      </Button>
    );
  },
);

ViewModeToggle.displayName = "ViewModeToggle";
