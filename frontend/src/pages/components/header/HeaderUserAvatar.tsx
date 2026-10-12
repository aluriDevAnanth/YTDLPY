import type { User } from "src/context/authStore";

interface HeaderUserAvatarProps {
  user: User | null;
  onClick: (e: React.MouseEvent) => void;
  isMobile?: boolean;
}

export function HeaderUserAvatar({
  user,
  onClick,
  isMobile,
}: HeaderUserAvatarProps) {
  const initial = user?.username?.charAt(0) || "U";

  if (isMobile) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="size-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-black text-xs flex items-center justify-center shadow-md uppercase cursor-pointer border-0 ring-2 ring-cyan-500/30"
      >
        {initial}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="size-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-black text-sm flex items-center justify-center shadow-md uppercase cursor-pointer border-0 hover:ring-2 hover:ring-cyan-400 hover:scale-105 transition-all ml-1"
      title={`${user?.username} (${user?.role})`}
    >
      {initial}
    </button>
  );
}

export default HeaderUserAvatar;
