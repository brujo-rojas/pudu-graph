import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface TooltipState {
  isVisible: boolean;
  x: number;
  y: number;
  text: string;
}

const initialState: TooltipState = {
  isVisible: false,
  x: 0,
  y: 0,
  text: ''
};

export const tooltipSlice = createSlice({
  name: 'tooltip',
  initialState,
  reducers: {
    showTooltip: (state, action: PayloadAction<{ x: number; y: number; text: string }>) => {
      const { x, y, text } = action.payload;
      state.isVisible = true;
      state.x = x;
      state.y = y;
      state.text = text;
    },
    hideTooltip: (state) => {
      state.isVisible = false;
      state.text = '';
    },
    updateTooltipPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      const { x, y } = action.payload;
      state.x = x;
      state.y = y;
    }
  }
});

export const { showTooltip, hideTooltip, updateTooltipPosition } = tooltipSlice.actions;
export default tooltipSlice.reducer;
