import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from 'src/store/useAppStore'
import { DUMMY_PLAYLISTS_10 } from '../../fixtures/dataFactories'
import type { PlaylistT } from 'src/schema'

describe('Playlist Store Slice Unit Tests with 10 Datasets', () => {
  beforeEach(() => {
    useAppStore.setState({ playlists: [], activePlaylistId: null })
  })

  DUMMY_PLAYLISTS_10.forEach((playlist, index) => {
    it(`should set, select, and manage playlist dataset #${index}: ${playlist.name}`, () => {
      const mockPlaylist: PlaylistT = {
        id: playlist.id,
        name: playlist.name,
        user_id: playlist.userId,
        is_default: index === 0,
        video_count: playlist.itemCount,
        created_at: playlist.created_at,
        videos: [],
      }

      // 1. Set playlists
      useAppStore.setState({ playlists: [mockPlaylist] })
      expect(useAppStore.getState().playlists.length).toBe(1)
      expect(useAppStore.getState().playlists[0].id).toBe(playlist.id)

      // 2. Select active playlist
      useAppStore.getState().setActivePlaylistId(playlist.id)
      expect(useAppStore.getState().activePlaylistId).toBe(playlist.id)

      // 3. Clear active playlist
      useAppStore.getState().setActivePlaylistId(null)
      expect(useAppStore.getState().activePlaylistId).toBeNull()

      // 4. Toggle playlist manager open
      useAppStore.getState().setPlaylistManagerOpen(true)
      expect(useAppStore.getState().isPlaylistManagerOpen).toBe(true)
      useAppStore.getState().setPlaylistManagerOpen(false)
      expect(useAppStore.getState().isPlaylistManagerOpen).toBe(false)
    })
  })
})
