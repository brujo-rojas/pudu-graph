export interface PuduGraphConfig {
  data: RowData[];
  options: PuduGraphOptions;
}

export interface PuduGraphOptions {
  title?: string; // Título del gráfico

  startUnix?: number; // Timestamp de inicio en milisegundos
  endUnix?: number; // Timestamp de fin en milisegundos

  isDark?: boolean; // Modo oscuro
  showTabs?: boolean; // Mostrar pestañas
  tabs?: PuduGraphTabConfig[]; // Pestañas del gráfico
  header?: PuduGraphHeaderConfig; // Encabezado del gráfico
  footer?: PuduGraphFooter; // Pie de página del gráfico
  sidebar?: PuduGraphSidebar; // Barra lateral del gráfico
  theme?: PuduGraphTheme; // Tema del gráfico
  colors?: { [key: string]: string }; // Colores personalizados
}

export interface PuduGraphTabConfig {
  id: string; // Identificador único de la pestaña
  title: string; // Título de la pestaña
  color?: string; // Color de la pestaña
  accentColor?: string; // Color de acento de la pestaña
  isActive?: boolean; // Indica si la pestaña está activa
}

export interface PuduGraphHeaderConfig {}
export interface PuduGraphFooter {}
export interface PuduGraphSidebar {}
export interface PuduGraphTheme {
  primaryColor?: string; // Color primario del tema
  secondaryColor?: string; // Color secundario del tema
  backgroundColor?: string; // Color de fondo del tema
  textColor?: string; // Color del texto del tema
  borderColor?: string; // Color del borde del tema
}

export interface RowData {
  id: number | string; // Identificador único de la fila
  label: string; // Título de la fila
  tooltip?: string; // Tooltip de la fila
  values: Object; // Valores asociados a la fila
}

export interface itemData {
  date: string; // Fecha en formato ISO
  unix: number; // Timestamp en milisegundos
  value: number; // Valor asociado a la fecha
}

export interface PuduGraphUIState {
  selectedTab?: PuduGraphTabConfig | null;
  selectedRowIds: string[];
  scrollLeft: number;
  scrollTop: number;
  visibleRange: { start: number; end: number };
}
