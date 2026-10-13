import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

interface PlayAllButtonProps {
  onClick: () => void;
}

export function PlayAllButton({ onClick }: PlayAllButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="!bg-cyan-500 hover:!bg-cyan-400 !text-black font-bold !border-0 text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition-all"
    >
      <Icon icon="tabler:player-play-filled" className="text-base" />
      <span>Play All</span>
    </Button>
  );
}

export default PlayAllButton;
