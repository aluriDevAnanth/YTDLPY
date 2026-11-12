import { describe, it, expect } from 'vitest'
import { hashUrl } from 'src/utils/hash'
import { DUMMY_URL_HASHES_10 } from '../../fixtures/dataFactories'

describe('hashUrl Unit Tests with 10 Dummy Datasets', () => {
  DUMMY_URL_HASHES_10.forEach((item, index) => {
    it(`should deterministically hash URL dataset #${index}: ${item.url}`, async () => {
      const hash1 = await hashUrl(item.url)
      const hash2 = await hashUrl(item.url)

      expect(typeof hash1).toBe('string')
      expect(hash1.length).toBe(16)
      expect(hash1).toBe(hash2)
    })
  })

  it('should generate distinct hashes for different URLs', async () => {
    const hashA = await hashUrl('https://youtube.com/watch?v=video_A')
    const hashB = await hashUrl('https://youtube.com/watch?v=video_B')
    expect(hashA).not.toBe(hashB)
  })

  it('should handle empty and special character URLs safely', async () => {
    const emptyHash = await hashUrl('')
    expect(typeof emptyHash).toBe('string')
    expect(emptyHash.length).toBe(16)

    const unicodeHash = await hashUrl('https://youtube.com/watch?v=🔥_日本語_123')
    expect(typeof unicodeHash).toBe('string')
    expect(unicodeHash.length).toBe(16)
  })
})
