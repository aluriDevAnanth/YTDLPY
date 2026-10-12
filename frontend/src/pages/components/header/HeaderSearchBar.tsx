import { memo } from "react";
import { HeaderClearSearchButton } from "./HeaderClearSearchButton";
import { HeaderSearchInput } from "./HeaderSearchInput";

interface HeaderSearchBarProps {
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  isMac: boolean;
}

export const HeaderSearchBar = memo(
  ({ globalFilter, setGlobalFilter, isMac }: HeaderSearchBarProps) => {
    return (
      <div className="relative flex-1 max-w-full sm:max-w-md w-full flex items-center mx-1 sm:mx-4 my-1 sm:my-0">
        <HeaderSearchInput
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        {globalFilter ? (
          <HeaderClearSearchButton onClear={() => setGlobalFilter("")} />
        ) : (
          <span className="absolute right-2.5 pointer-events-none hidden sm:inline-flex items-center gap-0.5">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded shadow-xs">
              {isMac ? "⌘" : "Ctrl"}K
            </kbd>
          </span>
        )}
      </div>
    );
  },
);

HeaderSearchBar.displayName = "HeaderSearchBar";

export default HeaderSearchBar;
