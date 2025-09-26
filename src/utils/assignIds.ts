import { generateUniqueId } from './generateId';
import type { PGItemData, PGRowData } from '@/types';

/**
 * Asigna IDs únicos a todos los elementos que no los tengan
 */
export function assignUniqueIds(data: PGRowData[]): PGRowData[] {
  return data.map(row => ({
    ...row,
    rowData: row.rowData?.map(item => ({
      ...item,
      id: item.id || generateUniqueId()
    })) || [],
    iconData: row.iconData?.map(item => ({
      ...item,
      id: item.id || generateUniqueId()
    })) || []
  }));
}

/**
 * Asigna un ID único a un elemento específico
 */
export function assignIdToItem(item: PGItemData): PGItemData {
  return {
    ...item,
    id: item.id || generateUniqueId()
  };
}
