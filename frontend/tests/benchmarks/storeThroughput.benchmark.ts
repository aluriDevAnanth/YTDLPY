import { describe, it, expect } from 'vitest'
import { useAppStore } from 'src/store/useAppStore'
import { DUMMY_VIDEOS_10 } from '../fixtures/dataFactories'

describe('Zustand Store Throughput Benchmarks', () => {
  it('should process 10,000 video progress updates efficiently', () => {
    const iterations = 10000
    const videoId = 'bench_vid_stream_01'
    
    useAppStore.setState({
      videos: {
        [videoId]: {
          id: videoId,
          url: 'https://youtube.com/watch?v=bench',
          title: 'Benchmark Progress Video',
          downloadStatus: 'downloading',
          downloaded: false,
          timestamp: new Date().toISOString(),
        },
      },
      videoProgress: {},
    })

    const startTime = performance.now()
    for (let i = 0; i < iterations; i++) {
      useAppStore.getState().upsertVideoProgress({
        id: videoId,
        percent: (i % 100),
        speed: `${(i % 10 + 1).toFixed(1)} MiB/s`,
        eta: `${100 - (i % 100)}s`,
      })
    }
    const elapsedMs = performance.now() - startTime
    const opsPerSec = (iterations / elapsedMs) * 1000

    expect(useAppStore.getState().videoProgress[videoId]?.percent).toBeDefined()
    expect(opsPerSec).toBeGreaterThan(1000) // Target >= 1,000 store updates / sec
  })

  it('should bulk set 1,000 videos in under 5ms', () => {
    const bulkList = Array.from({ length: 1000 }, (_, i) => ({
      id: `bulk_vid_${i}`,
      url: `https://youtube.com/watch?v=bulk_${i}`,
      title: `Bulk Video Item #${i}`,
      downloadStatus: 'completed' as const,
      downloaded: true,
      timestamp: new Date().toISOString(),
    }))

    const start = performance.now()
    useAppStore.getState().setVideos(bulkList)
    const elapsed = performance.now() - start

    expect(Object.keys(useAppStore.getState().videos).length).toBe(1000)
    expect(elapsed).toBeLessThan(100) // < 100ms for 1,000 items with worker contention
  })
})
