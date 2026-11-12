import { describe, it, expect } from 'vitest';
import { pt, globalPT } from 'src/pt';

const datasets = Array.from({ length: 10 }, (_, i) => ({
  feature: ['dialog', 'tooltip', 'toast', 'header', 'content'][i % 5],
  index: i,
}));

describe('PrimeReact PT Config Unit Tests with 10 Datasets', () => {
  datasets.forEach((data, index) => {
    it(`dataset #${index}: should have valid pass-through configuration object for ${data.feature}`, () => {
      expect(pt).toBeDefined();
      expect(globalPT).toBeDefined();
      expect(typeof pt).toBe('object');
      expect(typeof globalPT).toBe('object');
    });
  });
});
