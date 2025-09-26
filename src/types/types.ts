import type { LitElement } from "lit";

export interface PGConfig {
  data: PGRowData[];
  options: PGOptions;
}

export interface PGOptions {
  title?: string; // Título del gráfico
  startUnix?: number; // Timestamp de inicio en milisegundos
  endUnix?: number; // Timestamp de fin en milisegundos
  header?: PGHeaderConfig; // Encabezado del gráfico
  footer?: PGFooter; // Pie de página del gráfico
  sidebar?: PGSidebar; // Barra lateral del gráfico
  theme?: PGTheme; // Tema del gráfico

  itemHeight?: number; // Altura de los items en la barra lateral
  flexBoxHeight?: number; // Altura del contenedor flexible de la barra lateral
  dayWidth?: number; // Ancho de cada día en la línea de tiempo
  
  // Opciones de interactividad
  interactions?: PGInteractions; // Configuración de interacciones del usuario
  
  // Opciones de optimización
  floatboxHeight?: number; // Altura del floatbox
  maxOverlapLevels?: number; // Máximo número de niveles de solapamiento
  enableVirtualization?: boolean; // Habilitar virtualización
  cacheSize?: number; // Tamaño del cache
}

export interface PGInteractions {
  enableDrag?: boolean; // Habilita/deshabilita drag and drop
  enableResize?: boolean; // Habilita/deshabilita resize
  enableLeftResize?: boolean; // Habilita/deshabilita resize desde la izquierda
  enableRightResize?: boolean; // Habilita/deshabilita resize desde la derecha
  dragHorizontalOnly?: boolean; // Si es true, el arrastre solo será horizontal
}

export interface PGHeaderConfig {}

export interface PGFooter {}

export interface PGSidebar {
  columns?: PGSidebarColumn[]; // Columnas visibles en la barra lateral
  width?: number; // Ancho de la barra lateral en píxeles
  appendWidth?: number; // Ancho adicional para la barra lateral
}

export type PGSidebarColumnType =
  | "text"
  | "number"
  | "date"
  | "hours"
  | "custom";

export interface PGSidebarColumn {
  id: string; // Identificador único de la columna
  label: string; // Título de la columna
  type: PGSidebarColumnType; // Tipo de dato de la columna
  field: string; // Campo asociado a la columna
  headerTooltip?: string; // Tooltip de la columna
  isVisible?: boolean; // Indica si la columna es visible
  width?: number; // Ancho de la columna en píxeles
  render?: (
    row: PGRowData,
    column: PGSidebarColumn,
    host: LitElement
  ) => HTMLElement; // Función de renderizado personalizada para la columna
}

export interface PGTheme {
  primaryColor?: string; // Color primario del tema
  secondaryColor?: string; // Color secundario del tema
  backgroundColor?: string; // Color de fondo del tema
  textColor?: string; // Color del texto del tema
  borderColor?: string; // Color del borde del tema
}

export interface PGRowData {
  id: number | string; // Identificador único de la fila
  label: string; // Título de la fila
  tooltip?: string; // Tooltip de la fila
  values: { [key: string]: any }; // Valores asociados a la fila, puede ser un objeto con múltiples campos
  rowData: PGItemData[]; // Datos de la fila, array de objetos con fecha y valor
}

export interface PGItemData {
  startUnix: number; // Timestamp de inicio en milisegundos
  endUnix: number; // Timestamp de fin en milisegundos
  value?: number; // Valor asociado a la fecha
  [key: string]: any; // Otros campos adicionales
  color?: string; // Color asociado al valor
  overlapLevel?: number; // Nivel de superposición para el item
  interactions?: PGInteractions; // Configuración específica de interacciones para este item
}

export interface PGUIState {
  selectedRowIds?: string[];
  scrollLeft?: number;
  scrollTop?: number;
  zoomValue?: number; // Valor de zoom de la vista
}

export interface HeaderItem {
  localDate: string;
  monthNumber: number; // Número del mes (0-11)
  dayNumber: number; // Número del día (1-31)
  isoWeekNumber: number; // Número de la semana ISO
  show: boolean; // Indica si el día debe mostrarse
  hours: string[]; // Array de horas en formato HH:MM
  startUnix: number; // Timestamp de inicio del día en segundos
  endUnix: number; // Timestamp de fin del día en segundos
}
