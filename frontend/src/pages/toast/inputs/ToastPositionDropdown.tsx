import { Dropdown } from "primereact/dropdown";
import { type PositionType, positionOptions } from "../toastTestingTypes";

interface ToastPositionDropdownProps {
  position: PositionType;
  setPosition: (pos: PositionType) => void;
}

export function ToastPositionDropdown({
  position,
  setPosition,
}: ToastPositionDropdownProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        Display Position
      </label>
      <Dropdown
        value={position}
        options={positionOptions}
        onChange={(e) => setPosition(e.value)}
        className="w-full p-inputtext-sm rounded-xl"
      />
    </div>
  );
}

export default ToastPositionDropdown;
