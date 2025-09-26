/**
 * Configuración unificada para el sistema de floatbox
 */

export interface FloatboxConfig {
  // Dimensiones
  height: number;                    // Altura del floatbox
  minHeight: number;                 // Altura mínima
  maxHeight: number;                 // Altura máxima
  
  // Espaciado
  rowSpacing: number;                // Espacio entre filas
  overlapOffset: number;             // Offset por nivel de solapamiento
  padding: number;                   // Padding interno
  
  // Solapamiento
  maxOverlapLevels: number;          // Máximo número de niveles
  overlapStrategy: 'compact' | 'spread' | 'smart'; // Estrategia de solapamiento
  
  // Rendimiento
  enableVirtualization: boolean;     // Habilitar virtualización
  cacheSize: number;                 // Tamaño del cache
}

export const DEFAULT_FLOATBOX_CONFIG: FloatboxConfig = {
  height: 10,
  minHeight: 8,
  maxHeight: 20,
  rowSpacing: 60,
  overlapOffset: 10,
  padding: 2,
  maxOverlapLevels: 5,
  overlapStrategy: 'smart',
  enableVirtualization: false,
  cacheSize: 1000
};

/**
 * Crea una configuración de floatbox basada en las opciones del config
 */
export function createFloatboxConfig(options: any): FloatboxConfig {
  return {
    ...DEFAULT_FLOATBOX_CONFIG,
    height: options.floatboxHeight || DEFAULT_FLOATBOX_CONFIG.height,
    rowSpacing: options.itemHeight || DEFAULT_FLOATBOX_CONFIG.rowSpacing,
    overlapOffset: options.flexBoxHeight || DEFAULT_FLOATBOX_CONFIG.overlapOffset,
    maxOverlapLevels: options.maxOverlapLevels || DEFAULT_FLOATBOX_CONFIG.maxOverlapLevels,
    enableVirtualization: options.enableVirtualization || DEFAULT_FLOATBOX_CONFIG.enableVirtualization,
    cacheSize: options.cacheSize || DEFAULT_FLOATBOX_CONFIG.cacheSize
  };
}

/**
 * Valida una configuración de floatbox
 */
export function validateFloatboxConfig(config: Partial<FloatboxConfig>): FloatboxConfig {
  const validated = { ...DEFAULT_FLOATBOX_CONFIG, ...config };
  
  // Validaciones
  if (validated.height < validated.minHeight) {
    console.warn('Floatbox height cannot be less than minHeight, using minHeight');
    validated.height = validated.minHeight;
  }
  
  if (validated.height > validated.maxHeight) {
    console.warn('Floatbox height cannot be greater than maxHeight, using maxHeight');
    validated.height = validated.maxHeight;
  }
  
  if (validated.maxOverlapLevels < 1) {
    console.warn('maxOverlapLevels must be at least 1, using 1');
    validated.maxOverlapLevels = 1;
  }
  
  if (validated.cacheSize < 10) {
    console.warn('cacheSize must be at least 10, using 10');
    validated.cacheSize = 10;
  }
  
  return validated;
}
