/**
 * Sistema de cache inteligente para posiciones de floatbox
 */

export interface PositionResult {
  left: number;
  top: number;
  width: number;
  height: number;
  level: number;
}

export class PositionCache {
  private cache = new Map<string, PositionResult>();
  private dependencies = new Map<string, Set<string>>();
  private accessOrder = new Map<string, number>();
  private accessCounter = 0;
  
  constructor(private maxSize: number = 1000) {}
  
  /**
   * Obtiene un valor del cache
   */
  get(key: string): PositionResult | undefined {
    const result = this.cache.get(key);
    if (result) {
      this.updateAccessOrder(key);
    }
    return result;
  }
  
  /**
   * Establece un valor en el cache con sus dependencias
   */
  set(key: string, value: PositionResult, dependencies: string[] = []): void {
    // Limitar tamaño del cache
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, value);
    this.dependencies.set(key, new Set(dependencies));
    this.updateAccessOrder(key);
  }
  
  /**
   * Invalida el cache basado en una dependencia
   */
  invalidate(dependency: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key, deps] of this.dependencies.entries()) {
      if (deps.has(dependency)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.cache.delete(key);
      this.dependencies.delete(key);
      this.accessOrder.delete(key);
    }
  }
  
  /**
   * Invalida múltiples dependencias
   */
  invalidateMultiple(dependencies: string[]): void {
    for (const dep of dependencies) {
      this.invalidate(dep);
    }
  }
  
  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear();
    this.dependencies.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
  }
  
  /**
   * Obtiene estadísticas del cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestKey: string | null;
    newestKey: string | null;
  } {
    let oldestKey: string | null = null;
    let newestKey: string | null = null;
    let oldestTime = Infinity;
    let newestTime = -Infinity;
    
    for (const [key, time] of this.accessOrder.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
      if (time > newestTime) {
        newestTime = time;
        newestKey = key;
      }
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      oldestKey,
      newestKey
    };
  }
  
  /**
   * Actualiza el orden de acceso de una clave
   */
  private updateAccessOrder(key: string): void {
    this.accessOrder.set(key, ++this.accessCounter);
  }
  
  /**
   * Elimina el elemento más antiguo del cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, time] of this.accessOrder.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.dependencies.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }
  
  /**
   * Calcula la tasa de aciertos del cache (simplificado)
   */
  private calculateHitRate(): number {
    // Esta es una implementación simplificada
    // En una implementación real, necesitarías trackear hits y misses
    return this.cache.size > 0 ? 0.8 : 0; // Placeholder
  }
  
  /**
   * Genera una clave de cache para un elemento
   */
  static generateKey(
    rowIndex: number,
    startUnix: number,
    endUnix: number,
    overlapLevel: number,
    zoomValue: number
  ): string {
    return `${rowIndex}-${startUnix}-${endUnix}-${overlapLevel}-${zoomValue}`;
  }
  
  /**
   * Genera una clave de dependencia para configuración
   */
  static generateConfigDependency(configHash: string): string {
    return `config-${configHash}`;
  }
  
  /**
   * Genera una clave de dependencia para una fila
   */
  static generateRowDependency(rowIndex: number): string {
    return `row-${rowIndex}`;
  }
  
  /**
   * Genera una clave de dependencia para un elemento
   */
  static generateItemDependency(startUnix: number, endUnix: number): string {
    return `item-${startUnix}-${endUnix}`;
  }
}
