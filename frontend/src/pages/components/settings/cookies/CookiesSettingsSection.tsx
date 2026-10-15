import { Icon } from "@iconify/react";
import { memo, type ChangeEvent, type RefObject } from "react";
import { BrowserCookiesForm } from "./BrowserCookiesForm";
import { CookieInheritBanner } from "./CookieInheritBanner";
import { CookieSourceDropdown } from "./CookieSourceDropdown";
import { CustomCookiesForm } from "./CustomCookiesForm";
import { StorageFileCookiesBanner } from "./StorageFileCookiesBanner";

interface CookiesSettingsSectionProps {
  cookiesSource: string;
  setCookiesSource: (source: string) => void;
  cookieSourceOptions: any[];
  adminDefaultsInfo: any;
  testingCookies: boolean;
  handleTestCookies: () => void;
  cookiesBrowser: string;
  setCookiesBrowser: (browser: string) => void;
  browserDropdownOptions: any[];
  cookiesProfile: string;
  setCookiesProfile: (profile: string) => void;
  detectedProfiles: string[];
  selectedBrowserObj?: any;
  cookiesTxt: string;
  setCookiesTxt: (txt: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const CookiesSettingsSection = memo(
  ({
    cookiesSource,
    setCookiesSource,
    cookieSourceOptions,
    adminDefaultsInfo,
    testingCookies,
    handleTestCookies,
    cookiesBrowser,
    setCookiesBrowser,
    browserDropdownOptions,
    cookiesProfile,
    setCookiesProfile,
    detectedProfiles,
    selectedBrowserObj,
    cookiesTxt,
    setCookiesTxt,
    fileInputRef,
    handleFileUpload,
  }: CookiesSettingsSectionProps) => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-gray-900/80 backdrop-blur-xs border border-gray-800/80 hover:border-gray-700/80 transition-all h-full shadow-xs">
          <div className="flex flex-col gap-1 border-b border-gray-800/80 pb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Icon icon="tabler:cookie" className="text-amber-400 text-base" />
              Browser Cookies & Authentication
            </span>
            <span className="text-[11px] text-gray-400">
              Pre-scanned browser integration for paywalled & age-restricted
              media
            </span>
          </div>

          <CookieSourceDropdown
            cookiesSource={cookiesSource}
            setCookiesSource={setCookiesSource}
            cookieSourceOptions={cookieSourceOptions}
          />

          {cookiesSource === "inherit" && (
            <CookieInheritBanner adminDefaultsInfo={adminDefaultsInfo} />
          )}

          {cookiesSource === "browser" && (
            <BrowserCookiesForm
              testingCookies={testingCookies}
              handleTestCookies={handleTestCookies}
              cookiesBrowser={cookiesBrowser}
              setCookiesBrowser={setCookiesBrowser}
              browserDropdownOptions={browserDropdownOptions}
              cookiesProfile={cookiesProfile}
              setCookiesProfile={setCookiesProfile}
              detectedProfiles={detectedProfiles}
              selectedBrowserObj={selectedBrowserObj}
            />
          )}

          {cookiesSource === "custom" && (
            <CustomCookiesForm
              cookiesTxt={cookiesTxt}
              setCookiesTxt={setCookiesTxt}
              fileInputRef={fileInputRef}
              handleFileUpload={handleFileUpload}
            />
          )}

          {cookiesSource === "storage_file" && <StorageFileCookiesBanner />}
        </div>
      </div>
    );
  },
);

CookiesSettingsSection.displayName = "CookiesSettingsSection";

export default CookiesSettingsSection;
