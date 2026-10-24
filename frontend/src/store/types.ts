import type { PlaylistT, VideoProgressT, VideoT } from "../schema";

export interface UserSettings {
  user_id: string;
  default_format: "BEST" | "BESTAUDIO" | "WORST";
  default_view_mode?: "grid" | "table";
  max_concurrent_downloads: number;
  auto_generate_vtt: boolean;
  theme: string;
  cookies_source?: "inherit" | "none" | "browser" | "custom" | "storage_file";
  cookies_browser?: string;
  cookies_profile?: string;
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

export type ActivePage = "downloads" | "admin" | "toast-tester";

export interface AuthSliceState {
  token: string | null;
  user: User | null;
  settings: UserSettings | null;
  isAuthOpen: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  setSettings: (settings: UserSettings) => void;
  logout: () => void;
  setAuthOpen: (open: boolean) => void;
  fetchMe: () => Promise<void>;
}

export interface VideoSliceState {
  videos: Record<string, VideoT>;
  videoProgress: Record<string, VideoProgressT>;
  upsertVideo: (video: VideoT) => void;
  removeVideo: (id: string) => void;
  upsertVideoProgress: (progress: VideoProgressT) => void;
  removeVideoProgress: (id: string) => void;
  setVideos: (videos: VideoT[]) => void;
  fetchVideos: () => Promise<void>;
  pauseVideo: (videoId: string) => Promise<void>;
  resumeVideo: (videoId: string) => Promise<void>;
  retryVideo: (videoId: string) => Promise<void>;
}

export interface PlaylistSliceState {
  playlists: PlaylistT[];
  activePlaylistId: string | null;
  isPlaylistManagerOpen: boolean;
  setPlaylistManagerOpen: (open: boolean) => void;
  setActivePlaylistId: (id: string | null) => void;
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<PlaylistT | null>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addVideoToPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  toggleWatchLater: (videoId: string) => Promise<boolean>;
}

export interface UiSliceState {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  isAdminOpen: boolean;
  isSettingsOpen: boolean;
  isStorageManagerOpen: boolean;
  isAddDownloadOpen: boolean;
  isShortcutsHelpOpen: boolean;
  globalFilter: string;
  viewMode: "table" | "grid";
  startupp: StartupSSE | null;
  setAdminOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setStorageManagerOpen: (open: boolean) => void;
  setAddDownloadOpen: (open: boolean) => void;
  setShortcutsHelpOpen: (open: boolean) => void;
  setGlobalFilter: (filter: string) => void;
  setViewMode: (mode: "table" | "grid") => void;
  setStartupSSE: (data: StartupSSE) => void;
}

export interface StorageSliceState {
  storageStats: UserStorageStats | null;
  fetchUserStorageStats: () => Promise<void>;
  bulkCleanUserStorage: (options: {
    clean_watched?: boolean;
    clear_all?: boolean;
    video_ids?: string[];
  }) => Promise<{ purged_count: number; freed_bytes: number; formatted_freed_bytes: string }>;
}

export type AppState = AuthSliceState &
  VideoSliceState &
  PlaylistSliceState &
  UiSliceState &
  StorageSliceState;
