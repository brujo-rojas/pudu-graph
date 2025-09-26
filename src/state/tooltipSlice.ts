import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface TooltipState {
  isVisible: boolean;
  x: number;
  y: number;
  text: string;
  targetElementId: string | null;
}

const initialState: TooltipState = {
  isVisible: false,
  x: 0,
  y: 0,
  text: '',
  targetElementId: null
};

export const tooltipSlice = createSlice({
  name: 'tooltip',
  initialState,
  reducers: {
    showTooltip: (state, action: PayloadAction<{ x: number; y: number; text: string; targetElementId?: string }>) => {
      const { x, y, text, targetElementId } = action.payload;
      state.isVisible = true;
      state.x = x;
      state.y = y;
      state.text = text;
      state.targetElementId = targetElementId || null;
    },
    hideTooltip: (state) => {
      state.isVisible = false;
      state.text = '';
      state.targetElementId = null;
    },
    updateTooltipPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      const { x, y } = action.payload;
      state.x = x;
      state.y = y;
    },
    updateTooltipPositionFromElement: (state, action: PayloadAction<{ x: number; y: number }>) => {
      const { x, y } = action.payload;
      state.x = x;
      state.y = y;
    }
  }
});

export const { showTooltip, hideTooltip, updateTooltipPosition, updateTooltipPositionFromElement } = tooltipSlice.actions;
export default tooltipSlice.reducer;
