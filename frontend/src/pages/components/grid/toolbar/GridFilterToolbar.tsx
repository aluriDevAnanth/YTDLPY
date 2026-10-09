import { memo } from "react";
import { GridStatusFilterButton } from "./GridStatusFilterButton";

interface GridFilterToolbarProps {
  statusFilter: string;
  onSelectStatusFilter: (status: string) => void;
}

const STATUS_OPTIONS = ["all", "downloading", "completed", "paused", "failed"];

export const GridFilterToolbar = memo(
  ({ statusFilter, onSelectStatusFilter }: GridFilterToolbarProps) => {
    return (
      <div className="w-full mb-4 flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {STATUS_OPTIONS.map((st) => (
            <GridStatusFilterButton
              key={st}
              status={st}
              isSelected={statusFilter === st}
              onSelect={onSelectStatusFilter}
            />
          ))}
        </div>
      </div>
    );
  },
);

GridFilterToolbar.displayName = "GridFilterToolbar";

export default GridFilterToolbar;
