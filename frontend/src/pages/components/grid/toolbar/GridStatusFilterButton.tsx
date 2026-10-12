interface GridStatusFilterButtonProps {
  status: string;
  isSelected: boolean;
  onSelect: (status: string) => void;
}

export function GridStatusFilterButton({
  status,
  isSelected,
  onSelect,
}: GridStatusFilterButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(status)}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer border-0 shrink-0 ${
        isSelected
          ? "bg-cyan-500 text-black font-bold shadow-xs"
          : "bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      {status}
    </button>
  );
}

export default GridStatusFilterButton;
