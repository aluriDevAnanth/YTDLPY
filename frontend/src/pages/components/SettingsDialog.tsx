import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useAuthStore } from "../../context/authStore";
const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
const formatOptions = [
  { label: "Best (Video + Audio)", value: "BEST" },
  { label: "Best Audio Only", value: "BESTAUDIO" },
  { label: "Worst / Low Bandwidth", value: "WORST" },
];
const cookieSourceOptions = [
  { label: "Disabled (No Cookies)", value: "none" },
  { label: "Automatic Browser Extraction", value: "browser" },
  { label: "Custom Netscape cookies.txt (Upload / Paste)", value: "custom" },
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
export default function SettingsDialog() {
  const { isSettingsOpen, setSettingsOpen, settings, setSettings } = useAuthStore();
  const toast = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [defaultFormat, setDefaultFormat] = useState<"BEST" | "BESTAUDIO" | "WORST">("BEST");
  const [maxConcurrent, setMaxConcurrent] = useState<number>(3);
  const [autoVtt, setAutoVtt] = useState<boolean>(true);
  const [cookiesSource, setCookiesSource] = useState<string>("none");
  const [cookiesBrowser, setCookiesBrowser] = useState<string>("chrome");
  const [cookiesTxt, setCookiesTxt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (settings) {
      setDefaultFormat(settings.default_format || "BEST");
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
        detail: "User preferences and cookie configuration saved successfully",
      });
      setTimeout(() => setSettingsOpen(false), 500);
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
      header="User Preferences & App Settings"
      visible={isSettingsOpen}
      style={{ width: "540px" }}
      onHide={() => setSettingsOpen(false)}
      dismissableMask
    >
      <Toast ref={toast} />
      <div className="flex flex-col gap-5 py-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Default Download Format</label>
          <Dropdown
            value={defaultFormat}
            options={formatOptions}
            onChange={(e) => setDefaultFormat(e.value)}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Max Concurrent Downloads</label>
          <InputNumber
            value={maxConcurrent}
            onValueChange={(e) => setMaxConcurrent(e.value || 1)}
            min={1}
            max={10}
            showButtons
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Auto-Generate VTT Player Sprites</span>
            <span className="text-xs text-gray-400">Creates frame thumbnails for scrub video seeking</span>
          </div>
          <InputSwitch checked={autoVtt} onChange={(e) => setAutoVtt(e.value || false)} />
        </div>
        {}
        <div className="flex flex-col gap-3 pt-3 border-t border-gray-700/60">
          <div className="flex flex-col">
            <span className="text-sm font-semibold flex items-center gap-1.5">
              <Icon icon="tabler:cookie" className="text-amber-400 text-base" />
              yt-dlp Cookies & Authentication
            </span>
            <span className="text-xs text-gray-400">
              Bypass age-restrictions, bot checks, and private video paywalls
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-300">Cookie Authentication Method</label>
            <Dropdown
              value={cookiesSource}
              options={cookieSourceOptions}
              onChange={(e) => setCookiesSource(e.value)}
              className="w-full"
            />
          </div>
          {cookiesSource === "browser" && (
            <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
              <label className="text-xs font-medium text-gray-300">Select Local Desktop Browser</label>
              <Dropdown
                value={cookiesBrowser}
                options={browserOptions}
                onChange={(e) => setCookiesBrowser(e.value)}
                className="w-full"
              />
              <span className="text-[11px] text-gray-400">
                yt-dlp will automatically extract cookies from your local browser profile.
              </span>
            </div>
          )}
          {cookiesSource === "custom" && (
            <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-800/40 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-300">Netscape Format cookies.txt</label>
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
                  className="px-2.5 py-1 text-xs h-7 flex items-center gap-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon icon="tabler:file-upload" className="text-sm" />
                  <span>Upload .txt File</span>
                </Button>
              </div>
              <InputTextarea
                value={cookiesTxt}
                onChange={(e) => setCookiesTxt(e.target.value)}
                rows={4}
                placeholder="# Netscape HTTP Cookie File&#10;.youtube.com TRUE / FALSE 1750000000 LOGIN_INFO ..."
                className="w-full font-mono text-xs p-2 bg-gray-900 text-gray-200 border border-gray-700 rounded"
              />
            </div>
          )}
          {cookiesSource === "storage_file" && (
            <div className="p-2.5 rounded bg-gray-800/30 border border-gray-700/40 text-xs text-gray-300">
              Uses file stored at <code className="text-amber-400 font-mono">backend/storage/cookies.txt</code>.
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button label="Cancel" severity="secondary" onClick={() => setSettingsOpen(false)} />
          <Button label="Save Changes" icon="pi pi-check" loading={loading} onClick={handleSave} />
        </div>
      </div>
    </Dialog>
  );
}
