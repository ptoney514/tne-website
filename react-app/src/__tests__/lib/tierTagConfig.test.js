import { describe, it, expect } from 'vitest';
import {
  TIER_CONFIG,
  TAG_CONFIG,
  DEFAULT_TIER,
  TIER_SLUGS,
  TAG_SLUGS,
  getTierConfig,
  getTagConfig,
  getTierOptions,
  getTagOptions,
} from '../../lib/tierTagConfig';

describe('tierTagConfig', () => {
  describe('TIER_CONFIG', () => {
    it('should have three tier configurations', () => {
      expect(Object.keys(TIER_CONFIG)).toHaveLength(3);
      expect(TIER_CONFIG).toHaveProperty('tne');
      expect(TIER_CONFIG).toHaveProperty('express');
      expect(TIER_CONFIG).toHaveProperty('dev');
    });

    it('should have required properties for each tier', () => {
      Object.values(TIER_CONFIG).forEach((tier) => {
        expect(tier).toHaveProperty('slug');
        expect(tier).toHaveProperty('name');
        expect(tier).toHaveProperty('description');
        expect(tier).toHaveProperty('color');
        expect(tier).toHaveProperty('textColor');
        expect(tier).toHaveProperty('bgLight');
        expect(tier).toHaveProperty('borderColor');
        expect(tier).toHaveProperty('dotColor');
      });
    });
  });

  describe('TAG_CONFIG', () => {
    it('should have default tag configurations', () => {
      expect(TAG_CONFIG).toHaveProperty('3ssb');
      expect(TAG_CONFIG).toHaveProperty('tournament');
      expect(TAG_CONFIG).toHaveProperty('recruiting');
    });

    it('should have required properties for each tag', () => {
      Object.values(TAG_CONFIG).forEach((tag) => {
        expect(tag).toHaveProperty('slug');
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('fullName');
        expect(tag).toHaveProperty('color');
        expect(tag).toHaveProperty('textColor');
        expect(tag).toHaveProperty('borderColor');
      });
    });
  });

  describe('DEFAULT_TIER', () => {
    it('should be express', () => {
      expect(DEFAULT_TIER).toBe('express');
    });
  });

  describe('TIER_SLUGS', () => {
    it('should contain all tier slugs', () => {
      expect(TIER_SLUGS).toEqual(['tne', 'express', 'dev']);
    });
  });

  describe('TAG_SLUGS', () => {
    it('should contain all tag slugs', () => {
      expect(TAG_SLUGS).toEqual(['3ssb', 'tournament', 'recruiting']);
    });
  });

  describe('getTierConfig', () => {
    it('should return correct config for valid tier', () => {
      const tne = getTierConfig('tne');
      expect(tne.name).toBe('TNE Elite');
      expect(tne.slug).toBe('tne');
    });

    it('should return default tier for invalid tier', () => {
      const unknown = getTierConfig('invalid');
      expect(unknown.slug).toBe('express');
    });

    it('should return default tier for undefined', () => {
      const unknown = getTierConfig(undefined);
      expect(unknown.slug).toBe('express');
    });
  });

  describe('getTagConfig', () => {
    it('should return correct config for valid tag', () => {
      const tag = getTagConfig('3ssb');
      expect(tag.name).toBe('3SSB');
      expect(tag.fullName).toBe('3SSB Circuit');
    });

    it('should return null for invalid tag', () => {
      const unknown = getTagConfig('invalid');
      expect(unknown).toBeNull();
    });

    it('should return null for undefined', () => {
      const unknown = getTagConfig(undefined);
      expect(unknown).toBeNull();
    });
  });

  describe('getTierOptions', () => {
    it('should return array of tier options', () => {
      const options = getTierOptions();
      expect(options).toHaveLength(3);
      options.forEach((option) => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('description');
      });
    });

    it('should have correct values', () => {
      const options = getTierOptions();
      const values = options.map((o) => o.value);
      expect(values).toContain('tne');
      expect(values).toContain('express');
      expect(values).toContain('dev');
    });
  });

  describe('getTagOptions', () => {
    it('should return array of tag options', () => {
      const options = getTagOptions();
      expect(options.length).toBeGreaterThan(0);
      options.forEach((option) => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('fullName');
      });
    });
  });
});
