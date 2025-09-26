import { ITEM_HEIGHT, FLOATBOX_HEIGHT } from './DEFAULTS';
import type { PGConfig } from '@/types';

/**
 * Obtiene la altura del floatbox basada en la configuración
 * @param config Configuración del gráfico
 * @returns Altura del floatbox en píxeles
 */
export function getFloatboxHeight(config: PGConfig): number {
  return config.options.floatboxHeight || FLOATBOX_HEIGHT;
}

/**
 * Obtiene la altura de los items/filas
 * @param config Configuración del gráfico
 * @returns Altura de los items en píxeles
 */
export function getItemHeight(config: PGConfig): number {
  return config.options.itemHeight || ITEM_HEIGHT;
}
