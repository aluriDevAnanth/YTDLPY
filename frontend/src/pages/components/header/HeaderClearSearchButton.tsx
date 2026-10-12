import { Icon } from "@iconify/react";

interface HeaderClearSearchButtonProps {
  onClear: () => void;
}

export function HeaderClearSearchButton({ onClear }: HeaderClearSearchButtonProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="absolute right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs cursor-pointer border-0 bg-transparent"
      title="Clear Search (Esc)"
    >
      <Icon icon="tabler:x" className="text-base" />
    </button>
  );
}

export default HeaderClearSearchButton;
