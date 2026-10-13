import { Menu, Tooltip } from "@vidstack/react";

interface SpeedBadgeTriggerProps {
  speed: number;
}

export function SpeedBadgeTrigger({ speed }: SpeedBadgeTriggerProps) {
  return (
    <Menu.Button className="vds-menu-button vds-button !min-w-fit !p-0">
      <Tooltip.Root showDelay={0}>
        <Tooltip.Trigger asChild>
          <span className="font-bold p-3">{speed} X</span>
        </Tooltip.Trigger>
        <Tooltip.Content
          className="vds-tooltip-content"
          placement="top center"
        >
          Current Quick Boost Playback Rate
        </Tooltip.Content>
      </Tooltip.Root>
    </Menu.Button>
  );
}

export default SpeedBadgeTrigger;
