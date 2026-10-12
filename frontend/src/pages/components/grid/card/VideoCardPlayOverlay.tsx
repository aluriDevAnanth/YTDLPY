import { Icon } from "@iconify/react";

export function VideoCardPlayOverlay() {
  return (
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div className="size-9 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
        <Icon icon="tabler:play" className="text-lg ml-0.5" />
      </div>
    </div>
  );
}

export default VideoCardPlayOverlay;
