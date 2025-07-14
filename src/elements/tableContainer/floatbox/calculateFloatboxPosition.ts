import type { PGConfig, PGItemData } from "@/types";
import { DAY_SECONDS } from "@/utils/CONSTANTS";
import { DAY_WIDTH, FLOATBOX_HEIGHT } from "@/utils/DEFAULTS";

/**
 * Calcula la posición y tamaño de un floatbox en el timeline.
 * left/top: posición en píxeles
 * width/height: tamaño en píxeles
 */
export const calculateFloatboxPosition = ({
  config,
  itemData,
  rowIndex = 0,
  zoomValue,
}: {
  config: PGConfig;
  itemData: PGItemData;
  rowIndex?: number;
  zoomValue: number;
}): { left: number; top: number; width: number; height: number } => {
  if (!config || !itemData || !zoomValue) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

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

  if (!startUnix || !itemStart || !itemEnd) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  const left = ((itemStart - startUnix) / DAY_SECONDS) * dayWidth * zoomValue;
  const width = ((itemEnd - itemStart) / DAY_SECONDS) * dayWidth * zoomValue;
  const height = flexBoxHeight;
  const top = Number(rowIndex) * 50 + overlapLevel * flexBoxHeight;

  return { left, top, width, height };
};
