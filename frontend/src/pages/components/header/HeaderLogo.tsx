import { Tag } from "primereact/tag";
import { memo } from "react";
import { Link } from "react-router";
import type { User } from "src/store/useAppStore";

interface HeaderLogoProps {
  user: User | null;
}

export const HeaderLogo = memo(({ user }: HeaderLogoProps) => {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Link
        to="/"
        className="font-bold text-base sm:text-xl text-gray-900 dark:text-white truncate shrink-0 hover:text-cyan-500 transition-colors no-underline"
      >
        YTDLPY
      </Link>
      {user?.role === "admin" && (
        <Tag
          value="ADMIN"
          severity="danger"
          className="text-white text-[9px] sm:text-[10px] font-mono tracking-wider px-1 py-0.5"
        />
      )}
    </div>
  );
});

HeaderLogo.displayName = "HeaderLogo";
