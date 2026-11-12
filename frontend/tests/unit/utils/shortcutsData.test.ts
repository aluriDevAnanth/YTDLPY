import { describe, it, expect } from 'vitest';
import { SHORTCUTS_DATA } from 'src/pages/components/shortcuts/shortcutsData';

const datasets = Array.from({ length: 10 }, (_, i) => ({
  index: i,
  shortcut: SHORTCUTS_DATA[i % SHORTCUTS_DATA.length],
}));

describe('shortcutsData Unit Tests with 10 Datasets', () => {
  datasets.forEach(({ index, shortcut }) => {
    it(`dataset #${index}: shortcut '${shortcut.description}' should have valid keys and category`, () => {
      expect(shortcut.keys.length).toBeGreaterThan(0);
      expect(shortcut.description.length).toBeGreaterThan(0);
      expect(shortcut.category.length).toBeGreaterThan(0);
    });
  });

  it('should define a comprehensive shortcuts collection', () => {
    expect(SHORTCUTS_DATA.length).toBeGreaterThan(10);
  });
});
