export const DAY_WIDTH = 30; // Default width of a day in pixels

export const ITEM_HEIGHT = 60; // Default height of a row/item in pixels
export const FLOATBOX_HEIGHT = 20; // Default height of a floatbox in pixels

// Configuración optimizada por defecto
export const DEFAULT_OPTIMIZATION_CONFIG = {
  itemHeight: ITEM_HEIGHT,
  floatboxHeight: FLOATBOX_HEIGHT,
  minHeight: 8,
  maxHeight: 20,
  rowSpacing: ITEM_HEIGHT,
  overlapOffset: 10,
  padding: 2,
  maxOverlapLevels: 5,
  overlapStrategy: 'smart' as const,
  enableVirtualization: false,
  cacheSize: 1000
};