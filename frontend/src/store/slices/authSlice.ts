import axios from "axios";
import type { StateCreator } from "zustand";
import {
  API_BASE,
  getAuthToken,
  removeAuthToken,
  setAuthStorageMode,
  setAuthToken,
} from "../storage";
import type { AppState, AuthSliceState } from "../types";

export const createAuthSlice: StateCreator<
  AppState,
  [["zustand/immer", never], ["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  AuthSliceState
> = (set, get) => ({
  token: getAuthToken(),
  user: null,
  settings: null,
  isAuthOpen: !getAuthToken(),

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
});
