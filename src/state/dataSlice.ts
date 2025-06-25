import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PuduGraphRowData } from "../types";

// DataState ahora es simplemente un array de RowData
export type DataState = PuduGraphRowData[];

const initialState: DataState = [];

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setRows(state, action: PayloadAction<PuduGraphRowData[]>) {
      return action.payload;
    },
    addRow(state, action: PayloadAction<PuduGraphRowData>) {
      state.push(action.payload);
    },
    updateRow(
      state,
      action: PayloadAction<{ id: string; data: Partial<PuduGraphRowData> }>
    ) {
      const idx = state.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state[idx] = { ...state[idx], ...action.payload.data };
      }
    },
    removeRow(state, action: PayloadAction<string>) {
      return state.filter((r) => r.id !== action.payload);
    },
    clearRows() {
      return [];
    },
  },
});

export const { setRows, addRow, updateRow, removeRow, clearRows } =
  dataSlice.actions;
export default dataSlice.reducer;
