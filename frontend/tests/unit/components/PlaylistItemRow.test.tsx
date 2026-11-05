import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { PlaylistItemRow } from 'src/pages/components/playlist/dialog/PlaylistItemRow'
import type { PlaylistT } from 'src/schema'

const ITEM_ROW_DATASETS: Array<{ playlist: PlaylistT; isInPlaylist: boolean; loading: boolean }> = Array.from(
  { length: 10 },
  (_, i) => ({
    playlist: {
      id: `playlist_row_${i}`,
      name: `Playlist Category #${i}`,
      user_id: `user_${i}`,
      is_default: i === 0,
      video_count: i * 2,
      created_at: new Date().toISOString(),
      videos: [],
    },
    isInPlaylist: i % 2 === 0,
    loading: i === 5,
  })
)

describe('PlaylistItemRow Unit Tests with 10 Datasets', () => {
  ITEM_ROW_DATASETS.forEach((dataset, index) => {
    it(`should render playlist item row correctly for dataset #${index}: ${dataset.playlist.name}`, () => {
      const onToggle = vi.fn()

      render(
        <PlaylistItemRow
          playlist={dataset.playlist}
          isInPlaylist={dataset.isInPlaylist}
          loading={dataset.loading}
          onToggle={onToggle}
        />
      )

      expect(screen.getByText(dataset.playlist.name)).toBeInTheDocument()
      const expectedCountText = `${dataset.playlist.video_count} video${dataset.playlist.video_count === 1 ? '' : 's'}`
      expect(screen.getByText(expectedCountText)).toBeInTheDocument()

      const rowContainer = screen.getByText(dataset.playlist.name).closest('div[class*="flex items-center justify-between"]')
      expect(rowContainer).toBeInTheDocument()

      if (rowContainer) {
        fireEvent.click(rowContainer)
        if (dataset.loading) {
          expect(onToggle).not.toHaveBeenCalled()
        } else {
          expect(onToggle).toHaveBeenCalledWith(dataset.playlist.id, dataset.isInPlaylist)
        }
      }
    })
  })
})
