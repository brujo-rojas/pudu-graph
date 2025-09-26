import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FloatDetailState {
  isVisible: boolean;
  x: number;
  y: number;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  width: number;
  height: number;
}

const initialState: FloatDetailState = {
  isVisible: false,
  x: 0,
  y: 0,
  content: '',
  position: 'top',
  width: 200,
  height: 100
};

// Función para generar tamaño aleatorio
const getRandomSize = () => {
  const width = Math.floor(Math.random() * 200) + 150; // 150-350px
  const height = Math.floor(Math.random() * 100) + 80;  // 80-180px
  return { width, height };
};

export const floatDetailSlice = createSlice({
  name: 'floatDetail',
  initialState,
  reducers: {
    showFloatDetail: (state, action: PayloadAction<{ x: number; y: number; content: string }>) => {
      const { x, y, content } = action.payload;
      
      // Generar tamaño aleatorio
      const { width: randomWidth, height: randomHeight } = getRandomSize();
      state.width = randomWidth;
      state.height = randomHeight;
      
      // Calcular posición inteligente basada en la posición del mouse
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const popupWidth = state.width;
      const popupHeight = state.height;
      
      let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
      let finalX = x;
      let finalY = y;
      
      // Determinar mejor posición lateral
      const spaceRight = viewportWidth - x - 30;
      const spaceLeft = x - 50;
      
      if (spaceRight >= popupWidth) {
        // Cabe a la derecha
        finalX = x + 30;
        finalY = y - popupHeight/2;
        position = 'right';
      } else if (spaceLeft >= popupWidth) {
        // Cabe a la izquierda
        finalX = x - popupWidth - 50;
        finalY = y - popupHeight/2 - 10;
        position = 'left';
      } else {
        // No cabe completamente en ningún lado, elegir el lado con más espacio
        if (spaceRight > spaceLeft) {
          // Más espacio a la derecha, posicionar a la derecha
          finalX = x + 30;
          finalY = y - popupHeight/2;
          position = 'right';
        } else {
          // Más espacio a la izquierda, posicionar a la izquierda
          finalX = x - popupWidth - 30;
          finalY = y - popupHeight/2;
          position = 'left';
        }
      }
      
      // Ajustar posición para que la flecha apunte exactamente al mouse
      // La flecha está en el centro del popup, así que centramos el popup en el mouse
      if (position === 'left' || position === 'right') {
        // Para posiciones laterales, centrar verticalmente
        finalY = y - popupHeight/2;
      } else {
        // Para posiciones verticales, centrar horizontalmente
        finalX = x - popupWidth/2;
      }
      
      // Asegurar que el popup no se salga de los límites de la ventana
      const margin = 10; // Margen mínimo desde los bordes
      
      // Ajustar posición horizontal
      if (finalX < margin) {
        finalX = margin;
      } else if (finalX + popupWidth > viewportWidth - margin) {
        finalX = viewportWidth - popupWidth - margin;
      }
      
      // Ajustar posición vertical
      if (finalY < margin) {
        finalY = margin;
      } else if (finalY + popupHeight > viewportHeight - margin) {
        finalY = viewportHeight - popupHeight - margin;
      }
      
      // Logs removidos para producción

      state.isVisible = true;
      state.x = finalX;
      state.y = finalY;
      state.content = content;
      state.position = position;
    },
    hideFloatDetail: (state) => {
      state.isVisible = false;
      state.content = '';
    },
    updateFloatDetailPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      const { x, y } = action.payload;
      
      // Recalcular posición inteligente
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const popupWidth = state.width;
      const popupHeight = state.height;
      
      let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
      let finalX = x;
      let finalY = y;
      
      // Determinar mejor posición lateral
      const spaceRight = viewportWidth - x - 30;
      const spaceLeft = x - 50;
      
      if (spaceRight >= popupWidth) {
        // Cabe a la derecha
        finalX = x + 30;
        finalY = y - popupHeight/2;
        position = 'right';
      } else if (spaceLeft >= popupWidth) {
        // Cabe a la izquierda
        finalX = x - popupWidth - 50;
        finalY = y - popupHeight/2 - 10;
        position = 'left';
      } else {
        // No cabe completamente en ningún lado, elegir el lado con más espacio
        if (spaceRight > spaceLeft) {
          // Más espacio a la derecha, posicionar a la derecha
          finalX = x + 30;
          finalY = y - popupHeight/2;
          position = 'right';
        } else {
          // Más espacio a la izquierda, posicionar a la izquierda
          finalX = x - popupWidth - 30;
          finalY = y - popupHeight/2;
          position = 'left';
        }
      }
      
      // Asegurar que el popup no se salga de los límites de la ventana
      const margin = 10; // Margen mínimo desde los bordes
      
      // Ajustar posición horizontal
      if (finalX < margin) {
        finalX = margin;
      } else if (finalX + popupWidth > viewportWidth - margin) {
        finalX = viewportWidth - popupWidth - margin;
      }
      
      // Ajustar posición vertical
      if (finalY < margin) {
        finalY = margin;
      } else if (finalY + popupHeight > viewportHeight - margin) {
        finalY = viewportHeight - popupHeight - margin;
      }
      
      state.x = finalX;
      state.y = finalY;
      state.position = position;
    }
  }
});

export const { showFloatDetail, hideFloatDetail, updateFloatDetailPosition } = floatDetailSlice.actions;
export default floatDetailSlice.reducer;
