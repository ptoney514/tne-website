import { describe, it, expect } from 'vitest';
import {
  GRADE_ORDER,
  expandGradeRange,
  parseSessionGrades,
  getGradeColor,
  GRADE_COLORS,
  groupSessionsByGender,
} from '@/lib/tryout-utils';

describe('expandGradeRange', () => {
  it('expands "3rd-8th" to all 6 grades', () => {
    expect(expandGradeRange('3rd-8th')).toEqual(['3rd', '4th', '5th', '6th', '7th', '8th']);
  });

  it('expands "3rd-4th" to 2 grades', () => {
    expect(expandGradeRange('3rd-4th')).toEqual(['3rd', '4th']);
  });

  it('expands "5th-6th" to 2 grades', () => {
    expect(expandGradeRange('5th-6th')).toEqual(['5th', '6th']);
  });

  it('expands "7th-8th" to 2 grades', () => {
    expect(expandGradeRange('7th-8th')).toEqual(['7th', '8th']);
  });

  it('falls back to raw endpoints for unknown grades', () => {
    expect(expandGradeRange('K-2nd')).toEqual(['K', '2nd']);
  });

  it('returns single-element array for non-range string', () => {
    expect(expandGradeRange('5th')).toEqual(['5th']);
  });

  it('handles null/undefined gracefully', () => {
    expect(expandGradeRange(null)).toEqual([null]);
    expect(expandGradeRange(undefined)).toEqual([undefined]);
  });
});

describe('parseSessionGrades', () => {
  it('expands range in array entry "3rd-8th"', () => {
    const { grades } = parseSessionGrades(['3rd-8th'], 'male');
    expect(grades).toEqual(['3rd', '4th', '5th', '6th', '7th', '8th']);
  });

  it('expands range in array entry "3rd-4th"', () => {
    const { grades } = parseSessionGrades(['3rd-4th'], 'male');
    expect(grades).toEqual(['3rd', '4th']);
  });

  it('handles individual grades in array', () => {
    const { grades } = parseSessionGrades(['5th', '6th'], 'female');
    expect(grades).toEqual(['5th', '6th']);
  });

  it('handles string input with range', () => {
    const { grades } = parseSessionGrades('3rd-8th', 'male');
    expect(grades).toEqual(['3rd', '4th', '5th', '6th', '7th', '8th']);
  });

  it('handles string input with commas', () => {
    const { grades } = parseSessionGrades('3rd,4th,5th', 'male');
    expect(grades).toEqual(['3rd', '4th', '5th']);
  });

  it('returns empty array for null/undefined/empty', () => {
    expect(parseSessionGrades(null, 'male').grades).toEqual([]);
    expect(parseSessionGrades(undefined, 'male').grades).toEqual([]);
    expect(parseSessionGrades('', 'male').grades).toEqual([]);
    expect(parseSessionGrades([], 'male').grades).toEqual([]);
  });

  it('maps "male" gender to "Boys"', () => {
    const { genderLabel } = parseSessionGrades(['3rd'], 'male');
    expect(genderLabel).toBe('Boys');
  });

  it('maps "female" gender to "Girls"', () => {
    const { genderLabel } = parseSessionGrades(['3rd'], 'female');
    expect(genderLabel).toBe('Girls');
  });

  it('maps unknown gender to null', () => {
    const { genderLabel } = parseSessionGrades(['3rd'], 'other');
    expect(genderLabel).toBeNull();
  });

  it('maps undefined gender to null', () => {
    const { genderLabel } = parseSessionGrades(['3rd'], undefined);
    expect(genderLabel).toBeNull();
  });
});

describe('getGradeColor', () => {
  it('returns correct color for known grades', () => {
    expect(getGradeColor('3rd')).toEqual(GRADE_COLORS['3rd']);
    expect(getGradeColor('7th')).toEqual(GRADE_COLORS['7th']);
  });

  it('returns fallback color for unknown grades', () => {
    const fallback = getGradeColor('K');
    expect(fallback.bg).toBe('bg-green-100');
    expect(fallback.text).toBe('text-green-800');
  });
});

describe('groupSessionsByGender', () => {
  it('groups sessions into boys/girls/other', () => {
    const sessions = [
      { id: 1, gender: 'male' },
      { id: 2, gender: 'female' },
      { id: 3, gender: 'male' },
      { id: 4, gender: null },
    ];
    const { boys, girls, other } = groupSessionsByGender(sessions);
    expect(boys).toHaveLength(2);
    expect(girls).toHaveLength(1);
    expect(other).toHaveLength(1);
  });

  it('returns empty arrays when no sessions', () => {
    const { boys, girls, other } = groupSessionsByGender([]);
    expect(boys).toEqual([]);
    expect(girls).toEqual([]);
    expect(other).toEqual([]);
  });
});
