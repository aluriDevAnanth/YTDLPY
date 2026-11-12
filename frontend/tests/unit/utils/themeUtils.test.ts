import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme } from 'src/pages/components/theme/themeUtils';

const datasets = [
  { isDark: true, expectedClass: 'dark' },
  { isDark: false, expectedClass: '' },
  { isDark: true, expectedClass: 'dark' },
  { isDark: false, expectedClass: '' },
  { isDark: true, expectedClass: 'dark' },
  { isDark: false, expectedClass: '' },
  { isDark: true, expectedClass: 'dark' },
  { isDark: false, expectedClass: '' },
  { isDark: true, expectedClass: 'dark' },
  { isDark: false, expectedClass: '' },
];

describe('themeUtils Unit Tests with 10 Datasets', () => {
  beforeEach(() => {
    document.documentElement.className = '';
  });

  datasets.forEach((data, index) => {
    it(`dataset #${index}: should apply theme isDark=${data.isDark} accurately to documentElement`, () => {
      applyTheme(data.isDark);
      if (data.isDark) {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      } else {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      }
    });
  });
});
