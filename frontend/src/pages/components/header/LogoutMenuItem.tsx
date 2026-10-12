import { Icon } from "@iconify/react";

interface LogoutMenuItemProps {
  onLogout: () => void;
}

export function LogoutMenuItem({ onLogout }: LogoutMenuItemProps) {
  return (
    <div
      onClick={onLogout}
      className="flex items-center gap-3 px-3 py-1 text-sm rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-colors w-full text-left font-semibold cursor-pointer border-0"
    >
      <Icon icon="tabler:logout" className="text-lg shrink-0" />
      <span>Sign Out</span>
    </div>
  );
}

export default LogoutMenuItem;
