/**
 * Design Token Values Verification Tests
 *
 * Validates that tailwind.config.js contains the correct design token values
 * as defined in the design system specification.
 *
 * Validates: Requirements 2.1, 2.2, 3.1, 3.2, 4.1, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 7.1, 7.2
 */
import { describe, it, expect } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindConfig = require('../../tailwind.config.js');

const themeExtend = tailwindConfig.theme.extend;

describe('Design Token Values', () => {
  describe('fontSize tokens (Requirements 2.1, 2.2)', () => {
    const fontSize = themeExtend.fontSize;

    it('hero-display: 80px with lineHeight 1.05 and letterSpacing -2px', () => {
      expect(fontSize['hero-display'][0]).toBe('80px');
      expect(fontSize['hero-display'][1].lineHeight).toBe('1.05');
      expect(fontSize['hero-display'][1].letterSpacing).toBe('-2px');
    });

    it('display-lg: 56px with lineHeight 1.10 and letterSpacing -1px', () => {
      expect(fontSize['display-lg'][0]).toBe('56px');
      expect(fontSize['display-lg'][1].lineHeight).toBe('1.10');
      expect(fontSize['display-lg'][1].letterSpacing).toBe('-1px');
    });

    it('heading-1: 48px with lineHeight 1.15 and letterSpacing -0.5px', () => {
      expect(fontSize['heading-1'][0]).toBe('48px');
      expect(fontSize['heading-1'][1].lineHeight).toBe('1.15');
      expect(fontSize['heading-1'][1].letterSpacing).toBe('-0.5px');
    });

    it('heading-2: 36px with lineHeight 1.20 and letterSpacing -0.5px', () => {
      expect(fontSize['heading-2'][0]).toBe('36px');
      expect(fontSize['heading-2'][1].lineHeight).toBe('1.20');
      expect(fontSize['heading-2'][1].letterSpacing).toBe('-0.5px');
    });

    it('heading-3: 28px with lineHeight 1.25 and letterSpacing 0', () => {
      expect(fontSize['heading-3'][0]).toBe('28px');
      expect(fontSize['heading-3'][1].lineHeight).toBe('1.25');
      expect(fontSize['heading-3'][1].letterSpacing).toBe('0');
    });

    it('heading-4: 22px with lineHeight 1.30 and letterSpacing 0', () => {
      expect(fontSize['heading-4'][0]).toBe('22px');
      expect(fontSize['heading-4'][1].lineHeight).toBe('1.30');
      expect(fontSize['heading-4'][1].letterSpacing).toBe('0');
    });

    it('heading-5: 18px with lineHeight 1.40 and letterSpacing 0', () => {
      expect(fontSize['heading-5'][0]).toBe('18px');
      expect(fontSize['heading-5'][1].lineHeight).toBe('1.40');
      expect(fontSize['heading-5'][1].letterSpacing).toBe('0');
    });
  });

  describe('spacing tokens (Requirements 3.1, 3.2)', () => {
    const spacing = themeExtend.spacing;

    it('xxs === 4px', () => {
      expect(spacing['xxs']).toBe('4px');
    });

    it('xs === 8px', () => {
      expect(spacing['xs']).toBe('8px');
    });

    it('sm === 12px', () => {
      expect(spacing['sm']).toBe('12px');
    });

    it('md === 16px', () => {
      expect(spacing['md']).toBe('16px');
    });

    it('lg === 20px', () => {
      expect(spacing['lg']).toBe('20px');
    });

    it('xl === 24px', () => {
      expect(spacing['xl']).toBe('24px');
    });

    it('xxl === 32px', () => {
      expect(spacing['xxl']).toBe('32px');
    });

    it('xxxl === 40px', () => {
      expect(spacing['xxxl']).toBe('40px');
    });

    it('section-sm === 48px', () => {
      expect(spacing['section-sm']).toBe('48px');
    });

    it('section === 64px', () => {
      expect(spacing['section']).toBe('64px');
    });

    it('section-lg === 96px', () => {
      expect(spacing['section-lg']).toBe('96px');
    });

    it('hero === 120px', () => {
      expect(spacing['hero']).toBe('120px');
    });
  });

  describe('borderRadius tokens (Requirement 4.1)', () => {
    const borderRadius = themeExtend.borderRadius;

    it('xs === 4px', () => {
      expect(borderRadius['xs']).toBe('4px');
    });

    it('sm === 6px', () => {
      expect(borderRadius['sm']).toBe('6px');
    });

    it('md === 8px', () => {
      expect(borderRadius['md']).toBe('8px');
    });

    it('lg === 12px', () => {
      expect(borderRadius['lg']).toBe('12px');
    });

    it('xl === 16px', () => {
      expect(borderRadius['xl']).toBe('16px');
    });

    it('xxl === 20px', () => {
      expect(borderRadius['xxl']).toBe('20px');
    });

    it('xxxl === 24px', () => {
      expect(borderRadius['xxxl']).toBe('24px');
    });
  });

  describe('boxShadow tokens (Requirements 5.1, 5.2, 5.3, 5.4, 5.5)', () => {
    const boxShadow = themeExtend.boxShadow;

    it('subtle === rgba(15, 15, 15, 0.04) 0px 1px 2px 0px', () => {
      expect(boxShadow['subtle']).toBe('rgba(15, 15, 15, 0.04) 0px 1px 2px 0px');
    });

    it('card === rgba(15, 15, 15, 0.08) 0px 4px 12px 0px', () => {
      expect(boxShadow['card']).toBe('rgba(15, 15, 15, 0.08) 0px 4px 12px 0px');
    });

    it('elevated === rgba(15, 15, 15, 0.20) 0px 24px 48px -8px', () => {
      expect(boxShadow['elevated']).toBe('rgba(15, 15, 15, 0.20) 0px 24px 48px -8px');
    });

    it('modal === rgba(15, 15, 15, 0.16) 0px 16px 48px -8px', () => {
      expect(boxShadow['modal']).toBe('rgba(15, 15, 15, 0.16) 0px 16px 48px -8px');
    });
  });

  describe('layout tokens (Requirements 6.1, 6.2)', () => {
    it('maxWidth.container === 1280px', () => {
      expect(themeExtend.maxWidth['container']).toBe('1280px');
    });

    it('screens.xs === 480px', () => {
      expect(themeExtend.screens['xs']).toBe('480px');
    });
  });

  describe('component tokens (Requirements 7.1, 7.2)', () => {
    it('height.input === 44px', () => {
      expect(themeExtend.height['input']).toBe('44px');
    });

    it('minHeight.input === 44px', () => {
      expect(themeExtend.minHeight['input']).toBe('44px');
    });
  });
});
