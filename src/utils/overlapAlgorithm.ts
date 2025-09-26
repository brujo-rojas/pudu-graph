/**
 * Algoritmo inteligente de solapamiento para floatbox
 */

import type { FloatboxConfig } from './FLOATBOX_CONFIG';

export interface OverlapItem {
  id: string;
  startUnix: number;
  endUnix: number;
  priority?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface OverlapResult {
  level: number;
  height: number;
  top: number;
}

export class SmartOverlapAlgorithm {
  constructor(private config: FloatboxConfig) {}
  
  /**
   * Asigna niveles de solapamiento optimizando el uso del espacio
   */
  assignLevels(items: OverlapItem[]): Map<string, OverlapResult> {
    const results = new Map<string, OverlapResult>();
    
    if (items.length === 0) return results;
    
    const sortedItems = [...items].sort((a, b) => {
      // Ordenar por prioridad, luego por duración, luego por inicio
      if (a.priority !== b.priority) return (b.priority || 0) - (a.priority || 0);
      const aDuration = a.endUnix - a.startUnix;
      const bDuration = b.endUnix - b.startUnix;
      if (aDuration !== bDuration) return bDuration - aDuration;
      return a.startUnix - b.startUnix;
    });
    
    const levelTimelines: Array<{ end: number; height: number }> = [];
    
    for (const item of sortedItems) {
      const level = this.findBestLevel(item, levelTimelines);
      const height = this.calculateOptimalHeight(item, level);
      const top = this.calculateTop(level, height);
      
      results.set(item.id, { level, height, top });
      this.updateLevelTimeline(levelTimelines, level, item.endUnix, height);
    }
    
    return results;
  }
  
  /**
   * Encuentra el mejor nivel para un elemento
   */
  private findBestLevel(item: OverlapItem, timelines: Array<{ end: number; height: number }>): number {
    // Buscar el primer nivel disponible
    for (let level = 0; level < this.config.maxOverlapLevels; level++) {
      if (level >= timelines.length || item.startUnix >= timelines[level].end) {
        return level;
      }
    }
    
    // Si no hay nivel disponible, usar el que termine antes
    let bestLevel = 0;
    let earliestEnd = timelines[0]?.end || Infinity;
    
    for (let level = 1; level < timelines.length; level++) {
      if (timelines[level].end < earliestEnd) {
        earliestEnd = timelines[level].end;
        bestLevel = level;
      }
    }
    
    return bestLevel;
  }
  
  /**
   * Calcula la altura óptima para un elemento
   */
  private calculateOptimalHeight(item: OverlapItem, level: number): number {
    const baseHeight = this.config.height;
    const duration = item.endUnix - item.startUnix;
    
    // Ajustar altura basada en duración y nivel
    let height = baseHeight;
    
    if (duration > 86400) { // Más de un día
      height = Math.min(this.config.maxHeight, baseHeight * 1.5);
    } else if (duration < 3600) { // Menos de una hora
      height = Math.max(this.config.minHeight, baseHeight * 0.8);
    }
    
    // Reducir altura en niveles superiores para mejor visualización
    if (level > 0) {
      height *= (1 - level * 0.1);
    }
    
    return Math.max(this.config.minHeight, Math.min(this.config.maxHeight, height));
  }
  
  /**
   * Calcula la posición top para un nivel
   */
  private calculateTop(level: number, height: number): number {
    return level * (this.config.overlapOffset + height);
  }
  
  /**
   * Actualiza la línea de tiempo de un nivel
   */
  private updateLevelTimeline(
    timelines: Array<{ end: number; height: number }>,
    level: number,
    end: number,
    height: number
  ): void {
    if (level >= timelines.length) {
      timelines.length = level + 1;
    }
    timelines[level] = { end, height };
  }
  
  /**
   * Calcula el número máximo de niveles necesarios para un conjunto de elementos
   */
  calculateMaxLevels(items: OverlapItem[]): number {
    if (items.length === 0) return 0;
    
    const results = this.assignLevels(items);
    let maxLevel = 0;
    
    for (const result of results.values()) {
      maxLevel = Math.max(maxLevel, result.level);
    }
    
    return maxLevel + 1;
  }
  
  /**
   * Optimiza la configuración basada en los elementos
   */
  optimizeConfig(items: OverlapItem[]): Partial<FloatboxConfig> {
    const maxLevels = this.calculateMaxLevels(items);
    const avgDuration = items.reduce((sum, item) => sum + (item.endUnix - item.startUnix), 0) / items.length;
    
    const optimizations: Partial<FloatboxConfig> = {};
    
    // Ajustar maxOverlapLevels si es necesario
    if (maxLevels > this.config.maxOverlapLevels) {
      optimizations.maxOverlapLevels = Math.min(maxLevels + 1, 10); // Máximo 10 niveles
    }
    
    // Ajustar altura basada en duración promedio
    if (avgDuration > 86400) { // Más de un día en promedio
      optimizations.height = Math.min(this.config.maxHeight, this.config.height * 1.2);
    } else if (avgDuration < 3600) { // Menos de una hora en promedio
      optimizations.height = Math.max(this.config.minHeight, this.config.height * 0.9);
    }
    
    return optimizations;
  }
}
