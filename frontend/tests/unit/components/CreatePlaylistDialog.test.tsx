import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { CreatePlaylistDialog } from 'src/pages/components/playlist/dialog/CreatePlaylistDialog'

const PLAYLIST_DATASETS = [
  { name: 'Favorites', description: 'My favorite music videos', loading: false },
  { name: 'Coding Beats', description: 'Lo-Fi and focus tracks', loading: false },
  { name: 'Tutorials', description: 'Tech tutorials collection', loading: true },
  { name: 'Podcasts', description: 'Weekly podcasts episodes', loading: false },
  { name: 'Gaming Clips', description: 'Best game highlights', loading: false },
  { name: 'Travel 2026', description: 'Japan and Europe trip vlogs', loading: false },
  { name: 'Workout', description: 'Gym and running motivation', loading: true },
  { name: 'Watch Later', description: 'Queued to watch on weekend', loading: false },
  { name: 'Documentaries', description: 'Nature and science series', loading: false },
  { name: 'Conference Talks', description: 'Keynotes and deep dives', loading: false },
]

describe('CreatePlaylistDialog Unit Tests with 10 Datasets', () => {
  PLAYLIST_DATASETS.forEach((dataset, index) => {
    it(`should render and handle interaction for playlist dataset #${index}: ${dataset.name}`, () => {
      const onHide = vi.fn()
      const setName = vi.fn()
      const setDescription = vi.fn()
      const onSubmit = vi.fn()

      render(
        <CreatePlaylistDialog
          visible={true}
          onHide={onHide}
          name={dataset.name}
          setName={setName}
          description={dataset.description}
          setDescription={setDescription}
          loading={dataset.loading}
          onSubmit={onSubmit}
        />
      )

      expect(screen.getAllByText('Create Playlist').length).toBeGreaterThanOrEqual(1)
      
      const titleInput = screen.getByLabelText('Playlist Title') as HTMLInputElement
      expect(titleInput.value).toBe(dataset.name)
      fireEvent.change(titleInput, { target: { value: 'New Name' } })
      expect(setName).toHaveBeenCalledWith('New Name')

      const descInput = screen.getByLabelText('Playlist Description') as HTMLInputElement
      expect(descInput.value).toBe(dataset.description)
      fireEvent.change(descInput, { target: { value: 'New Desc' } })
      expect(setDescription).toHaveBeenCalledWith('New Desc')

      const submitButton = screen.getByRole('button', { name: /create playlist/i })
      if (dataset.loading) {
        expect(submitButton).toBeDisabled()
      } else {
        expect(submitButton).not.toBeDisabled()
        fireEvent.click(submitButton)
        expect(onSubmit).toHaveBeenCalled()
      }
    })
  })
})
