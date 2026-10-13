import { Icon } from "@iconify/react";
import { InputText } from "primereact/inputtext";

interface PlaylistManagerHeaderProps {
  count: number;
  globalFilterValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}

export function PlaylistManagerHeader({
  count,
  globalFilterValue,
  onSearchChange,
  onClearSearch,
}: PlaylistManagerHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-800 pt-3">
      <div className="flex items-center gap-2">
        <span className="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Playlists ({count})
        </span>
      </div>

      <div className="relative w-full sm:w-64">
        <Icon
          icon="tabler:search"
          className="absolute left-2.5 top-2.5 text-gray-400 text-sm pointer-events-none"
        />
        <InputText
          value={globalFilterValue}
          onChange={onSearchChange}
          placeholder="Search playlists..."
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl"
        />
        {globalFilterValue && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-2 top-2 text-gray-400 hover:text-white border-0 bg-transparent cursor-pointer"
          >
            <Icon icon="tabler:x" className="text-sm" />
          </button>
        )}
      </div>
    </div>
  );
}

export default PlaylistManagerHeader;
