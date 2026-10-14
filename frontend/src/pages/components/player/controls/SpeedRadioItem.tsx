import { Icon } from "@iconify/react";
import { Menu } from "@vidstack/react";

interface SpeedRadioItemProps {
  speedValue: number;
  onSelect: () => void;
}

export function SpeedRadioItem({ speedValue, onSelect }: SpeedRadioItemProps) {
  return (
    <Menu.Radio
      value={speedValue.toString()}
      className="vds-radio"
      onSelect={onSelect}
    >
      <Icon
        icon="mdi:check"
        className="vds-icon"
        width={20}
        height={20}
      />
      <span>{speedValue}×</span>
    </Menu.Radio>
  );
}

export default SpeedRadioItem;
