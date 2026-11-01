import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { BackendStartupOverlay } from 'src/pages/components/startup/BackendStartupOverlay'
import { useAppStore } from 'src/store/useAppStore'

const STARTUP_DATASETS = [
  { typee: 'ongoing', message: 'Downloading FFmpeg binary (10%)...', progress: { percent: 10.5, speed: '2.5 MiB/s', percentPerSec: '1.2%/s', eta: '45s', downloadedSize: '10 MiB', totalSize: '100 MiB' } },
  { typee: 'ongoing', message: 'Downloading FFmpeg binary (30%)...', progress: { percent: 30.0, speed: '5.0 MiB/s', percentPerSec: '2.5%/s', eta: '30s', downloadedSize: '30 MiB', totalSize: '100 MiB' } },
  { typee: 'ongoing', message: 'Downloading FFmpeg binary (50%)...', progress: { percent: 50.0, speed: '8.1 MiB/s', percentPerSec: '4.0%/s', eta: '15s', downloadedSize: '50 MiB', totalSize: '100 MiB' } },
  { typee: 'ongoing', message: 'Downloading FFmpeg binary (75%)...', progress: { percent: 75.5, speed: '12.0 MiB/s', percentPerSec: '5.5%/s', eta: '5s', downloadedSize: '75.5 MiB', totalSize: '100 MiB' } },
  { typee: 'ongoing', message: 'Extracting FFmpeg binaries...', progress: { percent: 99.0, speed: '0 B/s', percentPerSec: '0%/s', eta: '1s', downloadedSize: '100 MiB', totalSize: '100 MiB' } },
  { typee: 'ongoing', message: 'Initializing Backend Services...', progress: undefined },
  { typee: 'error', message: 'Failed to download FFmpeg: Connection timeout (120s)', progress: undefined },
  { typee: 'error', message: 'Permission denied writing to bin/ directory', progress: undefined },
  { typee: 'success', message: 'Backend operational', progress: undefined },
  { typee: undefined, message: undefined, progress: undefined },
]

describe('BackendStartupOverlay Unit Tests with 10 Datasets', () => {
  STARTUP_DATASETS.forEach((dataset, index) => {
    it(`should properly render startup state for dataset #${index} (${dataset.typee || 'idle'})`, () => {
      useAppStore.setState({
        startupp: dataset as any,
      })

      const { container } = render(<BackendStartupOverlay />)

      if (!dataset.typee || dataset.typee === 'success') {
        expect(container.firstChild).toBeNull()
      } else if (dataset.typee === 'ongoing') {
        expect(screen.getByText(dataset.message || '')).toBeInTheDocument()
        if (dataset.progress) {
          expect(screen.getByText('FFmpeg Binary Download')).toBeInTheDocument()
          expect(screen.getByText(`${dataset.progress.percent.toFixed(1)}%`)).toBeInTheDocument()
          expect(screen.getByText(dataset.progress.speed)).toBeInTheDocument()
        } else {
          expect(screen.getByText('Initializing Backend')).toBeInTheDocument()
        }
      } else if (dataset.typee === 'error') {
        expect(screen.getByText('Backend Startup Failed')).toBeInTheDocument()
        expect(screen.getByText(dataset.message || '')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()
      }
    })
  })
})
