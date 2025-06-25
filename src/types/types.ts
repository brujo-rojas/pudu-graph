export interface PGConfig {
  data: PuduGraphRowData[];
  options: PGOptions;
}

export interface PGOptions {
  title?: string; // Título del gráfico

  startUnix?: number; // Timestamp de inicio en milisegundos
  endUnix?: number; // Timestamp de fin en milisegundos

  isDark?: boolean; // Modo oscuro
  showTabs?: boolean; // Mostrar pestañas
  tabs?: PGTabConfig[]; // Pestañas del gráfico
  header?: PGHeaderConfig; // Encabezado del gráfico
  footer?: PGFooter; // Pie de página del gráfico
  sidebar?: PGSidebar; // Barra lateral del gráfico
  theme?: PGTheme; // Tema del gráfico
  colors?: { [key: string]: string }; // Colores personalizados
}

export interface PGTabConfig {
  id: string; // Identificador único de la pestaña
  title: string; // Título de la pestaña
  color?: string; // Color de la pestaña
  accentColor?: string; // Color de acento de la pestaña
  isActive?: boolean; // Indica si la pestaña está activa
}

export interface PGHeaderConfig {}

export interface PGFooter {}

export interface PGSidebar {
  columns?: PGSidebarColumn[]; // Columnas visibles en la barra lateral
  width?: number; // Ancho de la barra lateral en píxeles

  // agregar Eventos?
}

export interface PGSidebarColumn {
  id: string; // Identificador único de la columna
  label: string; // Título de la columna
  type: "text" | "input"; // Tipo de columna (texto o entrada)
  field: string; // Campo asociado a la columna
  headerTooltip?: string; // Tooltip de la columna
  isVisible?: boolean; // Indica si la columna es visible
  width?: number; // Ancho de la columna en píxeles
}

export interface PGTheme {
  primaryColor?: string; // Color primario del tema
  secondaryColor?: string; // Color secundario del tema
  backgroundColor?: string; // Color de fondo del tema
  textColor?: string; // Color del texto del tema
  borderColor?: string; // Color del borde del tema
}

export interface PuduGraphRowData {
  id: number | string; // Identificador único de la fila
  label: string; // Título de la fila
  tooltip?: string; // Tooltip de la fila
  values: Object; // Valores asociados a la fila
  rowData: PGItemData[]; // Datos de la fila, array de objetos con fecha y valor
}

export interface PGItemData {
  date: string; // Fecha en formato ISO
  unix: number; // Timestamp en milisegundos
  value: number; // Valor asociado a la fecha
  [key: string]: any; // Otros campos adicionales
  color?: string; // Color asociado al valor
}

export interface PuduGraphUIState {
  selectedTab?: PGTabConfig | null;
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
