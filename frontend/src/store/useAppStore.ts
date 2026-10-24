import axios from "axios";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createAuthSlice } from "./slices/authSlice";
import { createPlaylistSlice } from "./slices/playlistSlice";
import { createStorageSlice } from "./slices/storageSlice";
import { createUiSlice } from "./slices/uiSlice";
import { createVideoSlice } from "./slices/videoSlice";
import {
  dynamicStorage,
  getAuthStorageMode,
  getAuthToken,
  removeAuthToken,
  setAuthStorageMode,
  setAuthToken,
} from "./storage";
import type {
  ActivePage,
  AppState,
  StartupProgress,
  StartupSSE,
  User,
  UserSettings,
  UserStorageStats,
} from "./types";

export type {
  ActivePage,
  AppState,
  StartupProgress,
  StartupSSE,
  User,
  UserSettings,
  UserStorageStats,
};

export {
  getAuthStorageMode,
  getAuthToken,
  removeAuthToken,
  setAuthStorageMode,
  setAuthToken,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createAuthSlice(...a),
        ...createVideoSlice(...a),
        ...createPlaylistSlice(...a),
        ...createStorageSlice(...a),
        ...createUiSlice(...a),
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
