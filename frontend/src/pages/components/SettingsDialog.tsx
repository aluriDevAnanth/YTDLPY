import { Icon } from "@iconify/react";
import axios from "axios";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useAuthStore } from "../../context/authStore";
import { pt } from "../../pt";

const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

const formatOptions = [
  {
    label: "Best (Video + Audio)",
    value: "BEST",
    desc: "Highest available video and audio resolution",
  },
  {
    label: "Best Audio Only",
    value: "BESTAUDIO",
    desc: "Extract highest quality audio stream (MP3/M4A)",
  },
  {
    label: "Worst / Low Bandwidth",
    value: "WORST",
    desc: "Lowest resolution file to minimize bandwidth",
  },
];

const defaultBrowserList = [
  { id: "firefox", name: "Mozilla Firefox (Default)", installed: true, icon: "logos:firefox" },
  { id: "auto", name: "Auto (Firefox Priority + Mix Others)", installed: true, icon: "tabler:browser" },
  { id: "brave", name: "Brave Browser", installed: false, icon: "logos:brave" },
  { id: "opera", name: "Opera", installed: false, icon: "logos:opera" },
  { id: "opera-gx", name: "Opera GX", installed: false, icon: "simple-icons:operagx" },
  { id: "vivaldi", name: "Vivaldi", installed: false, icon: "logos:vivaldi-icon" },
  { id: "zen", name: "Zen Browser", installed: false, icon: "simple-icons:firefoxbrowser" },
  { id: "floorp", name: "Floorp", installed: false, icon: "simple-icons:firefoxbrowser" },
  { id: "chrome", name: "Google Chrome", installed: false, icon: "logos:chrome" },
  { id: "edge", name: "Microsoft Edge", installed: false, icon: "logos:microsoft-edge" },
  { id: "chromium", name: "Chromium", installed: false, icon: "logos:chromium" },
  { id: "safari", name: "Apple Safari", installed: false, icon: "logos:safari" },
];

const viewModeOptions = [
  { label: "YouTube Grid View (Default)", value: "grid" },
  { label: "Table Grid View", value: "table" },
];

