interface VideoCardDurationBadgeProps {
  resolution?: string;
  durationString?: string;
}

export function VideoCardDurationBadge({
  resolution,
  durationString,
}: VideoCardDurationBadgeProps) {
  if (!resolution && !durationString) return null;

  return (
    <div className="absolute right-1.5 flex items-center gap-1 z-10 pointer-events-none bottom-1.5">
      {resolution && (
        <span className="bg-black/80 backdrop-blur-xs text-cyan-300 text-[10px] font-mono font-medium px-1 py-0.5 rounded shadow-xs">
          {resolution}
        </span>
      )}
      {durationString && (
        <span className="bg-black/85 backdrop-blur-xs text-white text-[10px] font-mono font-medium px-1 py-0.5 rounded shadow-xs">
          {durationString}
        </span>
      )}
    </div>
  );
}

export default VideoCardDurationBadge;
