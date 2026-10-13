import { Icon } from "@iconify/react";
import { Link } from "react-router";

interface UserProfileMenuItemProps {
  icon: string;
  iconColorClass?: string;
  label: string;
  to?: string;
  onClick?: () => void;
  shortcutBadge?: string;
}

export function UserProfileMenuItem({
  icon,
  iconColorClass = "text-gray-400",
  label,
  to,
  onClick,
  shortcutBadge,
}: UserProfileMenuItemProps) {
  const content = (
    <>
      <Icon icon={icon} className={`text-lg ${iconColorClass} shrink-0`} />
      <div className="flex items-center justify-between w-full pr-2">
        <span>{label}</span>
        {shortcutBadge && (
          <kbd className="px-1.5 py-0.2 text-[10px] font-mono text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 rounded border border-gray-300 dark:border-zinc-700">
            {shortcutBadge}
          </kbd>
        )}
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 dark:text-gray-200 w-full text-left font-medium no-underline hover:font-bold dark:hover:text-gray-400"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-gray-700 dark:text-gray-200 w-full text-left font-medium cursor-pointer border-0 hover:font-bold dark:hover:text-gray-400"
    >
      {content}
    </div>
  );
}

export default UserProfileMenuItem;
