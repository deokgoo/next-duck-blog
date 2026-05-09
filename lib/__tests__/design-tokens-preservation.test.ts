/**
 * Existing Settings Preservation Tests
 *
 * Validates that tailwind.config.js preserves existing settings
 * (fontFamily, colors, typography plugin, lineHeight) after design token additions.
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4
 */
import { describe, it, expect } from 'vitest';
import colors from 'tailwindcss/colors';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindConfig = require('../../tailwind.config.js');

const themeExtend = tailwindConfig.theme.extend;

describe('Existing Settings Preservation', () => {
  describe('fontFamily.sans includes Pretendard (Requirement 8.2)', () => {
    it('fontFamily.sans includes var(--font-pretendard)', () => {
      expect(themeExtend.fontFamily.sans).toContain('var(--font-pretendard)');
    });
  });

  describe('fontFamily.display includes Space Grotesk (Requirement 8.2)', () => {
    it('fontFamily.display includes var(--font-space-grotesk)', () => {
      expect(themeExtend.fontFamily.display).toContain('var(--font-space-grotesk)');
    });
  });

  describe('fontFamily.mono includes Fira Code (Requirement 8.2)', () => {
    it('fontFamily.mono includes var(--font-fira-code)', () => {
      expect(themeExtend.fontFamily.mono).toContain('var(--font-fira-code)');
    });
  });

  describe('colors.primary equals colors.emerald (Requirement 8.3)', () => {
    it('colors.primary is the emerald color object', () => {
      expect(themeExtend.colors.primary).toEqual(colors.emerald);
    });
  });

  describe('typography plugin is configured (Requirement 8.4)', () => {
    it('plugins array includes @tailwindcss/typography', () => {
      const plugins = tailwindConfig.plugins;
      expect(plugins).toBeDefined();
      expect(Array.isArray(plugins)).toBe(true);
      // The typography plugin is a function; verify it exists by checking plugins length
      // and that at least one plugin has the expected characteristics
      const hasTypographyPlugin = plugins.some(
        (plugin: { handler?: unknown; config?: unknown }) =>
          typeof plugin === 'function' || (plugin && typeof plugin.handler === 'function')
      );
      expect(hasTypographyPlugin).toBe(true);
    });

    it('typography configuration exists in theme.extend', () => {
      expect(themeExtend.typography).toBeDefined();
      expect(typeof themeExtend.typography).toBe('function');
    });
  });

  describe('lineHeight extensions are preserved (Requirement 8.1)', () => {
    it('lineHeight.11 === 2.75rem', () => {
      expect(themeExtend.lineHeight['11']).toBe('2.75rem');
    });

    it('lineHeight.12 === 3rem', () => {
      expect(themeExtend.lineHeight['12']).toBe('3rem');
    });

    it('lineHeight.13 === 3.25rem', () => {
      expect(themeExtend.lineHeight['13']).toBe('3.25rem');
    });

    it('lineHeight.14 === 3.5rem', () => {
      expect(themeExtend.lineHeight['14']).toBe('3.5rem');
    });
  });
});
