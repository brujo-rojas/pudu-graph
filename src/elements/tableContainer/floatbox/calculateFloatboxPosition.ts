import type { PGConfig, PGItemData } from "@/types";
import { DAY_SECONDS } from "@/utils/CONSTANTS";
import { DAY_WIDTH, FLOATBOX_HEIGHT } from "@/utils/DEFAULTS";

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
  flexBoxHeight: number;
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

function calcTop({ rowIndex, overlapLevel, flexBoxHeight }: TopParams): number {
  return rowIndex * 50 + overlapLevel * flexBoxHeight;
}

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
    flexBoxHeight = FLOATBOX_HEIGHT,
  } = config.options;
  const {
    startUnix: itemStart = 0,
    endUnix: itemEnd = 0,
    overlapLevel = 0,
  } = itemData;

  return {
    left: calcLeft({ startUnix, itemStart, dayWidth, zoom: zoomValue }),
    width: calcWidth({ itemStart, itemEnd, dayWidth, zoom: zoomValue }),
    height: flexBoxHeight,
    top: calcTop({ rowIndex, overlapLevel, flexBoxHeight }),
  };
}
