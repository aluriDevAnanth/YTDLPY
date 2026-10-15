import { InputSwitch } from "primereact/inputswitch";

interface AutoVttSwitchProps {
  autoVtt: boolean;
  setAutoVtt: (auto: boolean) => void;
}

export function AutoVttSwitch({ autoVtt, setAutoVtt }: AutoVttSwitchProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-950/60 border border-gray-800/80">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-gray-200">
          Generate Seeking Sprites (VTT)
        </span>
        <span className="text-[10px] text-gray-400">
          Parallel timeline thumbnail preview storyboard
        </span>
      </div>
      <InputSwitch
        checked={autoVtt}
        onChange={(e) => setAutoVtt(e.value || false)}
      />
    </div>
  );
}

export default AutoVttSwitch;
