import axios from "axios";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { VideoProgressT, VideoT } from "../schema";
export interface UserSettings {
  user_id: string;
  default_format: "BEST" | "BESTAUDIO" | "WORST";
  default_view_mode?: "grid" | "table";
  max_concurrent_downloads: number;
  auto_generate_vtt: boolean;
  theme: string;
  cookies_source?: "none" | "browser" | "custom" | "storage_file";
  cookies_browser?: string;
  cookies_txt?: string;
  auth_storage_mode?: "session" | "local";
}

export interface UserStorageStats {
  total_videos: number;
  completed_downloads: number;
  total_bytes: number;
  formatted_bytes: string;
  watched_videos_count: number;
  watched_bytes: number;
  formatted_watched_bytes: string;
  largest_video_title?: string | null;
  largest_video_bytes: number;
  formatted_largest_bytes: string;
}

export const getAuthStorageMode = (): "session" | "local" => {
  return (
    (localStorage.getItem("auth_storage_mode") as "session" | "local") ||
    (sessionStorage.getItem("auth_storage_mode") as "session" | "local") ||
    "local"
  );
};

export const setAuthStorageMode = (mode: "session" | "local") => {
  sessionStorage.setItem("auth_storage_mode", mode);
  localStorage.setItem("auth_storage_mode", mode);
};

export const getAuthToken = (): string | null => {
  const mode = getAuthStorageMode();
  if (mode === "session") {
    return sessionStorage.getItem("token") || localStorage.getItem("token");
  } else {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  }
};

export const setAuthToken = (token: string, mode?: "session" | "local") => {
  const targetMode = mode || getAuthStorageMode();
  setAuthStorageMode(targetMode);
  if (targetMode === "session") {
    sessionStorage.setItem("token", token);
    localStorage.removeItem("token");
  } else {
    localStorage.setItem("token", token);
    sessionStorage.removeItem("token");
  }
};

export const removeAuthToken = () => {
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
};

const dynamicStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    const mode = getAuthStorageMode();
    const primary = mode === "session" ? sessionStorage : localStorage;
    const fallback = mode === "session" ? localStorage : sessionStorage;
    return primary.getItem(name) || fallback.getItem(name);
  },
  setItem: (name: string, value: string) => {
    const mode = getAuthStorageMode();
    if (mode === "session") {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name);
    } else {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(name);
    }
  },
  removeItem: (name: string) => {
    sessionStorage.removeItem(name);
    localStorage.removeItem(name);
  },
}));

