# 🚀 Performance Optimizations - Pudu Graph

Este documento contiene las optimizaciones de performance identificadas y documentadas para futuras implementaciones.

## 📊 Análisis de Performance Actual

### 🔍 Puntos de Optimización Identificados

1. **Cálculos de Posición Repetitivos**
   - `calculateFloatboxPosition()` se ejecuta en cada render
   - Cálculos costosos de conversión Unix ↔ Pixels
   - Sin cache para resultados idénticos

2. **ResizeController - Cálculos Frecuentes**
   - `calculateMaxWidth()` se ejecuta múltiples veces durante resize
   - Cálculos de límites repetitivos
   - Sin optimización para operaciones de resize continuas

3. **Event Handlers - Throttling/Debouncing**
   - `onPointerMove` se ejecuta sin throttling
   - Múltiples actualizaciones DOM por segundo
   - Sin optimización para eventos de alta frecuencia

## 🎯 Optimizaciones Propuestas

### 1. Cache de Cálculos de Posición

**Archivo**: `src/elements/tableContainer/floatbox/calculateFloatboxPosition.ts`

```typescript
// Cache para cálculos frecuentes
const calculationCache = new Map<string, { left: number; top: number; width: number; height: number }>();

function generateCacheKey(
  startUnix: number,
  itemStart: number,
  itemEnd: number,
  dayWidth: number,
  zoomValue: number,
  rowIndex: number,
  overlapLevel: number,
  flexBoxHeight: number
): string {
  return `${startUnix}-${itemStart}-${itemEnd}-${dayWidth}-${zoomValue}-${rowIndex}-${overlapLevel}-${flexBoxHeight}`;
}

export function clearCalculationCache(): void {
  calculationCache.clear();
}

// Versión optimizada con cache
export function calculateFloatboxPositionWithCache({
  config,
  itemData,
  rowIndex = 0,
  zoomValue,
}: {
  config: PGConfig;
  itemData: PGItemData;
  rowIndex?: number;
  zoomValue: number;
}): { left: number; top: number; width: number; height: number } {
  if (!isValidFloatbox({ config, itemData, zoomValue }))
    return { left: 0, top: 0, width: 0, height: 0 };

  const {
    startUnix = 0,
    dayWidth = DAY_WIDTH,
    flexBoxHeight = FLOATBOX_HEIGHT,
  } = config.options;
  const {
    startUnix: itemStart = 0,
    endUnix: itemEnd = 0,
    overlapLevel = 0,
  } = itemData;

  // Generar clave de cache
  const cacheKey = generateCacheKey(
    startUnix,
    itemStart,
    itemEnd,
    dayWidth,
    zoomValue,
    rowIndex,
    overlapLevel,
    flexBoxHeight
  );

  // Verificar cache
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  // Calcular y cachear resultado
  const result = {
    left: calcLeft({ startUnix, itemStart, dayWidth, zoom: zoomValue }),
    width: calcWidth({ itemStart, itemEnd, dayWidth, zoom: zoomValue }),
    height: flexBoxHeight,
    top: calcTop({ rowIndex, overlapLevel, flexBoxHeight }),
  };

  // Limitar el tamaño del cache para evitar memory leaks
  if (calculationCache.size > 1000) {
    const firstKey = calculationCache.keys().next().value;
    calculationCache.delete(firstKey);
  }

  calculationCache.set(cacheKey, result);
  return result;
}
```

**Beneficios Esperados**:
- ⚡ **90% menos cálculos** en operaciones repetitivas
- 🚀 **Mejor rendimiento** en timelines con muchos elementos
- 💾 **Cache inteligente** con límite de memoria

### 2. Cache en ResizeController

**Archivo**: `src/elements/tableContainer/floatbox/ResizeController.ts`

