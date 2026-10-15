import { Dropdown } from "primereact/dropdown";

interface CookieSourceDropdownProps {
  cookiesSource: string;
  setCookiesSource: (source: string) => void;
  cookieSourceOptions: any[];
}

export function CookieSourceDropdown({
  cookiesSource,
  setCookiesSource,
  cookieSourceOptions,
}: CookieSourceDropdownProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-200">
        Cookie Source
      </label>
      <Dropdown
        value={cookiesSource}
        options={cookieSourceOptions}
        onChange={(e) => setCookiesSource(e.value)}
        className="w-full text-xs bg-gray-950 border-gray-800 rounded-lg"
      />
    </div>
  );
}

export default CookieSourceDropdown;
