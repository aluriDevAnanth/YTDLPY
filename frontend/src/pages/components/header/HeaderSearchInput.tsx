import { Icon } from "@iconify/react";
import { InputText } from "primereact/inputtext";

interface HeaderSearchInputProps {
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
}

export function HeaderSearchInput({
  globalFilter,
  setGlobalFilter,
}: HeaderSearchInputProps) {
  return (
    <>
      <Icon
        icon="tabler:search"
        className="absolute left-3 text-gray-400 dark:text-gray-500 text-base pointer-events-none"
      />
      <InputText
        id="global-search-input"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search videos by title, URL, resolution..."
        className="w-full pl-9 pr-14 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 focus:border-cyan-500 rounded-xl transition-all"
      />
    </>
  );
}

export default HeaderSearchInput;
