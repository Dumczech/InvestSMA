import { describe, it, expect } from 'vitest';
import { formatValue } from '@/lib/formatters';

describe('formatValue', () => {
  it('formats currency with $ prefix and locale separators', () => {
    expect(formatValue(1234567, 'currency')).toBe('$1,234,567');
  });

  it('formats percent with % suffix and no separators', () => {
    expect(formatValue(8.5, 'percent')).toBe('8.5%');
  });

  it('formats plain numbers with locale separators', () => {
    expect(formatValue(1000, 'number')).toBe('1,000');
  });

  it('handles zero', () => {
    expect(formatValue(0, 'currency')).toBe('$0');
    expect(formatValue(0, 'percent')).toBe('0%');
    expect(formatValue(0, 'number')).toBe('0');
  });
});
