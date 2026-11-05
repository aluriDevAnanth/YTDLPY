import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { PlaylistCreateInlineForm } from 'src/pages/components/playlist/dialog/PlaylistCreateInlineForm'

const INLINE_FORM_DATASETS = [
  { name: 'Quick Mix 1', loading: false },
  { name: 'Quick Mix 2', loading: false },
  { name: '', loading: false },
  { name: '   ', loading: false },
  { name: 'Pending Uploads', loading: true },
  { name: 'Audio Only Tracks', loading: false },
  { name: '4K Cinema Test', loading: false },
  { name: 'Live Archives', loading: false },
  { name: 'Shorts Collection', loading: false },
  { name: 'Final Exports', loading: false },
]

describe('PlaylistCreateInlineForm Unit Tests with 10 Datasets', () => {
  INLINE_FORM_DATASETS.forEach((dataset, index) => {
    it(`should render and handle interaction for dataset #${index}: "${dataset.name}"`, () => {
      const setNewPlaylistName = vi.fn()
      const onCancel = vi.fn()
      const onSubmit = vi.fn()

      render(
        <PlaylistCreateInlineForm
          newPlaylistName={dataset.name}
          setNewPlaylistName={setNewPlaylistName}
          loading={dataset.loading}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      )

      const input = screen.getByPlaceholderText('Playlist name...') as HTMLInputElement
      expect(input.value).toBe(dataset.name)
      
      fireEvent.change(input, { target: { value: 'Updated Title' } })
      expect(setNewPlaylistName).toHaveBeenCalledWith('Updated Title')

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)
      expect(onCancel).toHaveBeenCalled()

      const createButton = screen.getByRole('button', { name: /create & add/i })
      const isValid = dataset.name.trim().length > 0 && !dataset.loading
      
      if (isValid) {
        expect(createButton).not.toBeDisabled()
        fireEvent.click(createButton)
        expect(onSubmit).toHaveBeenCalled()
      } else {
        expect(createButton).toBeDisabled()
      }
    })
  })
})
