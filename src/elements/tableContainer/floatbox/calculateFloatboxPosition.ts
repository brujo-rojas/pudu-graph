import type { PGConfig, PGItemData } from "@/types";
import { DAY_SECONDS } from "@/utils/CONSTANTS";
import { DAY_WIDTH } from "@/utils/DEFAULTS";
import { getFloatboxHeight, getItemHeight } from "@/utils/floatboxHeight";

// TODO: Performance Optimization - Cache para cálculos frecuentes
// const calculationCache = new Map<string, { left: number; top: number; width: number; height: number }>();

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
 * Calcula la posición y tamaño del floatbox
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

  const result = {
    left: calcLeft({ startUnix, itemStart, dayWidth, zoom: zoomValue }),
    width: calcWidth({ itemStart, itemEnd, dayWidth, zoom: zoomValue }),
    height: floatboxHeight, // Altura calculada basada en configuración
    top: calcTop({ rowIndex, overlapLevel, itemHeight, floatboxHeight }),
  };
  
  return result;
}

/**
 * Calcula la posición y tamaño del float icon (evento puntual)
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

  // Para iconos, centrar verticalmente en la fila, ignorando overlapLevel
  const rowTop = rowIndex * itemHeight;
  const iconTop = rowTop + (itemHeight - floatboxHeight) / 2; // Centrar verticalmente

  const result = {
    left: calcLeft({ startUnix, itemStart, dayWidth, zoom: zoomValue }),
    width: floatboxHeight, // Para iconos, width = height (círculo)
    height: floatboxHeight,
    top: iconTop,
  };
  
  return result;
}

// TODO: Performance Optimization - Implementar cache para cálculos frecuentes
// function generateCacheKey(
//   startUnix: number,
//   itemStart: number,
//   itemEnd: number,
//   dayWidth: number,
//   zoomValue: number,
//   rowIndex: number,
//   overlapLevel: number,
//   flexBoxHeight: number
// ): string {
//   return `${startUnix}-${itemStart}-${itemEnd}-${dayWidth}-${zoomValue}-${rowIndex}-${overlapLevel}-${flexBoxHeight}`;
// }
//
// export function clearCalculationCache(): void {
//   calculationCache.clear();
// }
//
// // Versión con cache:
// export function calculateFloatboxPositionWithCache({
//   config,
//   itemData,
//   rowIndex = 0,
//   zoomValue,
// }: {
//   config: PGConfig;
//   itemData: PGItemData;
//   rowIndex?: number;
//   zoomValue: number;
// }): { left: number; top: number; width: number; height: number } {
//   if (!isValidFloatbox({ config, itemData, zoomValue }))
//     return { left: 0, top: 0, width: 0, height: 0 };
//
//   const {
//     startUnix = 0,
//     dayWidth = DAY_WIDTH,
//     flexBoxHeight = FLOATBOX_HEIGHT,
//   } = config.options;
//   const {
//     startUnix: itemStart = 0,
//     endUnix: itemEnd = 0,
//     overlapLevel = 0,
//   } = itemData;
//
//   // Generar clave de cache
//   const cacheKey = generateCacheKey(
//     startUnix,
//     itemStart,
//     itemEnd,
//     dayWidth,
//     zoomValue,
//     rowIndex,
//     overlapLevel,
//     flexBoxHeight
//   );
//
//   // Verificar cache
//   if (calculationCache.has(cacheKey)) {
//     return calculationCache.get(cacheKey)!;
//   }
//
//   // Calcular y cachear resultado
//   const result = {
//     left: calcLeft({ startUnix, itemStart, dayWidth, zoom: zoomValue }),
//     width: calcWidth({ itemStart, itemEnd, dayWidth, zoom: zoomValue }),
//     height: flexBoxHeight,
//     top: calcTop({ rowIndex, overlapLevel, flexBoxHeight }),
//   };
//
//   // Limitar el tamaño del cache para evitar memory leaks
//   if (calculationCache.size > 1000) {
//     const firstKey = calculationCache.keys().next().value;
//     calculationCache.delete(firstKey);
//   }
//
//   calculationCache.set(cacheKey, result);
//   return result;
// }
