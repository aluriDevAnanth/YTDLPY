import { Dropdown } from "primereact/dropdown";

interface AuthStorageModeDropdownProps {
  authStorageMode: "session" | "local";
  setAuthStorageModeState: (mode: "session" | "local") => void;
}

export function AuthStorageModeDropdown({
  authStorageMode,
  setAuthStorageModeState,
}: AuthStorageModeDropdownProps) {
  return (
    <div className="flex flex-col gap-1.5 mt-1 pt-3 border-t border-gray-800/80">
      <label className="text-xs font-semibold text-gray-200 flex items-center justify-between">
        <span>Authentication Token Storage</span>
        <span className="text-[10px] text-cyan-400 font-mono">
          {authStorageMode === "session"
            ? "Cleared on Tab Close"
            : "Persistent (Local)"}
        </span>
      </label>
      <Dropdown
        value={authStorageMode}
        options={[
          {
            label: "Local Storage (Persistent across sessions)",
            value: "local",
          },
          {
            label: "Session Storage (Auto logout on tab close)",
            value: "session",
          },
        ]}
        onChange={(e) => setAuthStorageModeState(e.value)}
        className="w-full text-xs"
      />
    </div>
  );
}

export default AuthStorageModeDropdown;
