import axios from "axios";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
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
}
export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
  created_at: string;
  settings?: UserSettings;
}
export interface StartupSSE {
  message: string;
  typee: "success" | "error" | "ongoing";
  sseType: string;
  dataID: string;
}
interface AppState {
  token: string | null;
  user: User | null;
  settings: UserSettings | null;
  isAuthOpen: boolean;
  isAdminOpen: boolean;
  isSettingsOpen: boolean;
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
        token: localStorage.getItem("token"),
        user: null,
        settings: null,
        isAuthOpen: false,
        isAdminOpen: false,
        isSettingsOpen: false,
        videos: {},
        videoProgress: {},
        globalFilter: "",
        viewMode: "grid",
        startupp: null,
        setAuth: (token, user) => {
          localStorage.setItem("token", token);
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
            if (user.settings?.default_view_mode) {
              state.viewMode = user.settings.default_view_mode as "grid" | "table";
            }
          }),
        setSettings: (settings) =>
          set((state) => {
            state.settings = settings;
            if (settings.default_view_mode) {
              state.viewMode = settings.default_view_mode as "grid" | "table";
            }
          }),
        logout: () => {
          localStorage.removeItem("token");
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
        fetchMe: async () => {
          const token = get().token || localStorage.getItem("token");
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
  const token = useAppStore.getState().token || localStorage.getItem("token");
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