export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
  created_at: string;
  settings?: UserSettings;
}
export interface StartupProgress {
  percent?: number;
  speed?: string;
  percentPerSec?: string;
  eta?: string;
  downloadedSize?: string;
  totalSize?: string;
}
export interface StartupSSE {
  message: string;
  typee: "success" | "error" | "ongoing";
  sseType: string;
  dataID: string;
  progress?: StartupProgress;
}
interface AppState {
  token: string | null;
  user: User | null;
  settings: UserSettings | null;
  isAuthOpen: boolean;
  isAdminOpen: boolean;
  isSettingsOpen: boolean;
  isStorageManagerOpen: boolean;
  storageStats: UserStorageStats | null;
  videos: Record<string, VideoT>;
  videoProgress: Record<string, VideoProgressT>;
  globalFilter: string;
  viewMode: "table" | "grid";
  startupp: StartupSSE | null;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  setSettings: (settings: UserSettings) => void;
  logout: () => void;
  setAuthOpen: (open: boolean) => void;
  setAdminOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setStorageManagerOpen: (open: boolean) => void;
  fetchUserStorageStats: () => Promise<void>;
  bulkCleanUserStorage: (options: {
    clean_watched?: boolean;
    clear_all?: boolean;
    video_ids?: string[];
  }) => Promise<{ purged_count: number; freed_bytes: number; formatted_freed_bytes: string }>;
  fetchMe: () => Promise<void>;
  upsertVideo: (video: VideoT) => void;
  removeVideo: (id: string) => void;
  upsertVideoProgress: (progress: VideoProgressT) => void;
  removeVideoProgress: (id: string) => void;
  setGlobalFilter: (filter: string) => void;
  setViewMode: (mode: "table" | "grid") => void;
  setVideos: (videos: VideoT[]) => void;
  fetchVideos: () => Promise<void>;
  setStartupSSE: (data: StartupSSE) => void;
}
const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        token: getAuthToken(),
        user: null,
        settings: null,
        isAuthOpen: false,
        isAdminOpen: false,
        isSettingsOpen: false,
        isStorageManagerOpen: false,
        storageStats: null,
        videos: {},
        videoProgress: {},
        globalFilter: "",
        viewMode: "grid",
        startupp: null,
        setAuth: (token, user) => {
          const mode = user.settings?.auth_storage_mode as "session" | "local" | undefined;
          setAuthToken(token, mode);
          set((state) => {
            state.token = token;
            state.user = user;
            state.settings = user.settings || null;
            if (user.settings?.default_view_mode) {
              state.viewMode = user.settings.default_view_mode as "grid" | "table";
            }
            state.isAuthOpen = false;
          });
          get().fetchVideos();
        },
        setUser: (user) =>
          set((state) => {
            state.user = user;
            state.settings = user.settings || null;
            if (user.settings?.auth_storage_mode) {
              setAuthStorageMode(user.settings.auth_storage_mode);
            }
            if (user.settings?.default_view_mode) {
              state.viewMode = user.settings.default_view_mode as "grid" | "table";
            }
          }),
        setSettings: (settings) =>
          set((state) => {
            state.settings = settings;
            if (settings.auth_storage_mode) {
              setAuthStorageMode(settings.auth_storage_mode);
              if (state.token) {
                setAuthToken(state.token, settings.auth_storage_mode);
              }
            }
            if (settings.default_view_mode) {
              state.viewMode = settings.default_view_mode as "grid" | "table";
            }
          }),
        logout: () => {
          removeAuthToken();
          set((state) => {
            state.token = null;
            state.user = null;
            state.settings = null;
            state.videos = {};
            state.videoProgress = {};
            state.isAuthOpen = true;
          });
        },
        setAuthOpen: (open) =>
          set((state) => {
            state.isAuthOpen = open;
          }),
        setAdminOpen: (open) =>
          set((state) => {
            state.isAdminOpen = open;
          }),
        setSettingsOpen: (open) =>
          set((state) => {
            state.isSettingsOpen = open;
          }),
        setStorageManagerOpen: (open) =>
          set((state) => {
            state.isStorageManagerOpen = open;
          }),
        fetchUserStorageStats: async () => {
          try {
            const res = await axios.get(`${API_BASE}/api/user/storage`);
            set((state) => {
              state.storageStats = res.data;
            });
          } catch (err) {
            console.error("Failed to fetch user storage stats:", err);
          }
        },
        bulkCleanUserStorage: async (options) => {
          const res = await axios.post(`${API_BASE}/api/user/storage/clean`, options);
          await get().fetchVideos();
          await get().fetchUserStorageStats();
          return res.data;
        },
        fetchMe: async () => {
          const token = get().token || getAuthToken();
          if (!token) {
            set((state) => {
              state.isAuthOpen = true;
              state.user = null;
            });
            return;
          }
          try {
            const res = await axios.get(`${API_BASE}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            set((state) => {
              state.user = res.data;
              state.settings = res.data.settings;
              if (res.data.settings?.auth_storage_mode) {
                setAuthStorageMode(res.data.settings.auth_storage_mode);
              }
              if (res.data.settings?.default_view_mode) {
                state.viewMode = res.data.settings.default_view_mode;
              }
              state.isAuthOpen = false;
            });
            get().fetchVideos();
          } catch (err) {
            console.error("Auth verify error:", err);
            get().logout();
          }
        },
        upsertVideo: (video) =>
          set((state) => {
            state.videos[video.id] = video;
          }),
        removeVideo: (id) =>
          set((state) => {
            delete state.videos[id];
            delete state.videoProgress[id];
          }),
        upsertVideoProgress: (progress) =>
          set((state) => {
            state.videoProgress[progress.id] = progress;
          }),
        removeVideoProgress: (id) =>
          set((state) => {
            delete state.videoProgress[id];
          }),
        setGlobalFilter: (filter) =>
          set((state) => {
            state.globalFilter = filter;
          }),
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;
          }),
        setVideos: (videoList) =>
          set((state) => {
            state.videos = Object.fromEntries(videoList.map((v) => [v.id, v]));
          }),
        fetchVideos: async () => {
          try {
            const response = await axios.get(`${API_BASE}/api/videos`);
            set((state) => {
              state.videos = Object.fromEntries(
                response.data.map((v: VideoT) => [v.id, v]),
              );
            });
          } catch (error) {
            console.error("Failed to fetch videos:", error);
          }
        },
        setStartupSSE: (data) =>
          set((state) => {
            state.startupp = data;
          }),
      })),
      {
        name: "app-store",
        storage: dynamicStorage,
        partialize: (state) => ({ token: state.token, viewMode: state.viewMode }),
      },
    ),
    {
      name: "unified-app-store",
      enabled: process.env.NODE_ENV !== "production",
    },
  ),
);
axios.interceptors.request.use((config) => {
  const token = useAppStore.getState().token || getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAppStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
export default useAppStore;
