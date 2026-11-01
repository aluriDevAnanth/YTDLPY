import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from 'src/store/useAppStore'
import { DUMMY_VIDEOS_10 } from '../../fixtures/dataFactories'
import type { VideoT } from 'src/schema'

describe('Video Store Slice Unit Tests with 10 Datasets', () => {
  beforeEach(() => {
    useAppStore.setState({ videos: {}, videoProgress: {} })
  })

  DUMMY_VIDEOS_10.forEach((video, index) => {
    it(`should upsert, track progress, and remove video dataset #${index}: ${video.title}`, () => {
      const mockVideo: VideoT = {
        id: video.id,
        url: video.url,
        title: video.title,
        downloadStatus: video.status,
        downloaded: video.status === 'completed',
        timestamp: new Date().toISOString(),
      }

      // 1. Upsert video
      useAppStore.getState().upsertVideo(mockVideo)
      expect(useAppStore.getState().videos[video.id]).toEqual(mockVideo)

      // 2. Track download progress
      const progressPayload = {
        id: video.id,
        percent: video.progress,
        speed: video.speed,
        eta: video.eta,
      }
      useAppStore.getState().upsertVideoProgress(progressPayload)
      const currentProgress = useAppStore.getState().videoProgress[video.id]
      expect(currentProgress.percent).toBe(video.progress)
      expect(currentProgress.speed).toBe(video.speed)

      // 3. Remove video
      useAppStore.getState().removeVideo(video.id)
      expect(useAppStore.getState().videos[video.id]).toBeUndefined()
      expect(useAppStore.getState().videoProgress[video.id]).toBeUndefined()
    })
  })

  it('should bulk set 10 videos correctly', () => {
    const list: VideoT[] = DUMMY_VIDEOS_10.map((v) => ({
      id: v.id,
      url: v.url,
      title: v.title,
      downloadStatus: v.status,
      downloaded: v.status === 'completed',
      timestamp: new Date().toISOString(),
    }))

    useAppStore.getState().setVideos(list)
    const stored = useAppStore.getState().videos
    expect(Object.keys(stored).length).toBe(10)
    DUMMY_VIDEOS_10.forEach((v) => {
      expect(stored[v.id].title).toBe(v.title)
    })
  })
})
