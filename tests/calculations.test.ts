import { describe, it, expect } from 'vitest';
import { calcDelta, outperformanceLabel } from '@/lib/calculations';

describe('calcDelta', () => {
  it('returns positive delta when LRM beats market', () => {
    expect(calcDelta(120, 100)).toEqual({ delta: 20, deltaPercent: 20 });
  });

  it('returns negative delta when LRM trails market', () => {
    expect(calcDelta(80, 100)).toEqual({ delta: -20, deltaPercent: -20 });
  });

  it('returns zero deltaPercent when market is zero (no divide-by-zero)', () => {
    expect(calcDelta(50, 0)).toEqual({ delta: 50, deltaPercent: 0 });
  });

  it('handles fractional inputs', () => {
    const r = calcDelta(105.5, 100);
    expect(r.delta).toBeCloseTo(5.5);
    expect(r.deltaPercent).toBeCloseTo(5.5);
  });
});

describe('outperformanceLabel', () => {
  it('formats positive percentages as outperform', () => {
    expect(outperformanceLabel(12.5)).toBe('outperform by 12.5%');
  });

  it('treats zero as outperform (>= 0)', () => {
    expect(outperformanceLabel(0)).toBe('outperform by 0.0%');
  });

  it('formats negative percentages as underperform with absolute value', () => {
    expect(outperformanceLabel(-7.25)).toBe('underperform by 7.3%');
  });
});
