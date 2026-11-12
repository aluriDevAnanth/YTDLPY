import { describe, it, expect } from 'vitest';
import { DownloadFormS } from 'src/schema';

const datasets = Array.from({ length: 10 }, (_, i) => ({
  id: `form_test_${i}`,
  url: `https://youtube.com/watch?v=sample_${i}`,
  format: ['BEST', 'BESTAUDIO', 'WORST'][i % 3] as 'BEST' | 'BESTAUDIO' | 'WORST',
  type: (i % 2 === 0 ? 'scan' : 'download') as 'scan' | 'download',
}));

describe('Zod Schema Unit Tests with 10 Datasets', () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should validate DownloadFormS for url ${data.url}`, () => {
      const parsed = DownloadFormS.safeParse(data);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.id).toBe(data.id);
        expect(parsed.data.format).toBe(data.format);
        expect(parsed.data.type).toBe(data.type);
      }
    });
  });
});
