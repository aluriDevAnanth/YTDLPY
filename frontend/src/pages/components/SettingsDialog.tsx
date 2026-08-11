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
  const { isSettingsOpen, setSettingsOpen, settings, setSettings } =
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
        <div className="flex items-center gap-2 font-sans">
          <Icon icon="tabler:adjustments" className="text-xl text-cyan-400" />
          <span className="font-semibold text-base text-gray-100">
            User Preferences & App Settings
          </span>
        </div>
      }
      visible={isSettingsOpen}
      style={{ width: "95vw" }}
      onHide={() => setSettingsOpen(false)}
      dismissableMask
      className="font-sans"
    >
      <Toast ref={toast} />

      {/* Multi-Column Wide Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1 text-sm">
        {/* Left Column: Interface Layout & Download Preferences */}
        <div className="flex flex-col gap-4">
          {/* Section 1: Interface Layout */}
          <div className="flex flex-col gap-3 p-3.5 rounded-lg bg-gray-900/60 border border-gray-800 h-full">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Icon icon="tabler:layout" className="text-cyan-400 text-base" />
              Interface Layout
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">
                Default View Mode
              </label>
              <Dropdown
                value={defaultViewMode}
                options={viewModeOptions}
                onChange={(e) => setDefaultViewMode(e.value)}
                className="w-full text-xs"
              />
              <span className="text-[11px] text-gray-400">
                Choose the default layout view loaded on startup and login.
              </span>
            </div>
          </div>

          {/* Section 2: Download Options */}
          <div className="flex flex-col gap-3 p-3.5 rounded-lg bg-gray-900/60 border border-gray-800 h-full">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Icon icon="tabler:download" className="text-cyan-400 text-base" />
              Download Options
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">
                Default Format Quality
              </label>
              <Dropdown
                value={defaultFormat}
                options={formatOptions}
                onChange={(e) => setDefaultFormat(e.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">
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

            <div className="flex items-center justify-between pt-2 border-t border-gray-800/60">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-200">
                  Auto-Generate VTT Player Sprites
                </span>
                <span className="text-[11px] text-gray-400">
                  Build thumbnail frames for video scrub timeline seeking
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
          <div className="flex flex-col gap-3 p-3.5 rounded-lg bg-gray-900/60 border border-gray-800 h-full">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Icon icon="tabler:cookie" className="text-amber-400 text-base" />
                yt-dlp Cookies & Authentication
              </span>
              <span className="text-[11px] text-gray-400 mt-0.5">
                Bypass age restrictions, bot checks, and member-only paywalls
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">
                Authentication Method
              </label>
              <Dropdown
                value={cookiesSource}
                options={cookieSourceOptions}
                onChange={(e) => setCookiesSource(e.value)}
                className="w-full text-xs"
              />
            </div>

            {cookiesSource === "browser" && (
              <div className="flex flex-col gap-1.5 p-2.5 rounded bg-gray-800/40 border border-gray-700/50">
                <label className="text-xs font-medium text-gray-300">
                  Select Installed Desktop Browser
                </label>
                <Dropdown
                  value={cookiesBrowser}
                  options={browserOptions}
                  onChange={(e) => setCookiesBrowser(e.value)}
                  className="w-full text-xs"
                />
                <span className="text-[11px] text-gray-400">
                  yt-dlp will automatically extract session cookies from your local browser profile.
                </span>
              </div>
            )}

            {cookiesSource === "custom" && (
              <div className="flex flex-col gap-2 p-2.5 rounded bg-gray-800/40 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-300">
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
                    className="px-2 py-0.5 text-xs h-7 flex items-center gap-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon icon="tabler:file-upload" className="text-sm" />
                    <span>Upload .txt</span>
                  </Button>
                </div>
                <InputTextarea
                  value={cookiesTxt}
                  onChange={(e) => setCookiesTxt(e.target.value)}
                  rows={8}
                  placeholder="# Netscape HTTP Cookie File&#10;.youtube.com TRUE / FALSE 1750000000 LOGIN_INFO ..."
                  className="w-full font-mono text-xs p-2 bg-gray-950 text-gray-200 border border-gray-700 rounded"
                />
              </div>
            )}

            {cookiesSource === "storage_file" && (
              <div className="p-2.5 rounded bg-gray-800/30 border border-gray-700/40 text-xs text-gray-300">
                Uses file stored at{" "}
                <code className="text-amber-400 font-mono">
                  backend/storage/cookies.txt
                </code>
                .
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-gray-800">
        <Button
          label="Cancel"
          severity="secondary"
          className="p-button-sm px-3 py-1.5 text-xs"
          onClick={() => setSettingsOpen(false)}
        />
        <Button
          label="Save Settings"
          icon="pi pi-check"
          loading={loading}
          severity="success"
          className="p-button-sm px-3 py-1.5 text-xs font-medium"
          onClick={handleSave}
        />
      </div>
    </Dialog>
  );
}
