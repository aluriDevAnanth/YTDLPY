import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { GridEmptyState } from 'src/pages/components/grid/GridEmptyState'

const EMPTY_STATE_DATASETS = [
  { globalFilter: '', statusFilter: 'all', expectedText: 'Use the top header form to add video downloads' },
  { globalFilter: 'music', statusFilter: 'all', expectedText: 'No matches for "music"' },
  { globalFilter: 'react 19 tutorial', statusFilter: 'all', expectedText: 'No matches for "react 19 tutorial"' },
  { globalFilter: '', statusFilter: 'completed', expectedText: 'No videos with status "completed"' },
  { globalFilter: '', statusFilter: 'downloading', expectedText: 'No videos with status "downloading"' },
  { globalFilter: '', statusFilter: 'failed', expectedText: 'No videos with status "failed"' },
  { globalFilter: '', statusFilter: 'pending', expectedText: 'No videos with status "pending"' },
  { globalFilter: 'podcast', statusFilter: 'completed', expectedText: 'No matches for "podcast"' },
  { globalFilter: '4k 60fps', statusFilter: 'all', expectedText: 'No matches for "4k 60fps"' },
  { globalFilter: '日本語', statusFilter: 'all', expectedText: 'No matches for "日本語"' },
]

describe('GridEmptyState Unit Tests with 10 Datasets', () => {
  EMPTY_STATE_DATASETS.forEach((dataset, index) => {
    it(`should render appropriate empty message for dataset #${index}`, () => {
      render(
        <GridEmptyState
          globalFilter={dataset.globalFilter}
          statusFilter={dataset.statusFilter}
        />
      )

      expect(screen.getByText('No videos found')).toBeInTheDocument()
      expect(screen.getByText(dataset.expectedText)).toBeInTheDocument()
    })
  })
})
