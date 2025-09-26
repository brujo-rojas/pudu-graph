import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: MouseoverLightState = {
  isVisible: false,
  x: 0,
  y: 0,
  tableRect: null
};

export const mouseoverLightSlice = createSlice({
  name: 'mouseoverLight',
  initialState,
  reducers: {
    showMouseoverLight: (state, action: PayloadAction<{ x: number; y: number; tableRect?: DOMRect }>) => {
      console.log('🎯 Redux: showMouseoverLight action dispatched:', action.payload);
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
      console.log('🎯 Redux: State updated to:', state);
    },
    updateMouseoverLightPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      console.log('🎯 Redux: updateMouseoverLightPosition action dispatched:', action.payload);
      const { x, y } = action.payload;
      state.x = x;
      state.y = y;
      console.log('🎯 Redux: Position updated to:', { x: state.x, y: state.y });
    },
    hideMouseoverLight: (state) => {
      console.log('🎯 Redux: hideMouseoverLight action dispatched');
      state.isVisible = false;
      state.tableRect = null;
      console.log('🎯 Redux: State updated to:', state);
    },
    setTableRect: (state, action: PayloadAction<DOMRect>) => {
      console.log('🎯 Redux: setTableRect action dispatched:', action.payload);
      const rect = action.payload;
      state.tableRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
      console.log('🎯 Redux: Table rect updated to:', state.tableRect);
    }
  }
});

export const { 
  showMouseoverLight, 
  updateMouseoverLightPosition, 
  hideMouseoverLight, 
  setTableRect 
} = mouseoverLightSlice.actions;

export default mouseoverLightSlice.reducer;
