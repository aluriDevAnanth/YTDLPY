import axios from "axios";
import type { VideoT } from "src/schema";
import type { StateCreator } from "zustand";
import { API_BASE } from "../storage";
import type { AppState, VideoSliceState } from "../types";

export const createVideoSlice: StateCreator<
  AppState,
  [["zustand/immer", never], ["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  VideoSliceState
> = (set, get) => ({
  videos: {},
  videoProgress: {},

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
      const current = state.videoProgress[progress.id] || {};
      state.videoProgress[progress.id] = {
        ...current,
        ...progress,
        percent:
          typeof progress.percent === "number" && !isNaN(progress.percent)
            ? progress.percent
            : current.percent ?? 0,
        downloadedSize: progress.downloadedSize || current.downloadedSize,
        totalSize: progress.totalSize || current.totalSize,
      };
    }),

  removeVideoProgress: (id) =>
    set((state) => {
      delete state.videoProgress[id];
    }),

  setVideos: (videoList) =>
    set((state) => {
      state.videos = Object.fromEntries(videoList.map((v) => [v.id, v]));
    }),

  fetchVideos: async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/videos`);
      const newVideos = Object.fromEntries(
        response.data.map((v: VideoT) => [v.id, v]),
      );
      set((state) => {
        if (
          Object.keys(state.videos).length > 0 ||
          Object.keys(newVideos).length > 0
        ) {
          state.videos = newVideos;
        }
      });
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    }
  },

  pauseVideo: async (videoId) => {
    try {
      const res = await axios.post(`${API_BASE}/api/video/${videoId}/pause`);
      get().upsertVideo(res.data);
    } catch (err) {
      console.error("Failed to pause video:", err);
    }
  },

  resumeVideo: async (videoId) => {
    try {
      const res = await axios.post(`${API_BASE}/api/video/${videoId}/resume`);
      get().upsertVideo(res.data);
    } catch (err) {
      console.error("Failed to resume video:", err);
    }
  },

  retryVideo: async (videoId) => {
    try {
      const res = await axios.post(`${API_BASE}/api/video/${videoId}/retry`);
      get().upsertVideo(res.data);
    } catch (err) {
      console.error("Failed to retry video:", err);
    }
  },
});
