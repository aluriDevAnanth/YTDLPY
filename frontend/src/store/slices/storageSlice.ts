import axios from "axios";
import type { StateCreator } from "zustand";
import { API_BASE } from "../storage";
import type { AppState, StorageSliceState } from "../types";

export const createStorageSlice: StateCreator<
  AppState,
  [["zustand/immer", never], ["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  StorageSliceState
> = (set, get) => ({
  storageStats: null,

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
});
