import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PuduGraphTabConfig, PuduGraphUIState } from '../types';

const initialState: PuduGraphUIState = {
  selectedTab: null,
  selectedRowIds: [],
  scrollLeft: 0,
  scrollTop: 0,
  visibleRange: { start: 0, end: 0 },
};

const uiStateSlice = createSlice({
  name: 'uiState',
  initialState,
  reducers: {
    setSelectedTab(state, action: PayloadAction<PuduGraphTabConfig | null>) {
      state.selectedTab = action.payload;
    },
    setSelectedRows(state, action: PayloadAction<string[]>) {
      state.selectedRowIds = action.payload;
    },
    setScroll(state, action: PayloadAction<{ left: number; top: number }>) {
      state.scrollLeft = action.payload.left;
      state.scrollTop = action.payload.top;
    },
    setVisibleRange(state, action: PayloadAction<{ start: number; end: number }>) {
      state.visibleRange = action.payload;
    },
    // Puedes agregar más reducers aquí
  },
});

export const { setSelectedTab, setSelectedRows, setScroll, setVisibleRange } = uiStateSlice.actions;
export default uiStateSlice.reducer;