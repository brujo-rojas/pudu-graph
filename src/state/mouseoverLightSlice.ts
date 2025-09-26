import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface DayInfo {
  dayIndex: number;
  targetUnix: number;
  date: string;
  dayOfWeek: string;
  dayOfMonth: number;
  month: string;
}

export interface ItemInfo {
  itemIndex: number;
  rowData: any | null;
  rowLabel: string;
  isWithinBounds: boolean;
}

export interface MouseoverLightState {
  isVisible: boolean;
  x: number;
  y: number;
  tableRect: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
  dayInfo: DayInfo | null;
  itemInfo: ItemInfo | null;
}

const initialState: MouseoverLightState = {
  isVisible: false,
  x: 0,
  y: 0,
  tableRect: null,
  dayInfo: null,
  itemInfo: null
};

export const mouseoverLightSlice = createSlice({
  name: 'mousePosition',
  initialState,
  reducers: {
    showMouseoverLight: (state, action: PayloadAction<{ x: number; y: number; tableRect?: DOMRect }>) => {
      const { x, y, tableRect } = action.payload;
      state.isVisible = true;
      state.x = x;
      state.y = y;
      if (tableRect) {
        state.tableRect = {
          left: tableRect.left,
          top: tableRect.top,
          width: tableRect.width,
          height: tableRect.height
        };
      }
    },
    updateMouseoverLightPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      const { x, y } = action.payload;
      state.x = x;
      state.y = y;
    },
    hideMouseoverLight: (state) => {
      state.isVisible = false;
      state.tableRect = null;
    },
    setTableRect: (state, action: PayloadAction<DOMRect>) => {
      const rect = action.payload;
      state.tableRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
    },
    updateMouseoverInfo: (state, action: PayloadAction<{ dayInfo: DayInfo | null; itemInfo: ItemInfo | null }>) => {
      const { dayInfo, itemInfo } = action.payload;
      state.dayInfo = dayInfo;
      state.itemInfo = itemInfo;
    }
  }
});

export const { 
  showMouseoverLight, 
  updateMouseoverLightPosition, 
  hideMouseoverLight, 
  setTableRect,
  updateMouseoverInfo
} = mouseoverLightSlice.actions;

export default mouseoverLightSlice.reducer;
