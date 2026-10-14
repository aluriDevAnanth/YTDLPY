import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";

interface BrowserCookiesFormProps {
  testingCookies: boolean;
  handleTestCookies: () => void;
  cookiesBrowser: string;
  setCookiesBrowser: (browser: string) => void;
  browserDropdownOptions: any[];
  cookiesProfile: string;
  setCookiesProfile: (profile: string) => void;
  detectedProfiles: string[];
  selectedBrowserObj?: any;
}

export function BrowserCookiesForm({
  testingCookies,
  handleTestCookies,
  cookiesBrowser,
  setCookiesBrowser,
  browserDropdownOptions,
  cookiesProfile,
  setCookiesProfile,
  detectedProfiles,
  selectedBrowserObj,
}: BrowserCookiesFormProps) {
  return (
    <div className="flex flex-col gap-2.5 p-3 rounded-lg bg-gray-950/70 border border-gray-800">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-200">
          Target Browser
        </label>
        <Button
          type="button"
          severity="secondary"
          loading={testingCookies}
          className="px-2 py-0.5 text-[11px] flex items-center gap-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md"
          onClick={handleTestCookies}
        >
          <Icon
            icon="tabler:plug-connected"
            className="text-xs text-amber-400"
          />
          <span>Test Extraction</span>
        </Button>
      </div>

      <Dropdown
        value={cookiesBrowser}
        options={browserDropdownOptions}
        onChange={(e) => setCookiesBrowser(e.value)}
        className="w-full text-xs"
      />

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium text-gray-400">
          Profile (Optional, e.g. Default, Profile 1)
        </label>
        <InputText
          value={cookiesProfile}
          onChange={(e) => setCookiesProfile(e.target.value)}
          placeholder={detectedProfiles[0] || "Default"}
          className="w-full text-xs p-1.5 bg-gray-900 border-gray-800 rounded-md"
        />
      </div>

      {selectedBrowserObj && selectedBrowserObj.supported === false && (
        <div className="p-2 rounded-md bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-1.5">
          <Icon
            icon="tabler:alert-triangle"
            className="text-base text-amber-400 shrink-0 mt-0.5"
          />
          <div>
            <span className="font-semibold">
              Windows App-Bound Encryption:{" "}
            </span>
            {selectedBrowserObj.name} cookies are locked by Windows DPAPI.
            Please select{" "}
            <span className="font-semibold text-cyan-300">Mozilla Firefox</span>{" "}
            (working) or use{" "}
            <span className="font-semibold text-cyan-300">
              Custom cookies.txt
            </span>
            .
          </div>
        </div>
      )}

      <span className="text-[10px] text-gray-400 leading-relaxed">
        {cookiesBrowser === "auto"
          ? "Auto mode will cascade through all detected working browsers (e.g. Firefox, Brave) to extract cookies seamlessly."
          : "yt-dlp reads session cookies directly from your selected desktop browser installation."}
      </span>
    </div>
  );
}

export default BrowserCookiesForm;
