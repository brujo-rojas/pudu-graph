import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FloatboxSelection {
  id: string;
  type: 'floatbox' | 'icon';
  rowIndex: number;
  itemIndex: number;
}

export interface FloatboxSelectionState {
  selections: FloatboxSelection[];
}

const initialState: FloatboxSelectionState = {
  selections: []
};

export const floatboxSelectionSlice = createSlice({
  name: 'floatboxSelection',
  initialState,
  reducers: {
    addFloatboxSelection: (state, action: PayloadAction<FloatboxSelection>) => {
      const newSelection = action.payload;
      
      // Verificar si ya está seleccionado
      const isAlreadySelected = state.selections.some(
        selection => selection.id === newSelection.id
      );
      
      if (!isAlreadySelected) {
        state.selections.push(newSelection);
      }
    },
    removeFloatboxSelection: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      state.selections = state.selections.filter(selection => selection.id !== id);
    },
    toggleFloatboxSelection: (state, action: PayloadAction<FloatboxSelection>) => {
      const newSelection = action.payload;
      const existingIndex = state.selections.findIndex(
        selection => selection.id === newSelection.id
      );
      
      if (existingIndex >= 0) {
        // Si ya está seleccionado, lo removemos
        state.selections.splice(existingIndex, 1);
      } else {
        // Si no está seleccionado, lo agregamos
        state.selections.push(newSelection);
      }
    },
    clearAllFloatboxSelections: (state) => {
      state.selections = [];
    },
    setFloatboxSelections: (state, action: PayloadAction<FloatboxSelection[]>) => {
      state.selections = action.payload;
    },
    selectFloatboxById: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      // Solo seleccionar este elemento (limpiar otros)
      state.selections = state.selections.filter(selection => selection.id === id);
    }
  }
});

export const { 
  addFloatboxSelection, 
  removeFloatboxSelection, 
  toggleFloatboxSelection, 
  clearAllFloatboxSelections, 
  setFloatboxSelections,
  selectFloatboxById
} = floatboxSelectionSlice.actions;

export default floatboxSelectionSlice.reducer;