export default function SettingsDialog() {
  const { isSettingsOpen, user, setSettingsOpen, settings, setSettings } =
    useAuthStore();
  const toast = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "admin";

  const [defaultFormat, setDefaultFormat] = useState<"BEST" | "BESTAUDIO" | "WORST">("BEST");
  const [defaultViewMode, setDefaultViewMode] = useState<"grid" | "table">("grid");
  const [maxConcurrent, setMaxConcurrent] = useState<number>(3);
  const [autoVtt, setAutoVtt] = useState<boolean>(true);
  const [cookiesSource, setCookiesSource] = useState<string>("inherit");
  const [cookiesBrowser, setCookiesBrowser] = useState<string>("firefox");
  const [cookiesProfile, setCookiesProfile] = useState<string>("");
  const [cookiesTxt, setCookiesTxt] = useState<string>("");
  const [authStorageMode, setAuthStorageModeState] = useState<"session" | "local">("local");
  const [loading, setLoading] = useState<boolean>(false);
  const [applyingAll, setApplyingAll] = useState<boolean>(false);
  const [testingCookies, setTestingCookies] = useState<boolean>(false);
  const [systemBrowsers, setSystemBrowsers] = useState<any[]>(defaultBrowserList);
  const [adminDefaultsInfo, setAdminDefaultsInfo] = useState<any>(null);

  useEffect(() => {
    if (isSettingsOpen) {
      fetchBrowsers();
    }
  }, [isSettingsOpen]);

  useEffect(() => {
    if (settings) {
      setDefaultFormat(settings.default_format || "BEST");
      setDefaultViewMode((settings.default_view_mode as "grid" | "table") || "grid");
      setMaxConcurrent(settings.max_concurrent_downloads || 3);
      setAutoVtt(settings.auto_generate_vtt ?? true);
      setCookiesSource(settings.cookies_source || (isAdmin ? "browser" : "inherit"));
      setCookiesBrowser(settings.cookies_browser || "auto");
      setCookiesProfile(settings.cookies_profile || "");
      setCookiesTxt(settings.cookies_txt || "");
      setAuthStorageModeState(settings.auth_storage_mode || "local");
    }
  }, [settings, isAdmin]);

  const fetchBrowsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/system/browsers`);
      if (res.data && res.data.browsers) {
        const fullList = [
          { id: "auto", name: "Auto (All Available Browsers)", installed: true, icon: "tabler:browser", profiles: ["Default"] },
          ...res.data.browsers,
        ];
        setSystemBrowsers(fullList);
      }
      if (res.data && res.data.admin_defaults) {
        setAdminDefaultsInfo(res.data.admin_defaults);
      }
    } catch (e) {
      // Fallback to default browser list
      setSystemBrowsers(defaultBrowserList);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || "";
        setCookiesTxt(text);
        toast.current?.show({
          severity: "info",
          summary: "File Loaded",
          detail: `Loaded ${file.name} (${text.length} bytes)`,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE}/api/user/settings`, {
        default_format: defaultFormat,
        default_view_mode: defaultViewMode,
        max_concurrent_downloads: maxConcurrent,
        auto_generate_vtt: autoVtt,
        cookies_source: cookiesSource,
        cookies_browser: cookiesBrowser,
        cookies_profile: cookiesProfile || null,
        cookies_txt: cookiesTxt,
        auth_storage_mode: authStorageMode,
      });
      setSettings(res.data);
      toast.current?.show({
        severity: "success",
        summary: "Settings Saved",
        detail: isAdmin
          ? "Admin preferences saved. (Acts as default for users)"
          : "User preferences saved successfully",
      });
      setTimeout(() => setSettingsOpen(false), 400);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToAllUsers = async () => {
    setApplyingAll(true);
    try {
      // First save current admin settings
      await axios.put(`${API_BASE}/api/user/settings`, {
        default_format: defaultFormat,
        default_view_mode: defaultViewMode,
        max_concurrent_downloads: maxConcurrent,
        auto_generate_vtt: autoVtt,
        cookies_source: cookiesSource,
        cookies_browser: cookiesBrowser,
        cookies_profile: cookiesProfile || null,
        cookies_txt: cookiesTxt,
        auth_storage_mode: authStorageMode,
      });

      const res = await axios.post(`${API_BASE}/api/admin/settings/apply-to-all`);
      toast.current?.show({
        severity: "success",
        summary: "Defaults Applied",
        detail: res.data.message || "Admin defaults propagated to all users!",
      });
    } catch (err: any) {
      console.error(err);
      toast.current?.show({
        severity: "error",
        summary: "Failed to Apply",
        detail: err.response?.data?.detail || "Could not apply settings to all users",
      });
    } finally {
      setApplyingAll(false);
    }
  };

  const handleTestCookies = async () => {
    setTestingCookies(true);
    try {
      const res = await axios.post(`${API_BASE}/api/system/test-cookies`, {
        browser: cookiesBrowser,
        profile: cookiesProfile || null,
      });
      if (res.data.success) {
        toast.current?.show({
          severity: "success",
          summary: "Cookie Test Successful",
          detail: res.data.message,
          life: 5000,
        });
      } else {
        toast.current?.show({
          severity: "warn",
          summary: "Cookie Test Warning",
          detail: res.data.message,
          life: 6000,
        });
      }
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Cookie Test Failed",
        detail: err.response?.data?.detail || err.message || "Failed to extract cookies",
      });
    } finally {
      setTestingCookies(false);
    }
  };

  const cookieSourceOptions = [
    ...(!isAdmin
      ? [
          {
            label: `Inherit Admin Default (${
              adminDefaultsInfo
                ? `${adminDefaultsInfo.cookies_source} - ${adminDefaultsInfo.cookies_browser}`
                : "Auto Detection"
            })`,
            value: "inherit",
          },
        ]
      : []),
    { label: "Automatic Browser Extraction", value: "browser" },
    { label: "Custom Netscape cookies.txt", value: "custom" },
    { label: "Backend File (storage/cookies.txt)", value: "storage_file" },
    { label: "Disabled (No Cookies)", value: "none" },
  ];

  const browserDropdownOptions = systemBrowsers.map((b) => {
    let suffix = "";
    if (b.id === "auto") {
      suffix = " (Recommended - Auto Selects Working Browsers)";
    } else if (b.installed) {
      if (b.supported) {
        suffix = " (Working)";
      } else {
        suffix = " (DPAPI Protected)";
      }
    }
    return {
      label: `${b.name}${suffix}`,
      value: b.id,
      installed: b.installed,
      supported: b.supported,
      icon: b.icon,
    };
  });

  const selectedBrowserObj = systemBrowsers.find((b) => b.id === cookiesBrowser);
  const detectedProfiles = selectedBrowserObj?.profiles || ["Default"];

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2.5 font-sans py-0.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Icon icon="tabler:adjustments" className="text-xl" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-gray-100 tracking-tight flex items-center gap-2">
              User Preferences & Settings
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ADMIN GLOBAL DEFAULTS
                </span>
              )}
            </span>
            <span className="text-[11px] text-gray-400 font-normal">
              {isAdmin
                ? "Configure global defaults for all users, download quality, and multi-browser cookies"
                : "Configure your personal download defaults, layout, and authentication cookies"}
            </span>
          </div>
        </div>
      }
      visible={isSettingsOpen}
      onHide={() => setSettingsOpen(false)}
      className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[820px] max-w-full font-sans"
      pt={pt.dialog}
    >
      <Toast ref={toast} position="top-right" />

      {isAdmin && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-cyan-950/30 border border-amber-500/30 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Icon icon="tabler:shield-check" className="text-xl text-amber-400 shrink-0" />
            <div className="text-xs text-gray-300">
              <span className="font-bold text-amber-300">Admin Mode: </span>
              Your settings serve as the default template for all regular users.
            </div>
          </div>
          <Button
            type="button"
            label="Apply to All Users"
            icon="pi pi-users"
            loading={applyingAll}
            severity="warning"
            className="p-button-sm text-[11px] px-3 py-1 font-semibold rounded-lg shrink-0"
            onClick={handleApplyToAllUsers}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: General & Layout */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-gray-900/80 backdrop-blur-xs border border-gray-800/80 hover:border-gray-700/80 transition-all h-full shadow-xs">
            <div className="flex flex-col gap-1 border-b border-gray-800/80 pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Icon icon="tabler:sliders" className="text-cyan-400 text-base" />
                General & Layout
              </span>
              <span className="text-[11px] text-gray-400">
                Display modes and download defaults
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-200">
                Default Video Quality Format
              </label>
              <Dropdown
                value={defaultFormat}
                options={formatOptions}
                onChange={(e) => setDefaultFormat(e.value)}
                className="w-full text-xs bg-gray-950 border-gray-800 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-200">
                Default Library View Mode
              </label>
              <Dropdown
                value={defaultViewMode}
                options={viewModeOptions}
                onChange={(e) => setDefaultViewMode(e.value)}
                className="w-full text-xs bg-gray-950 border-gray-800 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-200">
                Max Concurrent Downloads
              </label>
              <InputNumber
                value={maxConcurrent}
                onValueChange={(e) => setMaxConcurrent(e.value || 3)}
                min={1}
                max={10}
                showButtons
                className="w-full text-xs"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-950/70 border border-gray-800">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-200">
                  Auto-Generate Subtitles (VTT)
                </span>
                <span className="text-[10px] text-gray-400">
                  Extract subtitles and thumbnail preview sprites
                </span>
              </div>
              <InputSwitch
                checked={autoVtt}
                onChange={(e) => setAutoVtt(e.value || false)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Browser Cookies & Authentication */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-gray-900/80 backdrop-blur-xs border border-gray-800/80 hover:border-gray-700/80 transition-all h-full shadow-xs">
            <div className="flex flex-col gap-1 border-b border-gray-800/80 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Icon icon="tabler:cookie" className="text-amber-400 text-base" />
                Browser Cookies & Authentication
              </span>
              <span className="text-[11px] text-gray-400">
                Pre-scanned browser integration for paywalled & age-restricted media
              </span>
            </div>

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

            {cookiesSource === "inherit" && (
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs text-gray-300 leading-relaxed">
                <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <Icon icon="tabler:info-circle" className="text-sm" />
                  Inheriting Administrator Defaults
                </div>
                Your downloads automatically utilize the administrator's configured cookie profile (
                <span className="font-mono text-cyan-200">
                  {adminDefaultsInfo
                    ? `${adminDefaultsInfo.cookies_browser}`
                    : "Auto Multi-Browser"}
                </span>
                ).
              </div>
            )}

            {cookiesSource === "browser" && (
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
                    <Icon icon="tabler:plug-connected" className="text-xs text-amber-400" />
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
                    <Icon icon="tabler:alert-triangle" className="text-base text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Windows App-Bound Encryption: </span>
                      {selectedBrowserObj.name} cookies are locked by Windows DPAPI. Please select <span className="font-semibold text-cyan-300">Mozilla Firefox</span> (working) or use <span className="font-semibold text-cyan-300">Custom cookies.txt</span>.
                    </div>
                  </div>
                )}

                <span className="text-[10px] text-gray-400 leading-relaxed">
                  {cookiesBrowser === "auto"
                    ? "Auto mode will cascade through all detected working browsers (e.g. Firefox, Brave) to extract cookies seamlessly."
                    : "yt-dlp reads session cookies directly from your selected desktop browser installation."}
                </span>
              </div>
            )}

            {cookiesSource === "custom" && (
              <div className="flex flex-col gap-2.5 p-3 rounded-lg bg-gray-950/70 border border-gray-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-200">
                    Netscape Format cookies.txt
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    severity="secondary"
                    className="px-2.5 py-1 text-xs flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon icon="tabler:file-upload" className="text-sm text-cyan-400" />
                    <span>Upload .txt</span>
                  </Button>
                </div>
                <InputTextarea
                  value={cookiesTxt}
                  onChange={(e) => setCookiesTxt(e.target.value)}
                  rows={6}
                  placeholder="# Netscape HTTP Cookie File&#10;.youtube.com TRUE / FALSE 1750000000 LOGIN_INFO ..."
                  className="w-full font-mono text-xs p-2.5 bg-gray-950 text-cyan-300 border border-gray-800 rounded-lg focus:border-cyan-500"
                />
              </div>
            )}

            {cookiesSource === "storage_file" && (
              <div className="p-3 rounded-lg bg-gray-950/70 border border-gray-800 text-xs text-gray-300 leading-relaxed">
                Uses cookie file stored on server at{" "}
                <code className="text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  backend/storage/cookies.txt
                </code>
                .
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 py-2 mt-4 flex items-center justify-end gap-2.5 border-t border-gray-800/80">
        <Button
          label="Cancel"
          severity="secondary"
          className="p-button-sm px-4 py-1.5 text-xs rounded-lg"
          onClick={() => setSettingsOpen(false)}
        />
        <Button
          label={isAdmin ? "Save Admin Defaults" : "Save Settings"}
          icon="pi pi-check"
          loading={loading}
          severity="success"
          className="p-button-sm px-4 py-1.5 text-xs font-semibold rounded-lg shadow-sm"
          onClick={handleSave}
        />
      </div>
    </Dialog>
  );
}
