import type { PGConfig, PGItemData } from "@/types";
import { DAY_SECONDS } from "@/utils/CONSTANTS";
import { DAY_WIDTH, FLOATBOX_HEIGHT } from "@/utils/DEFAULTS";

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

function calcLeft({
  startUnix,
  itemStart,
  dayWidth,
  zoom,
}: LeftParams): number {
  return ((itemStart - startUnix) / DAY_SECONDS) * dayWidth * zoom;
}

function calcWidth({
  itemStart,
  itemEnd,
  dayWidth,
  zoom,
}: WidthParams): number {
  return ((itemEnd - itemStart) / DAY_SECONDS) * dayWidth * zoom;
}

function calcTop({ rowIndex, overlapLevel, itemHeight }: TopParams): number {
  return rowIndex * itemHeight + overlapLevel * 10; // 10px de offset por nivel de overlap
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
  if (!isValidFloatbox({ config, itemData, zoomValue }))
    return { left: 0, top: 0, width: 0, height: 0 };

  const {
    startUnix = 0,
    dayWidth = DAY_WIDTH,
    itemHeight = 60, // Altura por defecto de los items
  } = config.options;
  const {
    startUnix: itemStart = 0,
    endUnix: itemEnd = 0,
    overlapLevel = 0,
  } = itemData;

  return {
    left: calcLeft({ startUnix, itemStart, dayWidth, zoom: zoomValue }),
    width: calcWidth({ itemStart, itemEnd, dayWidth, zoom: zoomValue }),
    height: FLOATBOX_HEIGHT, // Altura fija del floatbox
    top: calcTop({ rowIndex, overlapLevel, itemHeight }),
  };
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
