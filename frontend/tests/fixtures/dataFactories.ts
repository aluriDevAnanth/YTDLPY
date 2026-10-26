export interface DummyUser {
  id: string
  username: string
  role: 'admin' | 'user'
  created_at: string
  settings: {
    default_format: string
    cookies_source: string
    cookies_browser: string
    cookies_profile: string | null
  }
}

export interface DummyVideo {
  id: string
  url: string
  title: string
  thumbnailUrl?: string
  duration?: string | number
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled'
  progress?: number
  speed?: string
  eta?: string
  filesize?: number
  playlistId?: string
  error?: string
}

export interface DummyPlaylist {
  id: string
  name: string
  userId: string
  itemCount: number
  created_at: string
}

export const DUMMY_USERS_10: DummyUser[] = Array.from({ length: 10 }, (_, i) => ({
  id: `usr_dummy_${i.toString().padStart(2, '0')}`,
  username: `dummy_user_${i}`,
  role: i === 0 ? 'admin' : 'user',
  created_at: new Date(2026, 0, i + 1).toISOString(),
  settings: {
    default_format: ['BEST', 'BESTAUDIO', 'WORST', 'BESTVIDEO'][i % 4],
    cookies_source: i % 2 === 0 ? 'browser' : 'custom',
    cookies_browser: ['chrome', 'firefox', 'edge', 'brave', 'opera'][i % 5],
    cookies_profile: i % 2 === 0 ? `Profile ${i}` : null,
  },
}))

export const DUMMY_VIDEOS_10: DummyVideo[] = Array.from({ length: 10 }, (_, i) => ({
  id: `vid_dummy_${i.toString().padStart(2, '0')}`,
  url: `https://www.youtube.com/watch?v=mock_video_id_${i}`,
  title: `Mock Video Title #${i} - High Quality Stream`,
  thumbnailUrl: `/api/files/vid_dummy_${i.toString().padStart(2, '0')}_thumbnail.jpg`,
  duration: 120 + i * 45,
  status: (['completed', 'downloading', 'pending', 'failed', 'completed'] as const)[i % 5],
  progress: (i * 10) % 100,
  speed: `${(1.5 + i * 0.8).toFixed(1)} MiB/s`,
  eta: `${10 + i * 2}s`,
  filesize: 1024 * 1024 * (5 + i * 10),
  playlistId: i % 3 === 0 ? `playlist_dummy_${i}` : undefined,
}))

export const DUMMY_PLAYLISTS_10: DummyPlaylist[] = Array.from({ length: 10 }, (_, i) => ({
  id: `playlist_dummy_${i.toString().padStart(2, '0')}`,
  name: `Playlist Collection ${i} - Favorites`,
  userId: `usr_dummy_${i.toString().padStart(2, '0')}`,
  itemCount: i * 3 + 1,
  created_at: new Date(2026, 1, i + 1).toISOString(),
}))

export const DUMMY_LOG_ENTRIES_10 = Array.from({ length: 10 }, (_, i) => ({
  timestamp: new Date(2026, 2, i + 1, 10, 0, 0).toISOString(),
  stage: [
    'INITIALIZATION_START',
    'YT_DLP_METADATA_START',
    'YT_DLP_METADATA_END',
    'MEDIA_DOWNLOAD_START',
    'DOWNLOAD_PROGRESS',
    'MEDIA_DOWNLOAD_END',
    'FFMPEG_SPRITES_START',
    'FFMPEG_SPRITES_END',
    'BUNDLE_PACKING_START',
    'COMPLETED',
  ][i],
  level: 'INFO',
  message: `Log event message step ${i}`,
  details: { stepIndex: i, testId: `test_log_${i}` },
}))

export const DUMMY_URL_HASHES_10 = Array.from({ length: 10 }, (_, i) => ({
  url: `https://youtube.com/watch?v=sample_${i}`,
  expectedLength: 16,
}))
