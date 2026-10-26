import { describe, it, expect } from 'vitest'
import { hashUrl } from 'src/utils/hash'

describe('URL Hash Throughput Benchmarks', () => {
  it('should compute 500 async SHA-256 client URL hashes with high throughput', async () => {
    const count = 500
    const urls = Array.from({ length: count }, (_, i) => `https://www.youtube.com/watch?v=bench_hash_${i}`)

    const start = performance.now()
    const hashes = await Promise.all(urls.map((u) => hashUrl(u)))
    const elapsedMs = performance.now() - start
    const hashesPerSec = (count / elapsedMs) * 1000

    expect(hashes.length).toBe(count)
    expect(hashesPerSec).toBeGreaterThan(100) // Target >= 100 client hashes/sec
  })
})
