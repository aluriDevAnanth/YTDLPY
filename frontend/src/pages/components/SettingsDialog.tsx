import { Icon } from "@iconify/react";
import axios from "axios";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
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

const cookieSourceOptions = [
  { label: "Disabled (No Cookies)", value: "none" },
  { label: "Automatic Browser Extraction", value: "browser" },
  { label: "Custom Netscape cookies.txt", value: "custom" },
  { label: "Backend File (storage/cookies.txt)", value: "storage_file" },
];

const browserOptions = [
  { label: "Google Chrome", value: "chrome" },
  { label: "Mozilla Firefox", value: "firefox" },
  { label: "Microsoft Edge", value: "edge" },
  { label: "Brave Browser", value: "brave" },
  { label: "Opera", value: "opera" },
  { label: "Apple Safari", value: "safari" },
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

  const [defaultFormat, setDefaultFormat] = useState<
    "BEST" | "BESTAUDIO" | "WORST"
  >("BEST");
  const [defaultViewMode, setDefaultViewMode] = useState<"grid" | "table">(
    "grid",
  );
  const [maxConcurrent, setMaxConcurrent] = useState<number>(3);
  const [autoVtt, setAutoVtt] = useState<boolean>(true);
  const [cookiesSource, setCookiesSource] = useState<string>("none");
  const [cookiesBrowser, setCookiesBrowser] = useState<string>("chrome");
  const [cookiesTxt, setCookiesTxt] = useState<string>("");
  const [authStorageMode, setAuthStorageModeState] = useState<"session" | "local">("local");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      setDefaultFormat(settings.default_format || "BEST");
      setDefaultViewMode(
        (settings.default_view_mode as "grid" | "table") || "grid",
      );
      setMaxConcurrent(settings.max_concurrent_downloads || 3);
      setAutoVtt(settings.auto_generate_vtt ?? true);
      setCookiesSource(settings.cookies_source || "none");
      setCookiesBrowser(settings.cookies_browser || "chrome");
      setCookiesTxt(settings.cookies_txt || "");
      setAuthStorageModeState(settings.auth_storage_mode || "local");
    }
  }, [settings]);

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
        cookies_txt: cookiesTxt,
        auth_storage_mode: authStorageMode,
      });
      setSettings(res.data);
      toast.current?.show({
        severity: "success",
        summary: "Settings Saved",
        detail: "User preferences saved successfully",
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

  return (
    <Dialog
      header={
        <div className="flex items-center gap-2.5 font-sans py-0.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Icon icon="tabler:adjustments" className="text-xl" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-gray-100 tracking-tight">
              User Preferences & Settings
            </span>
            <span className="text-[11px] text-gray-400 font-normal">
              Configure download defaults, layout preferences, and authentication cookies
            </span>
          </div>
        </div>
      }
      visible={isSettingsOpen}
      onHide={() => setSettingsOpen(false)}
      dismissableMask
      className="font-sans"
      pt={pt.dialog}
    >
      <Toast ref={toast} />

      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* Left Column: Interface Layout & Download Preferences */}
        <div className="flex flex-col gap-4">
          {/* Section 1: Interface Layout */}
          <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-gray-900/80 backdrop-blur-xs border border-gray-800/80 hover:border-gray-700/80 transition-all shadow-xs">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800/80 pb-2">
              <Icon icon="tabler:layout" className="text-cyan-400 text-base" />
              Interface & View Options
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-200 flex items-center justify-between">
                <span>Default View Mode</span>
                <span className="text-[10px] text-cyan-400 font-mono">Startup View</span>
              </label>
              <Dropdown
                value={defaultViewMode}
                options={viewModeOptions}
                onChange={(e) => setDefaultViewMode(e.value)}
                className="w-full text-xs bg-gray-950 border-gray-800 rounded-lg"
              />
              <span className="text-[11px] text-gray-400 leading-snug">
                Select your preferred view (Grid vs Table) loaded automatically upon login.
              </span>
            </div>
          </div>

          {/* Section 2: Download Options */}
          <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-gray-900/80 backdrop-blur-xs border border-gray-800/80 hover:border-gray-700/80 transition-all shadow-xs">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800/80 pb-2">
              <Icon icon="tabler:download" className="text-cyan-400 text-base" />
              Download Engine Preferences
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-200">
                Default Format Quality
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
                Max Concurrent Downloads
              </label>
              <InputNumber
                value={maxConcurrent}
                onValueChange={(e) => setMaxConcurrent(e.value || 1)}
                min={1}
                max={10}
                showButtons
                className="w-full text-xs font-mono"
              />
            </div>

            {user?.role === "admin" && <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-200">
                Auth Token Storage Mode
              </label>
              <Dropdown
                value={authStorageMode}
                options={[
                  { label: "Local Storage (Persistent)", value: "local" },
                  { label: "Session Storage (Tab-only)", value: "session" },
                ]}
                onChange={(e) => setAuthStorageModeState(e.value)}
                className="w-full text-xs bg-gray-950 border-gray-800 rounded-lg"
              />
              <span className="text-[11px] text-gray-400 leading-snug">
                Local Storage keeps you logged in across browser sessions. Session Storage clears login when tab closes.
              </span>
            </div>}

            <div className="flex items-center justify-between pt-3 border-t border-gray-800/80 mt-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-gray-200">
                  Auto-Generate VTT Player Sprites
                </span>
                <span className="text-[11px] text-gray-400">
                  Create preview thumbnail frames for timeline scrubbing
                </span>
              </div>
              <InputSwitch
                checked={autoVtt}
                onChange={(e) => setAutoVtt(e.value || false)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: yt-dlp Cookies & Paywall Authentication */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-gray-900/80 backdrop-blur-xs border border-gray-800/80 hover:border-gray-700/80 transition-all h-full shadow-xs">
            <div className="flex flex-col gap-1 border-b border-gray-800/80 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Icon icon="tabler:cookie" className="text-amber-400 text-base" />
                yt-dlp Cookies & Authentication
              </span>
              <span className="text-[11px] text-gray-400">
                Bypass age restrictions, bot verifications, and member paywalls
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-200">
                Authentication Method
              </label>
              <Dropdown
                value={cookiesSource}
                options={cookieSourceOptions}
                onChange={(e) => setCookiesSource(e.value)}
                className="w-full text-xs bg-gray-950 border-gray-800 rounded-lg"
              />
            </div>

            {cookiesSource === "browser" && (
              <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-950/70 border border-gray-800">
                <label className="text-xs font-semibold text-gray-200">
                  Select Desktop Browser Profile
                </label>
                <Dropdown
                  value={cookiesBrowser}
                  options={browserOptions}
                  onChange={(e) => setCookiesBrowser(e.value)}
                  className="w-full text-xs"
                />
                <span className="text-[11px] text-gray-400 leading-relaxed">
                  yt-dlp will automatically read session cookies from your installed browser profile.
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
                  rows={7}
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

      <div className="shrink-0 py-2 flex items-center justify-end gap-2.5 border-t border-gray-800/80">
        <Button
          label="Cancel"
          severity="secondary"
          className="p-button-sm px-4 py-1.5 text-xs rounded-lg"
          onClick={() => setSettingsOpen(false)}
        />
        <Button
          label="Save Settings"
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
