import { Icon } from "@iconify/react";

interface PlaylistBannerIconProps {
  isDefault: boolean;
}

export function PlaylistBannerIcon({ isDefault }: PlaylistBannerIconProps) {
  return (
    <div
      className={`size-14 sm:size-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
        isDefault
          ? "bg-gradient-to-br from-amber-500 to-orange-600 text-black"
          : "bg-gradient-to-br from-cyan-500 to-blue-600 text-black"
      }`}
    >
      <Icon
        icon={isDefault ? "tabler:clock" : "tabler:playlist"}
        className="text-3xl sm:text-4xl stroke-[2]"
      />
    </div>
  );
}

export default PlaylistBannerIcon;