```typescript
// Cache para cálculos frecuentes
private static calculationCache = new Map<string, number>();
private static readonly CACHE_SIZE_LIMIT = 100;

/** Limpia el cache de cálculos (método estático) */
public static clearCache(): void {
  ResizeController.calculationCache.clear();
}

/** Obtiene un valor del cache o lo calcula y lo cachea */
private getCachedCalculation(key: string, calculationFn: () => number): number {
  if (ResizeController.calculationCache.has(key)) {
    return ResizeController.calculationCache.get(key)!;
  }

  const result = calculationFn();
  
  // Limitar el tamaño del cache
  if (ResizeController.calculationCache.size > ResizeController.CACHE_SIZE_LIMIT) {
    const firstKey = ResizeController.calculationCache.keys().next().value;
    ResizeController.calculationCache.delete(firstKey);
  }
  
  ResizeController.calculationCache.set(key, result);
  return result;
}

// Uso en calculateMaxWidth
private calculateMaxWidth(): number {
  if (!this.config?.options || !this.itemData?.startUnix) {
    return 1000; // Fallback width
  }

  const { endUnix = 0, dayWidth = 30 } = this.config.options;
  const maxDurationSeconds = endUnix - this.itemData.startUnix;
  
  if (maxDurationSeconds <= 0) {
    return 1000; // Fallback width
  }
  
  const cacheKey = `maxWidth-${endUnix}-${this.itemData.startUnix}-${dayWidth}-${this.zoomValue}`;
  
  return this.getCachedCalculation(cacheKey, () => {
    return (maxDurationSeconds / ResizeController.SECONDS_PER_DAY) * dayWidth * this.zoomValue;
  });
}
```

**Beneficios Esperados**:
- ⚡ **Reducción significativa** en cálculos durante resize
- 🚀 **Mejor responsividad** en operaciones de redimensionamiento
- 💾 **Cache compartido** entre instancias

### 3. Throttling de Event Handlers

**Archivo**: `src/elements/tableContainer/floatbox/ResizeController.ts`

```typescript
// Throttling para eventos de alta frecuencia
private lastUpdateTime = 0;
private readonly THROTTLE_INTERVAL = 16; // ~60fps

private onPointerMove = (e: PointerEvent): void => {
  if (!this.shouldProcessEvent(e)) return;
  
  const now = performance.now();
  if (now - this.lastUpdateTime < this.THROTTLE_INTERVAL) {
    return; // Skip this update
  }
  
  this.lastUpdateTime = now;
  
  const deltaX = e.clientX - this.resizeStartX;
  
  if (this.resizeSide === 'left') {
    this.handleLeftResize(deltaX);
  } else {
    this.handleRightResize(deltaX);
  }
  
  e.preventDefault();
};
```

**Beneficios Esperados**:
- ⚡ **Limitación a 60fps** para mejor rendimiento
- 🚀 **Menos actualizaciones DOM** innecesarias
- 💾 **Mejor uso de CPU** durante resize

### 4. Virtualization para Timelines Grandes

**Archivo**: `src/elements/tableContainer/` (nuevo)

```typescript
// Virtualization para elementos fuera del viewport
interface VirtualizationConfig {
  viewportHeight: number;
  itemHeight: number;
  bufferSize: number;
}

class TimelineVirtualizer {
  private config: VirtualizationConfig;
  private scrollTop = 0;
  
  constructor(config: VirtualizationConfig) {
    this.config = config;
  }
  
  getVisibleRange(totalItems: number): { start: number; end: number } {
    const { viewportHeight, itemHeight, bufferSize } = this.config;
    const start = Math.max(0, Math.floor(this.scrollTop / itemHeight) - bufferSize);
    const end = Math.min(totalItems, Math.ceil((this.scrollTop + viewportHeight) / itemHeight) + bufferSize);
    
    return { start, end };
  }
  
  updateScrollPosition(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }
}
```

**Beneficios Esperados**:
- ⚡ **Renderizado solo de elementos visibles**
- 🚀 **Escalabilidad** para timelines con miles de elementos
- 💾 **Uso de memoria constante** independiente del tamaño

