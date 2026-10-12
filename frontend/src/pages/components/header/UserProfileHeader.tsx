import type { User } from "src/store/useAppStore";
import ThemeSwitcher from "../ThemeSwitcher";

interface UserProfileHeaderProps {
  user: User | null;
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  return (
    <div className="flex justify-between gap-3 p-2 border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900/50 rounded-t-xl">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white font-black text-base flex items-center justify-center shadow-md uppercase shrink-0">
          {user?.username?.charAt(0) || "U"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
            {user?.username}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
            {user?.role} Account
          </span>
        </div>
      </div>
      <div className="my-auto">
        <ThemeSwitcher />
      </div>
    </div>
  );
}

export default UserProfileHeader;
