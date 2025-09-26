import type { PGConfig, PGItemData } from "@/types";
import { DAY_SECONDS } from "@/utils/CONSTANTS";
import { DAY_WIDTH } from "@/utils/DEFAULTS";
import { getFloatboxHeight, getItemHeight } from "@/utils/floatboxHeight";

// Cache para cálculos frecuentes de posición
const calculationCache = new Map<string, { left: number; top: number; width: number; height: number }>();

interface FloatboxValidationParams {
  config: PGConfig;
  itemData: PGItemData;
  zoomValue: number;
}

interface LeftParams {
  startUnix: number;
  itemStart: number;
  dayWidth: number;
  zoom: number;
}

interface WidthParams {
  itemStart: number;
  itemEnd: number;
  dayWidth: number;
  zoom: number;
}

interface TopParams {
  rowIndex: number;
  overlapLevel: number;
  itemHeight: number;
  floatboxHeight: number;
}

function isValidFloatbox({
  config,
  itemData,
  zoomValue,
}: FloatboxValidationParams): boolean {
  return !!(
    config &&
    itemData &&
    zoomValue &&
    config.options &&
    itemData.startUnix &&
    itemData.endUnix
  );
}

function isValidFloatIcon({
  config,
  itemData,
  zoomValue,
}: FloatboxValidationParams): boolean {
  return !!(
    config &&
    itemData &&
    zoomValue &&
    config.options &&
    itemData.startUnix
    // No requiere endUnix para iconos
  );
}

function calcLeft({
  startUnix,
  itemStart,
  dayWidth,
  zoom,
}: LeftParams): number {
  const result = ((itemStart - startUnix) / DAY_SECONDS) * dayWidth * zoom;
  return result;
}

function calcWidth({
  itemStart,
  itemEnd,
  dayWidth,
  zoom,
}: WidthParams): number {
  const result = ((itemEnd - itemStart) / DAY_SECONDS) * dayWidth * zoom;
  return result;
}

function calcTop({ rowIndex, overlapLevel, itemHeight, floatboxHeight }: TopParams): number {
  // Posicionar en la fila correcta usando rowIndex * itemHeight
  // Luego distribuir desde arriba de esa fila usando overlapLevel
  const rowTop = rowIndex * itemHeight; // Posición de la fila
  
  // Calcular cuántos niveles caben en la fila completa
  const maxLevels = Math.floor(itemHeight / floatboxHeight); // 60 / 16 = 3.75 → 3 niveles
  
  // Asegurar que el overlapLevel no exceda el espacio disponible
  const clampedOverlapLevel = Math.min(overlapLevel, maxLevels - 1);
  
  // Calcular el espacio total ocupado por los floatboxes
  const totalFloatboxHeight = maxLevels * floatboxHeight; // 3 * 16 = 48px
  
  // Calcular el espacio sobrante
  const remainingSpace = itemHeight - totalFloatboxHeight; // 60 - 48 = 12px
  
  // Distribuir el espacio sobrante entre los niveles (incluyendo el espacio antes del primer nivel)
  const spacePerLevel = remainingSpace / (maxLevels + 1); // 12 / 4 = 3px por espacio
  
  // Calcular el offset: posición del nivel + espacios acumulados
  const levelPosition = clampedOverlapLevel * floatboxHeight; // Posición del floatbox
  const accumulatedSpaces = (clampedOverlapLevel + 1) * spacePerLevel; // Espacios acumulados
  
  const overlapOffset = levelPosition + accumulatedSpaces;
  
  const result = rowTop + overlapOffset;
  
  return result;
}

/**
 * Calcula la posición y tamaño del floatbox con cache
 */
export function calculateFloatboxPosition({
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
  
  if (!isValidFloatbox({ config, itemData, zoomValue })) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  const {
    startUnix = 0,
    dayWidth = DAY_WIDTH,
  } = config.options;
  const {
    startUnix: itemStart = 0,
    endUnix: itemEnd = 0,
    overlapLevel = 0,
  } = itemData;

  const itemHeight = getItemHeight(config);
  const floatboxHeight = getFloatboxHeight(config);

  // Generar clave de cache
  const cacheKey = generateCacheKey(
    startUnix,
    itemStart,
    itemEnd,
    dayWidth,
    zoomValue,
    rowIndex,
    overlapLevel,
    itemHeight,
    floatboxHeight,
    false // isIcon = false para floatbox
  );

  // Verificar cache
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  // Calcular resultado
  const result = {
    left: calcLeft({ startUnix, itemStart, dayWidth, zoom: zoomValue }),
    width: calcWidth({ itemStart, itemEnd, dayWidth, zoom: zoomValue }),
    height: floatboxHeight,
    top: calcTop({ rowIndex, overlapLevel, itemHeight, floatboxHeight }),
  };

  // Limitar el tamaño del cache para evitar memory leaks
  if (calculationCache.size > 1000) {
    const firstKey = calculationCache.keys().next().value;
    calculationCache.delete(firstKey);
  }

  // Cachear resultado
  calculationCache.set(cacheKey, result);
  return result;
}

/**
 * Calcula la posición y tamaño del float icon (evento puntual) con cache
 */
export function calculateFloatIconPosition({
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
  
  if (!isValidFloatIcon({ config, itemData, zoomValue })) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  const {
    startUnix = 0,
    dayWidth = DAY_WIDTH,
  } = config.options;
  const {
    startUnix: itemStart = 0,
    overlapLevel = 0,
  } = itemData;

  const itemHeight = getItemHeight(config);
  const floatboxHeight = getFloatboxHeight(config);

  // Generar clave de cache
  const cacheKey = generateCacheKey(
    startUnix,
    itemStart,
    undefined, // endUnix no existe para iconos
    dayWidth,
    zoomValue,
    rowIndex,
    overlapLevel,
    itemHeight,
    floatboxHeight,
    true // isIcon = true para iconos
  );

  // Verificar cache
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  // Para iconos, centrar verticalmente en la fila, ignorando overlapLevel
  const rowTop = rowIndex * itemHeight;
  const iconTop = rowTop + (itemHeight - floatboxHeight) / 2; // Centrar verticalmente

  const result = {
    left: calcLeft({ startUnix, itemStart, dayWidth, zoom: zoomValue }),
    width: floatboxHeight, // Para iconos, width = height (círculo)
    height: floatboxHeight,
    top: iconTop,
  };

  // Limitar el tamaño del cache para evitar memory leaks
  if (calculationCache.size > 1000) {
    const firstKey = calculationCache.keys().next().value;
    calculationCache.delete(firstKey);
  }

  // Cachear resultado
  calculationCache.set(cacheKey, result);
  return result;
}

/**
 * Genera una clave única para el cache basada en los parámetros de cálculo
 */
function generateCacheKey(
  startUnix: number,
  itemStart: number,
  itemEnd: number | undefined,
  dayWidth: number,
  zoomValue: number,
  rowIndex: number,
  overlapLevel: number,
  itemHeight: number,
  floatboxHeight: number,
  isIcon: boolean
): string {
  return `${startUnix}-${itemStart}-${itemEnd || 'icon'}-${dayWidth}-${zoomValue}-${rowIndex}-${overlapLevel}-${itemHeight}-${floatboxHeight}-${isIcon}`;
}

/**
 * Limpia el cache de cálculos
 */
export function clearCalculationCache(): void {
  calculationCache.clear();
}

/**
 * Obtiene el tamaño actual del cache
 */
export function getCacheSize(): number {
  return calculationCache.size;
}
