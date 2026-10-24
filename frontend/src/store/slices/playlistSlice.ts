import axios from "axios";
import type { StateCreator } from "zustand";
import { API_BASE } from "../storage";
import type { AppState, PlaylistSliceState } from "../types";

export const createPlaylistSlice: StateCreator<
  AppState,
  [["zustand/immer", never], ["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  PlaylistSliceState
> = (set, get) => ({
  playlists: [],
  activePlaylistId: null,
  isPlaylistManagerOpen: false,

  setPlaylistManagerOpen: (open) =>
    set((state) => {
      state.isPlaylistManagerOpen = open;
    }),

  setActivePlaylistId: (id) =>
    set((state) => {
      state.activePlaylistId = id;
    }),

  fetchPlaylists: async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/playlists`);
      set((state) => {
        state.playlists = res.data;
      });
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
    }
  },

  createPlaylist: async (name, description = "") => {
    try {
      const res = await axios.post(`${API_BASE}/api/playlists`, {
        name,
        description,
      });
      get().fetchPlaylists();
      return res.data;
    } catch (err) {
      console.error("Failed to create playlist:", err);
      return null;
    }
  },

  deletePlaylist: async (playlistId) => {
    try {
      await axios.delete(`${API_BASE}/api/playlists/${playlistId}`);
      if (get().activePlaylistId === playlistId) {
        set((state) => {
          state.activePlaylistId = null;
        });
      }
      get().fetchPlaylists();
    } catch (err) {
      console.error("Failed to delete playlist:", err);
    }
  },

  addVideoToPlaylist: async (playlistId, videoId) => {
    try {
      await axios.post(`${API_BASE}/api/playlists/${playlistId}/videos`, {
        video_id: videoId,
      });
      get().fetchPlaylists();
    } catch (err) {
      console.error("Failed to add video to playlist:", err);
    }
  },

  removeVideoFromPlaylist: async (playlistId, videoId) => {
    try {
      await axios.delete(
        `${API_BASE}/api/playlists/${playlistId}/videos/${videoId}`,
      );
      get().fetchPlaylists();
    } catch (err) {
      console.error("Failed to remove video from playlist:", err);
    }
  },

  toggleWatchLater: async (videoId) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/playlists/watch-later/toggle/${videoId}`,
      );
      get().fetchPlaylists();
      return !!res.data.in_watch_later;
    } catch (err) {
      console.error("Failed to toggle watch later:", err);
      return false;
    }
  },
});