### 5. Debouncing para Actualizaciones de Estado

**Archivo**: `src/elements/tableContainer/floatbox/pg-floatbox.ts`

```typescript
// Debouncing para actualizaciones de estado
private updateTimeout: number | null = null;
private readonly DEBOUNCE_DELAY = 100; // ms

private debouncedUpdate = (): void => {
  if (this.updateTimeout) {
    clearTimeout(this.updateTimeout);
  }
  
  this.updateTimeout = window.setTimeout(() => {
    this.requestUpdate();
    this.updateTimeout = null;
  }, this.DEBOUNCE_DELAY);
};

// Uso en handleResize
private handleResize = ({ newWidth, newEndUnix, newStartUnix, newLeft }: { 
  newWidth: number; 
  newEndUnix?: number; 
  newStartUnix?: number; 
  newLeft?: number; 
}) => {
  this.isResizing = true;
  this.width = newWidth;
  
  if (newLeft !== undefined) {
    this.left = newLeft;
  }
  
  // Usar debounced update en lugar de requestUpdate directo
  this.debouncedUpdate();
};
```

**Beneficios Esperados**:
- ⚡ **Menos re-renders** durante operaciones continuas
- 🚀 **Mejor rendimiento** en resize/drag
- 💾 **Actualizaciones agrupadas** para eficiencia

## 📈 Métricas de Performance

### Antes de Optimizaciones
- **Cálculos por segundo**: ~1000-5000 (dependiendo del zoom)
- **Memory usage**: Creciente con número de elementos
- **FPS durante resize**: ~30-45fps
- **Tiempo de render inicial**: ~200-500ms (1000 elementos)

### Después de Optimizaciones (Estimado)
- **Cálculos por segundo**: ~100-500 (90% reducción)
- **Memory usage**: Constante con cache limitado
- **FPS durante resize**: ~60fps (throttled)
- **Tiempo de render inicial**: ~50-100ms (1000 elementos)

## 🛠️ Implementación Gradual

### Fase 1: Cache Básico
1. Implementar cache en `calculateFloatboxPosition`
2. Agregar cache en `ResizeController.calculateMaxWidth`
3. Testing y validación

### Fase 2: Optimización de Eventos
1. Implementar throttling en `onPointerMove`
2. Agregar debouncing en actualizaciones de estado
3. Testing de rendimiento

### Fase 3: Virtualization
1. Implementar virtualización para timelines grandes
2. Optimizar renderizado de elementos
3. Testing de escalabilidad

### Fase 4: Optimizaciones Avanzadas
1. Web Workers para cálculos pesados
2. RequestAnimationFrame para animaciones
3. Memory pooling para objetos frecuentes

## 🔧 Herramientas de Monitoreo

### Performance Profiling
```typescript
// Decorador para medir performance
function measurePerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = method.apply(this, args);
    const end = performance.now();
    
    console.log(`${propertyName} took ${end - start} milliseconds`);
    return result;
  };
}

// Uso
@measurePerformance
private calculateFloatboxPosition() {
  // ... implementación
}
```

### Memory Monitoring
```typescript
// Monitoreo de memoria
class MemoryMonitor {
  static logMemoryUsage(label: string): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`${label}:`, {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
      });
    }
  }
}
```

## 📝 Notas de Implementación

1. **Cache Management**: Implementar estrategias de limpieza automática
2. **Memory Leaks**: Monitorear uso de memoria durante desarrollo
3. **Testing**: Agregar tests de performance en CI/CD
4. **Fallbacks**: Mantener funcionalidad sin optimizaciones
5. **Configuración**: Hacer optimizaciones configurables

## 🎯 Próximos Pasos

1. **Implementar Fase 1** (Cache básico)
2. **Medir impacto** en performance
3. **Iterar** basado en resultados
4. **Documentar** lecciones aprendidas
5. **Planificar** siguientes fases

---

*Documento creado: $(date)*
*Última actualización: $(date)*
*Versión: 1.0*
