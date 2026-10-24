interface ToastOptionsCheckboxesProps {
  sticky: boolean;
  setSticky: (val: boolean) => void;
  closable: boolean;
  setClosable: (val: boolean) => void;
}

export function ToastOptionsCheckboxes({
  sticky,
  setSticky,
  closable,
  setClosable,
}: ToastOptionsCheckboxesProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={sticky}
          onChange={(e) => setSticky(e.target.checked)}
          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
        />
        Sticky (Persistent)
      </label>

      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={closable}
          onChange={(e) => setClosable(e.target.checked)}
          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
        />
        Closable
      </label>
    </div>
  );
}

export default ToastOptionsCheckboxes;
