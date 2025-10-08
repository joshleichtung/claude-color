/**
 * Tests for favorites storage system
 */

import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { FavoritesManager } from '../../src/storage/favorites';
import { Palette } from '../../src/types';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('FavoritesManager', () => {
  let favManager: FavoritesManager;
  let testDir: string;

  // Create a test palette helper
  const createTestPalette = (id: string = 'test-1'): Palette => ({
    id,
    colors: [
      { hex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, hsl: { h: 0, s: 100, l: 50 } },
      { hex: '#00FF00', rgb: { r: 0, g: 255, b: 0 }, hsl: { h: 120, s: 100, l: 50 } },
      { hex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, hsl: { h: 240, s: 100, l: 50 } },
    ],
    scheme: 'triadic',
    metadata: {
      created: new Date(),
      generationMethod: 'random',
    },
  });

  beforeEach(() => {
    // Create a temporary test directory
    testDir = join(tmpdir(), `claude-color-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    // Mock the favorites directory to use our test directory
    jest.spyOn(require('os'), 'homedir').mockReturnValue(testDir);

    favManager = new FavoritesManager();
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }

    // Clear mock database to ensure test isolation
    const mockDatabases = (global as any).mockDatabases;
    if (mockDatabases) {
      mockDatabases.clear();
    }
  });

  describe('initialization', () => {
    it('should save and retrieve favorites', async () => {
      const palette = createTestPalette();
      const saved = await favManager.saveFavorite(palette, 'Test Palette');

      expect(saved.name).toBe('Test Palette');

      const count = await favManager.count();
      expect(count).toBe(1);
    });

    it('should initialize with empty favorites array', async () => {
      const count = await favManager.count();
      expect(count).toBe(0);
    });

    it('should not re-initialize if already initialized', async () => {
      await favManager.saveFavorite(createTestPalette('1'), 'First');
      await favManager.saveFavorite(createTestPalette('2'), 'Second');

      const count = await favManager.count();
      expect(count).toBe(2);
    });
  });

  describe('saveFavorite', () => {
    it('should save a palette as favorite', async () => {
      const palette = createTestPalette();
      const favorite = await favManager.saveFavorite(palette, 'Sunset Colors');

      expect(favorite.name).toBe('Sunset Colors');
      expect(favorite.id).toBe(palette.id);
      expect(favorite.colors).toEqual(palette.colors);
      expect(favorite.usageCount).toBe(1);
      expect(favorite.tags).toEqual([]);
      expect(favorite.savedAt).toBeInstanceOf(Date);
    });

    it('should save a palette with tags', async () => {
      const palette = createTestPalette();
      const tags = ['warm', 'sunset', 'vibrant'];
      const favorite = await favManager.saveFavorite(palette, 'Tagged Palette', tags);

      expect(favorite.tags).toEqual(tags);
    });

    it('should initialize usageCount to 1', async () => {
      const palette = createTestPalette();
      const favorite = await favManager.saveFavorite(palette, 'Test');

      expect(favorite.usageCount).toBe(1);
    });

    it('should set savedAt timestamp', async () => {
      const beforeSave = new Date();
      const palette = createTestPalette();
      const favorite = await favManager.saveFavorite(palette, 'Test');
      const afterSave = new Date();

      expect(favorite.savedAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(favorite.savedAt.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });

    it('should persist multiple saves', async () => {
      const palette1 = createTestPalette('1');
      await favManager.saveFavorite(palette1, 'First');

      const palette2 = createTestPalette('2');
      await favManager.saveFavorite(palette2, 'Second');

      const count = await favManager.count();
      expect(count).toBe(2);
    });
  });

  describe('listFavorites', () => {
    beforeEach(async () => {
      // Add some test favorites with small delays to ensure different timestamps
      await favManager.saveFavorite(createTestPalette('1'), 'First', ['tag1']);
      await new Promise(resolve => setTimeout(resolve, 10));
      await favManager.saveFavorite(createTestPalette('2'), 'Second', ['tag2']);
      await new Promise(resolve => setTimeout(resolve, 10));
      await favManager.saveFavorite(createTestPalette('3'), 'Third', ['tag3']);
    });

    it('should list all favorites', async () => {
      const favorites = await favManager.listFavorites();
      expect(favorites).toHaveLength(3);
    });

    it('should respect limit parameter', async () => {
      const favorites = await favManager.listFavorites(2);
      expect(favorites).toHaveLength(2);
    });

    it('should respect offset parameter', async () => {
      const favorites = await favManager.listFavorites(undefined, 1);
      expect(favorites).toHaveLength(2);
    });

    it('should sort by most recent first', async () => {
      const favorites = await favManager.listFavorites();

      // Most recently saved should be first
      expect(favorites.length).toBe(3);
      expect(favorites[0]!.name).toBe('Third');
      expect(favorites[1]!.name).toBe('Second');
      expect(favorites[2]!.name).toBe('First');
    });

    it('should sort by lastUsed if available', async () => {
      // Use one of the favorites
      const all = await favManager.listFavorites();
      expect(all.length).toBeGreaterThan(2);

      // Add delay to ensure lastUsed timestamp is significantly later
      await new Promise(resolve => setTimeout(resolve, 10));
      await favManager.incrementUsage(all[2]!.id); // Use "First"

      const favorites = await favManager.listFavorites();

      // Recently used should be first
      expect(favorites[0]!.name).toBe('First');
    });

    it('should handle pagination with limit and offset', async () => {
      const page1 = await favManager.listFavorites(1, 0);
      const page2 = await favManager.listFavorites(1, 1);
      const page3 = await favManager.listFavorites(1, 2);

      expect(page1).toHaveLength(1);
      expect(page2).toHaveLength(1);
      expect(page3).toHaveLength(1);
      expect(page1[0]!.id).not.toBe(page2[0]!.id);
      expect(page2[0]!.id).not.toBe(page3[0]!.id);
    });
  });

  describe('searchFavorites', () => {
    beforeEach(async () => {
      const palette1 = createTestPalette('1');
      palette1.metadata.originalPrompt = 'warm sunset vibes';
      await favManager.saveFavorite(palette1, 'Sunset Colors', ['warm', 'orange']);

      const palette2 = createTestPalette('2');
      await favManager.saveFavorite(palette2, 'Ocean Theme', ['cool', 'blue']);

      const palette3 = createTestPalette('3');
      await favManager.saveFavorite(palette3, 'Forest Greens', ['nature', 'green']);
    });

    it('should search by name', async () => {
      const results = await favManager.searchFavorites('sunset');
      expect(results).toHaveLength(1);
      expect(results[0]!.name).toBe('Sunset Colors');
    });

    it('should search by tag', async () => {
      const results = await favManager.searchFavorites('cool');
      expect(results).toHaveLength(1);
      expect(results[0]!.name).toBe('Ocean Theme');
    });

    it('should search by color hex', async () => {
      const results = await favManager.searchFavorites('#FF0000');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search by original prompt', async () => {
      const results = await favManager.searchFavorites('vibes');
      expect(results).toHaveLength(1);
      expect(results[0]!.name).toBe('Sunset Colors');
    });

    it('should be case insensitive', async () => {
      const results1 = await favManager.searchFavorites('SUNSET');
      const results2 = await favManager.searchFavorites('sunset');
      const results3 = await favManager.searchFavorites('SuNsEt');

      expect(results1).toHaveLength(1);
      expect(results2).toHaveLength(1);
      expect(results3).toHaveLength(1);
    });

    it('should return empty array for no matches', async () => {
      const results = await favManager.searchFavorites('nonexistent');
      expect(results).toEqual([]);
    });

    it('should find partial matches', async () => {
      const results = await favManager.searchFavorites('ocean');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('getFavorite', () => {
    it('should get favorite by ID', async () => {
      const palette = createTestPalette('unique-id');
      await favManager.saveFavorite(palette, 'Test Palette');

      const favorite = await favManager.getFavorite('unique-id');
      expect(favorite).toBeDefined();
      expect(favorite?.name).toBe('Test Palette');
    });

    it('should return undefined for non-existent ID', async () => {
      const favorite = await favManager.getFavorite('nonexistent');
      expect(favorite).toBeUndefined();
    });
  });

  describe('getFavoriteByName', () => {
    it('should get favorite by name', async () => {
      const palette = createTestPalette();
      await favManager.saveFavorite(palette, 'Unique Name');

      const favorite = await favManager.getFavoriteByName('Unique Name');
      expect(favorite).toBeDefined();
      expect(favorite?.name).toBe('Unique Name');
    });

    it('should be case insensitive', async () => {
      const palette = createTestPalette();
      await favManager.saveFavorite(palette, 'Test Palette');

      const favorite = await favManager.getFavoriteByName('test palette');
      expect(favorite).toBeDefined();
      expect(favorite?.name).toBe('Test Palette');
    });

    it('should return undefined for non-existent name', async () => {
      const favorite = await favManager.getFavoriteByName('Nonexistent');
      expect(favorite).toBeUndefined();
    });
  });

  describe('deleteFavorite', () => {
    it('should delete a favorite by ID', async () => {
      const palette = createTestPalette('to-delete');
      await favManager.saveFavorite(palette, 'Delete Me');

      const deleted = await favManager.deleteFavorite('to-delete');
      expect(deleted).toBe(true);

      const favorite = await favManager.getFavorite('to-delete');
      expect(favorite).toBeUndefined();
    });

    it('should return false for non-existent ID', async () => {
      const deleted = await favManager.deleteFavorite('nonexistent');
      expect(deleted).toBe(false);
    });

    it('should reduce count after deletion', async () => {
      await favManager.saveFavorite(createTestPalette('1'), 'First');
      await favManager.saveFavorite(createTestPalette('2'), 'Second');

      const beforeCount = await favManager.count();
      await favManager.deleteFavorite('1');
      const afterCount = await favManager.count();

      expect(afterCount).toBe(beforeCount - 1);
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count', async () => {
      const palette = createTestPalette('usage-test');
      await favManager.saveFavorite(palette, 'Test');

      await favManager.incrementUsage('usage-test');

      const favorite = await favManager.getFavorite('usage-test');
      expect(favorite?.usageCount).toBe(2);
    });

    it('should set lastUsed timestamp', async () => {
      const palette = createTestPalette('usage-test');
      await favManager.saveFavorite(palette, 'Test');

      const beforeUse = new Date();
      await favManager.incrementUsage('usage-test');
      const afterUse = new Date();

      const favorite = await favManager.getFavorite('usage-test');
      expect(favorite?.lastUsed).toBeDefined();
      expect(favorite!.lastUsed!.getTime()).toBeGreaterThanOrEqual(beforeUse.getTime());
      expect(favorite!.lastUsed!.getTime()).toBeLessThanOrEqual(afterUse.getTime());
    });

    it('should handle multiple increments', async () => {
      const palette = createTestPalette('multi-use');
      await favManager.saveFavorite(palette, 'Test');

      await favManager.incrementUsage('multi-use');
      await favManager.incrementUsage('multi-use');
      await favManager.incrementUsage('multi-use');

      const favorite = await favManager.getFavorite('multi-use');
      expect(favorite?.usageCount).toBe(4); // Started at 1
    });

    it('should do nothing for non-existent ID', async () => {
      await favManager.incrementUsage('nonexistent');
      // Should not throw error
      const count = await favManager.count();
      expect(count).toBe(0);
    });
  });

  describe('getFavoritesByTag', () => {
    beforeEach(async () => {
      await favManager.saveFavorite(createTestPalette('1'), 'First', ['warm', 'vibrant']);
      await favManager.saveFavorite(createTestPalette('2'), 'Second', ['cool', 'calm']);
      await favManager.saveFavorite(createTestPalette('3'), 'Third', ['warm', 'sunset']);
    });

    it('should get favorites by tag', async () => {
      const warmFavorites = await favManager.getFavoritesByTag('warm');
      expect(warmFavorites).toHaveLength(2);
    });

    it('should be case insensitive', async () => {
      const favorites = await favManager.getFavoritesByTag('WARM');
      expect(favorites).toHaveLength(2);
    });

    it('should return empty array for non-existent tag', async () => {
      const favorites = await favManager.getFavoritesByTag('nonexistent');
      expect(favorites).toEqual([]);
    });
  });

  describe('count', () => {
    it('should return 0 for empty database', async () => {
      const count = await favManager.count();
      expect(count).toBe(0);
    });

    it('should return correct count', async () => {
      await favManager.saveFavorite(createTestPalette('1'), 'First');
      await favManager.saveFavorite(createTestPalette('2'), 'Second');
      await favManager.saveFavorite(createTestPalette('3'), 'Third');

      const count = await favManager.count();
      expect(count).toBe(3);
    });

    it('should update count after deletion', async () => {
      await favManager.saveFavorite(createTestPalette('1'), 'First');
      await favManager.saveFavorite(createTestPalette('2'), 'Second');
      await favManager.deleteFavorite('1');

      const count = await favManager.count();
      expect(count).toBe(1);
    });
  });

  describe('exportAll', () => {
    it('should export all favorites with metadata', async () => {
      await favManager.saveFavorite(createTestPalette('1'), 'First');
      await favManager.saveFavorite(createTestPalette('2'), 'Second');

      const exported = await favManager.exportAll();

      expect(exported.favorites).toHaveLength(2);
      expect(exported.metadata).toBeDefined();
      expect(exported.metadata.version).toBeDefined();
      expect(exported.metadata.lastModified).toBeInstanceOf(Date);
    });

    it('should export empty database', async () => {
      const exported = await favManager.exportAll();

      expect(exported.favorites).toEqual([]);
      expect(exported.metadata).toBeDefined();
    });
  });

  describe('importFavorites', () => {
    it('should import favorites', async () => {
      const importData = {
        favorites: [
          {
            ...createTestPalette('import-1'),
            name: 'Imported 1',
            tags: ['imported'],
            usageCount: 1,
            savedAt: new Date(),
          },
          {
            ...createTestPalette('import-2'),
            name: 'Imported 2',
            tags: ['imported'],
            usageCount: 1,
            savedAt: new Date(),
          },
        ],
        metadata: {
          version: '0.0.0',
          lastModified: new Date(),
        },
      };

      await favManager.importFavorites(importData);

      const count = await favManager.count();
      expect(count).toBe(2);
    });

    it('should skip duplicates by default', async () => {
      await favManager.saveFavorite(createTestPalette('duplicate'), 'Original');

      const importData = {
        favorites: [
          {
            ...createTestPalette('duplicate'),
            name: 'Duplicate Import',
            tags: [],
            usageCount: 1,
            savedAt: new Date(),
          },
        ],
        metadata: {
          version: '0.0.0',
          lastModified: new Date(),
        },
      };

      await favManager.importFavorites(importData);

      const count = await favManager.count();
      expect(count).toBe(1);

      const favorite = await favManager.getFavorite('duplicate');
      expect(favorite?.name).toBe('Original'); // Not overwritten
    });

    it('should overwrite duplicates when overwrite=true', async () => {
      await favManager.saveFavorite(createTestPalette('duplicate'), 'Original');

      const importData = {
        favorites: [
          {
            ...createTestPalette('duplicate'),
            name: 'Overwritten',
            tags: [],
            usageCount: 1,
            savedAt: new Date(),
          },
        ],
        metadata: {
          version: '0.0.0',
          lastModified: new Date(),
        },
      };

      await favManager.importFavorites(importData, true);

      const count = await favManager.count();
      expect(count).toBe(1);

      const favorite = await favManager.getFavorite('duplicate');
      expect(favorite?.name).toBe('Overwritten');
    });

    it('should merge with existing favorites', async () => {
      await favManager.saveFavorite(createTestPalette('existing'), 'Existing');

      const importData = {
        favorites: [
          {
            ...createTestPalette('new'),
            name: 'New Import',
            tags: [],
            usageCount: 1,
            savedAt: new Date(),
          },
        ],
        metadata: {
          version: '0.0.0',
          lastModified: new Date(),
        },
      };

      await favManager.importFavorites(importData);

      const count = await favManager.count();
      expect(count).toBe(2);
    });
  });

  describe('clearAll', () => {
    it('should clear all favorites', async () => {
      await favManager.saveFavorite(createTestPalette('1'), 'First');
      await favManager.saveFavorite(createTestPalette('2'), 'Second');
      await favManager.saveFavorite(createTestPalette('3'), 'Third');

      const deletedCount = await favManager.clearAll();
      expect(deletedCount).toBe(3);

      const count = await favManager.count();
      expect(count).toBe(0);
    });

    it('should return 0 for empty database', async () => {
      const deletedCount = await favManager.clearAll();
      expect(deletedCount).toBe(0);
    });

    it('should allow saving after clearing', async () => {
      await favManager.saveFavorite(createTestPalette('1'), 'First');
      await favManager.clearAll();

      await favManager.saveFavorite(createTestPalette('2'), 'After Clear');

      const count = await favManager.count();
      expect(count).toBe(1);
    });
  });

  describe('singleton instance', () => {
    it('should return same instance from getFavoritesManager', () => {
      const { getFavoritesManager } = require('../../src/storage/favorites');

      const instance1 = getFavoritesManager();
      const instance2 = getFavoritesManager();

      expect(instance1).toBe(instance2);
    });
  });
});
