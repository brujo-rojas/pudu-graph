import type { PGConfig } from "@/types";
import { DAY_SECONDS } from "@/utils/CONSTANTS";
import { DAY_WIDTH } from "@/utils/DEFAULTS";

interface Params {
  config: PGConfig;
  left: number;
  zoomValue: number;
}

/**
 * Convierte una posición left (px) a una fecha/hora (timestamp) según la configuración actual.
 */
const leftToUnix = ({ config, zoomValue, left }: Params): number => {
  if (!config || !zoomValue) return 0;
  const { startUnix = 0, dayWidth = DAY_WIDTH } = config.options;

  const result = Math.round((left / (dayWidth * zoomValue)) * DAY_SECONDS + startUnix);
  return result;
};

export default leftToUnix;
