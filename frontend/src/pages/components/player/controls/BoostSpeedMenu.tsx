import { Menu } from "@vidstack/react";
import { SPEEDS } from "../playerConstants";
import { SpeedBadgeTrigger } from "./SpeedBadgeTrigger";
import { SpeedRadioItem } from "./SpeedRadioItem";

interface BoostSpeedMenuProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export function BoostSpeedMenu({
  speed,
  onSpeedChange,
}: BoostSpeedMenuProps) {
  return (
    <Menu.Root className="vds-menu">
      <SpeedBadgeTrigger speed={speed} />
      <Menu.Items
        className="vds-menu-items !min-w-fit !min-h-fit"
        placement="top"
        offset={0}
      >
        <Menu.RadioGroup className="vds-radio-group" value={speed.toString()}>
          {SPEEDS.map((s) => (
            <SpeedRadioItem
              key={s}
              speedValue={s}
              onSelect={() => onSpeedChange(s)}
            />
          ))}
        </Menu.RadioGroup>
      </Menu.Items>
    </Menu.Root>
  );
}

export default BoostSpeedMenu;
