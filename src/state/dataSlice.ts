import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PGRowData } from "@/types";

// DataState ahora es simplemente un array de RowData
export type DataState = PGRowData[];

const initialState: DataState = [];

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setRows(state, action: PayloadAction<PGRowData[]>) {
      return action.payload;
    },
    addRow(state, action: PayloadAction<PGRowData>) {
      state.push(action.payload);
    },
    updateRow(
      state,
      action: PayloadAction<{ id: string; data: Partial<PGRowData> }>
    ) {
      const idx = state.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state[idx] = { ...state[idx], ...action.payload.data };
      }
    },
    removeRow(state, action: PayloadAction<string>) {
      return state.filter((r) => r.id !== action.payload);
    },
    updateRowItem(
      state,
      action: PayloadAction<{ rowIndex: number; itemIndex: number; itemData: any }>
    ) {
      const { rowIndex, itemIndex, itemData } = action.payload;
      if (state[rowIndex] && state[rowIndex].rowData && state[rowIndex].rowData[itemIndex]) {
        state[rowIndex].rowData[itemIndex] = itemData;
      }
    },
    clearRows() {
      return [];
    },
  },
});

export const { setRows, addRow, updateRow, removeRow, updateRowItem, clearRows } =
  dataSlice.actions;
export default dataSlice.reducer;
