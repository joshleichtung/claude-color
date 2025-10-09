/**
 * Favorites storage system using lowdb
 *
 * Manages user's favorite color palettes with search, tagging, and export
 */

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, existsSync, copyFileSync } from 'fs';
import { FavoritePalette, FavoritesDatabase, Palette } from '../types';
import { VERSION } from '../index';

/**
 * Path to favorites database
 */
const FAVORITES_DIR = join(homedir(), '.claude-color');
const FAVORITES_FILE = join(FAVORITES_DIR, 'favorites.json');
const BACKUP_FILE = join(FAVORITES_DIR, 'favorites.backup.json');

/**
 * Ensure favorites directory exists
 */
function ensureDir(): void {
  if (!existsSync(FAVORITES_DIR)) {
    mkdirSync(FAVORITES_DIR, { recursive: true });
  }
}

/**
 * Create backup of favorites database
 */
function createBackup(): void {
  if (existsSync(FAVORITES_FILE)) {
    copyFileSync(FAVORITES_FILE, BACKUP_FILE);
  }
}

/**
 * Favorites manager class
 */
export class FavoritesManager {
  private db: Low<FavoritesDatabase>;
  private initialized: boolean = false;

  constructor() {
    ensureDir();
    const adapter = new JSONFile<FavoritesDatabase>(FAVORITES_FILE);
    this.db = new Low<FavoritesDatabase>(adapter, this.getDefaultData());
  }

  /**
   * Get default database structure
   */
  private getDefaultData(): FavoritesDatabase {
    return {
      favorites: [],
      interactions: [],
      metadata: {
        version: VERSION,
        lastModified: new Date(),
      },
    };
  }

  /**
   * Initialize database (read from disk)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    await this.db.read();
    this.initialized = true;

    // Initialize if first run
    if (!this.db.data) {
      this.db.data = this.getDefaultData();
      await this.save();
    }
  }

  /**
   * Get database data, ensuring it exists
   */
  private getData(): FavoritesDatabase {
    if (!this.db.data) {
      throw new Error('Database not initialized');
    }
    return this.db.data;
  }

  /**
   * Save database to disk with backup
   */
  private async save(): Promise<void> {
    createBackup();
    const data = this.getData();
    data.metadata.lastModified = new Date();
    await this.db.write();
  }

  /**
   * Save a palette as a favorite
   *
   * @param palette - Palette to save
   * @param name - User-friendly name
   * @param tags - Optional tags for categorization
   * @returns Saved favorite palette
   */
  async saveFavorite(
    palette: Palette,
    name: string,
    tags: string[] = []
  ): Promise<FavoritePalette> {
    await this.initialize();

    const favorite: FavoritePalette = {
      ...palette,
      name,
      tags,
      usageCount: 1,
      savedAt: new Date(),
    };

    this.getData().favorites.push(favorite);
    await this.save();

    return favorite;
  }

  /**
   * List all favorite palettes
   *
   * @param limit - Maximum number to return
   * @param offset - Number to skip
   * @returns Array of favorite palettes
   */
  async listFavorites(limit?: number, offset: number = 0): Promise<FavoritePalette[]> {
    await this.initialize();

    let favorites = [...this.getData().favorites];

    // Sort by last used (if available), then by saved date (newest first)
    favorites.sort((a, b) => {
      const aDate = a.lastUsed || a.savedAt;
      const bDate = b.lastUsed || b.savedAt;
      return bDate.getTime() - aDate.getTime();
    });

    if (offset > 0) {
      favorites = favorites.slice(offset);
    }

    if (limit !== undefined) {
      favorites = favorites.slice(0, limit);
    }

    return favorites;
  }

