import { Icon } from "@iconify/react";

interface VideoCardWatchedBadgeProps {
  watched?: boolean;
}

export function VideoCardWatchedBadge({ watched }: VideoCardWatchedBadgeProps) {
  if (!watched) return null;

  return (
    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10 pointer-events-none">
      <Icon
        icon="tabler:eye"
        fontSize={24}
        className="text-cyan-400 drop-shadow-md p-1 bg-black/50 rounded-lg"
      />
    </div>
  );
}

export default VideoCardWatchedBadge;
