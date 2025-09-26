export const DAY_WIDTH = 30; // Default width of a day in pixels

export const FLOATBOX_HEIGHT = 10; // Default height of a floatbox in pixels

// Configuración optimizada por defecto
export const DEFAULT_OPTIMIZATION_CONFIG = {
  floatboxHeight: 10,
  minHeight: 8,
  maxHeight: 20,
  rowSpacing: 60,
  overlapOffset: 10,
  padding: 2,
  maxOverlapLevels: 5,
  overlapStrategy: 'smart' as const,
  enableVirtualization: false,
  cacheSize: 1000
};