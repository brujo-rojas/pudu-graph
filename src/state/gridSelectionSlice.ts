import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface GridCell {
  rowIndex: number;
  dayIndex: number;
}

export interface GridSelectionState {
  selections: GridCell[];
}

const initialState: GridSelectionState = {
  selections: []
};

export const gridSelectionSlice = createSlice({
  name: 'gridSelection',
  initialState,
  reducers: {
    addGridSelection: (state, action: PayloadAction<{ rowIndex: number; dayIndex: number }>) => {
      const { rowIndex, dayIndex } = action.payload;
      const cellKey = `${rowIndex}-${dayIndex}`;
      
      // Verificar si la celda ya está seleccionada
      const isAlreadySelected = state.selections.some(
        cell => cell.rowIndex === rowIndex && cell.dayIndex === dayIndex
      );
      
      if (!isAlreadySelected) {
        state.selections.push({ rowIndex, dayIndex });
      }
    },
    removeGridSelection: (state, action: PayloadAction<{ rowIndex: number; dayIndex: number }>) => {
      const { rowIndex, dayIndex } = action.payload;
      state.selections = state.selections.filter(
        cell => !(cell.rowIndex === rowIndex && cell.dayIndex === dayIndex)
      );
    },
    toggleGridSelection: (state, action: PayloadAction<{ rowIndex: number; dayIndex: number }>) => {
      const { rowIndex, dayIndex } = action.payload;
      const existingIndex = state.selections.findIndex(
        cell => cell.rowIndex === rowIndex && cell.dayIndex === dayIndex
      );
      
      if (existingIndex >= 0) {
        // Si ya está seleccionada, la removemos
        state.selections.splice(existingIndex, 1);
      } else {
        // Si no está seleccionada, la agregamos
        state.selections.push({ rowIndex, dayIndex });
      }
    },
    clearAllSelections: (state) => {
      state.selections = [];
    },
    setGridSelections: (state, action: PayloadAction<GridCell[]>) => {
      state.selections = action.payload;
    }
  }
});

export const { addGridSelection, removeGridSelection, toggleGridSelection, clearAllSelections, setGridSelections } = gridSelectionSlice.actions;
export default gridSelectionSlice.reducer;
