import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useAuthStore } from "src/context/authStore";
import { pt } from "src/pt";
import { AdminBanner } from "./AdminBanner";
import { CookiesSettingsSection } from "./cookies/CookiesSettingsSection";
import { GeneralSettingsSection } from "./general/GeneralSettingsSection";
import { defaultBrowserList } from "./settingsConstants";
import { SettingsFooter } from "./SettingsFooter";
import { SettingsHeader } from "./SettingsHeader";

const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export function SettingsDialog() {
  const { isSettingsOpen, user, setSettingsOpen, settings, setSettings } =
    useAuthStore();
  const toast = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "admin";

  const [defaultFormat, setDefaultFormat] = useState<
    "BEST" | "BESTAUDIO" | "WORST"
  >("BEST");
  const [defaultViewMode, setDefaultViewMode] = useState<"grid" | "table">(
    "grid",
  );
  const [maxConcurrent, setMaxConcurrent] = useState<number>(3);
  const [autoVtt, setAutoVtt] = useState<boolean>(true);
  const [cookiesSource, setCookiesSource] = useState<string>("inherit");
  const [cookiesBrowser, setCookiesBrowser] = useState<string>("firefox");
  const [cookiesProfile, setCookiesProfile] = useState<string>("");
  const [cookiesTxt, setCookiesTxt] = useState<string>("");
  const [authStorageMode, setAuthStorageModeState] = useState<"session" | "local">(
    "local",
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [applyingAll, setApplyingAll] = useState<boolean>(false);
  const [testingCookies, setTestingCookies] = useState<boolean>(false);
  const [systemBrowsers, setSystemBrowsers] =
    useState<any[]>(defaultBrowserList);
  const [adminDefaultsInfo, setAdminDefaultsInfo] = useState<any>(null);

  useEffect(() => {
    if (isSettingsOpen) {
      fetchBrowsers();
    }
  }, [isSettingsOpen]);

  useEffect(() => {
    if (settings) {
      setDefaultFormat(settings.default_format || "BEST");
      setDefaultViewMode(
        (settings.default_view_mode as "grid" | "table") || "grid",
      );
      setMaxConcurrent(settings.max_concurrent_downloads || 3);
      setAutoVtt(settings.auto_generate_vtt ?? true);
      setCookiesSource(
        settings.cookies_source || (isAdmin ? "browser" : "inherit"),
      );
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
          {
            id: "auto",
            name: "Auto (All Available Browsers)",
            installed: true,
            icon: "tabler:browser",
            profiles: ["Default"],
          },
          ...res.data.browsers,
        ];
        setSystemBrowsers(fullList);
      }
      if (res.data && res.data.admin_defaults) {
        setAdminDefaultsInfo(res.data.admin_defaults);
      }
    } catch {
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

      const res = await axios.post(
        `${API_BASE}/api/admin/settings/apply-to-all`,
      );
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
        detail:
          err.response?.data?.detail || "Could not apply settings to all users",
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
        detail:
          err.response?.data?.detail ||
          err.message ||
          "Failed to extract cookies",
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

  const selectedBrowserObj = systemBrowsers.find(
    (b) => b.id === cookiesBrowser,
  );
  const detectedProfiles = selectedBrowserObj?.profiles || ["Default"];

  return (
    <Dialog
      header={<SettingsHeader isAdmin={isAdmin} />}
      visible={isSettingsOpen}
      onHide={() => setSettingsOpen(false)}
      className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[820px] max-w-full font-sans"
      pt={pt.dialog}
    >
      <Toast ref={toast} position="top-right" />

      <AdminBanner
        isAdmin={isAdmin}
        applyingAll={applyingAll}
        onApplyToAllUsers={handleApplyToAllUsers}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <GeneralSettingsSection
          defaultFormat={defaultFormat}
          setDefaultFormat={setDefaultFormat}
          defaultViewMode={defaultViewMode}
          setDefaultViewMode={setDefaultViewMode}
          maxConcurrent={maxConcurrent}
          setMaxConcurrent={setMaxConcurrent}
          autoVtt={autoVtt}
          setAutoVtt={setAutoVtt}
          authStorageMode={authStorageMode}
          setAuthStorageModeState={setAuthStorageModeState}
        />

        <CookiesSettingsSection
          cookiesSource={cookiesSource}
          setCookiesSource={setCookiesSource}
          cookieSourceOptions={cookieSourceOptions}
          adminDefaultsInfo={adminDefaultsInfo}
          testingCookies={testingCookies}
          handleTestCookies={handleTestCookies}
          cookiesBrowser={cookiesBrowser}
          setCookiesBrowser={setCookiesBrowser}
          browserDropdownOptions={browserDropdownOptions}
          cookiesProfile={cookiesProfile}
          setCookiesProfile={setCookiesProfile}
          detectedProfiles={detectedProfiles}
          selectedBrowserObj={selectedBrowserObj}
          cookiesTxt={cookiesTxt}
          setCookiesTxt={setCookiesTxt}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
        />
      </div>

      <SettingsFooter
        loading={loading}
        onCancel={() => setSettingsOpen(false)}
        onSave={handleSave}
      />
    </Dialog>
  );
}

export default SettingsDialog;