  /**
   * Search favorites by name, tag, or color
   *
   * @param query - Search query
   * @returns Matching favorite palettes
   */
  async searchFavorites(query: string): Promise<FavoritePalette[]> {
    await this.initialize();

    const lowerQuery = query.toLowerCase();

    return this.getData().favorites.filter(fav => {
      // Search in name
      if (fav.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in tags
      if (fav.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        return true;
      }

      // Search in colors (hex values)
      if (fav.colors.some(color => color.hex.toLowerCase().includes(lowerQuery))) {
        return true;
      }

      // Search in original prompt
      if (fav.metadata.originalPrompt?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Get a favorite by ID
   *
   * @param id - Palette ID
   * @returns Favorite palette or undefined
   */
  async getFavorite(id: string): Promise<FavoritePalette | undefined> {
    await this.initialize();
    return this.getData().favorites.find(fav => fav.id === id);
  }

  /**
   * Get a favorite by name
   *
   * @param name - Palette name
   * @returns Favorite palette or undefined
   */
  async getFavoriteByName(name: string): Promise<FavoritePalette | undefined> {
    await this.initialize();
    return this.getData().favorites.find(fav => fav.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Delete a favorite by ID
   *
   * @param id - Palette ID
   * @returns True if deleted, false if not found
   */
  async deleteFavorite(id: string): Promise<boolean> {
    await this.initialize();

    const index = this.getData().favorites.findIndex(fav => fav.id === id);
    if (index === -1) {
      return false;
    }

    this.getData().favorites.splice(index, 1);
    await this.save();

    return true;
  }

  /**
   * Update usage count and last used timestamp
   *
   * @param id - Palette ID
   */
  async incrementUsage(id: string): Promise<void> {
    await this.initialize();

    const favorite = this.getData().favorites.find(fav => fav.id === id);
    if (favorite) {
      favorite.usageCount++;
      favorite.lastUsed = new Date();
      await this.save();
    }
  }

  /**
   * Get favorites by tag
   *
   * @param tag - Tag to filter by
   * @returns Favorite palettes with the tag
   */
  async getFavoritesByTag(tag: string): Promise<FavoritePalette[]> {
    await this.initialize();

    return this.getData().favorites.filter(fav =>
      fav.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  /**
   * Get total number of favorites
   *
   * @returns Count of favorites
   */
  async count(): Promise<number> {
    await this.initialize();
    return this.getData().favorites.length;
  }

  /**
   * Export all favorites
   *
   * @returns Favorites database
   */
  async exportAll(): Promise<FavoritesDatabase> {
    await this.initialize();
    return { ...this.getData() };
  }

  /**
   * Import favorites (merge with existing)
   *
   * @param data - Favorites database to import
   * @param overwrite - Whether to overwrite duplicates (by ID)
   */
  async importFavorites(data: FavoritesDatabase, overwrite: boolean = false): Promise<void> {
    await this.initialize();

    const existing = new Set(this.getData().favorites.map(f => f.id));

    for (const favorite of data.favorites) {
      if (existing.has(favorite.id)) {
        if (overwrite) {
          // Remove existing and add new
          const index = this.getData().favorites.findIndex(f => f.id === favorite.id);
          this.getData().favorites[index] = favorite;
        }
        // Otherwise skip (don't import duplicates)
      } else {
        this.getData().favorites.push(favorite);
      }
    }

    await this.save();
  }

  /**
   * Clear all favorites (dangerous!)
   *
   * @returns Number of favorites deleted
   */
  async clearAll(): Promise<number> {
    await this.initialize();

    const count = this.getData().favorites.length;
    this.getData().favorites = [];
    await this.save();

    return count;
  }

  /**
   * Track a user interaction
   *
   * @param interaction - Interaction to record
   */
  async trackInteraction(
    interaction: Omit<import('../types').UserInteraction, 'id' | 'timestamp'>
  ): Promise<void> {
    await this.initialize();

    const { nanoid } = await import('nanoid');
    const fullInteraction: import('../types').UserInteraction = {
      ...interaction,
      id: nanoid(),
      timestamp: new Date(),
    };

    this.getData().interactions.push(fullInteraction);

    // Keep only last 500 interactions to prevent database bloat
    if (this.getData().interactions.length > 500) {
      this.getData().interactions = this.getData().interactions.slice(-500);
    }

    await this.save();
  }

  /**
   * Get all interactions
   *
   * @param limit - Maximum number to return (default: all)
   * @returns Array of user interactions
   */
  async getInteractions(limit?: number): Promise<import('../types').UserInteraction[]> {
    await this.initialize();

    const interactions = this.getData().interactions;
    if (limit && limit > 0) {
      return interactions.slice(-limit);
    }
    return interactions;
  }

  /**
   * Get interactions by type
   *
   * @param type - Interaction type to filter by
   * @param limit - Maximum number to return
   * @returns Filtered interactions
   */
  async getInteractionsByType(
    type: import('../types').InteractionType,
    limit?: number
  ): Promise<import('../types').UserInteraction[]> {
    await this.initialize();

    const filtered = this.getData().interactions.filter(i => i.type === type);
    if (limit && limit > 0) {
      return filtered.slice(-limit);
    }
    return filtered;
  }

  /**
   * Clear all interactions
   *
   * @returns Number of interactions deleted
   */
  async clearInteractions(): Promise<number> {
    await this.initialize();

    const count = this.getData().interactions.length;
    this.getData().interactions = [];
    await this.save();

    return count;
  }
}

/**
 * Singleton instance
 */
let instance: FavoritesManager | null = null;

/**
 * Get favorites manager instance
 */
export function getFavoritesManager(): FavoritesManager {
  if (!instance) {
    instance = new FavoritesManager();
  }
  return instance;
}
