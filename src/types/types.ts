export interface PuduGraphConfig {
  data: PuduGraphRowData[];
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

export interface PuduGraphSidebar {
  columns?: PuduGraphSidebarColumn[]; // Columnas visibles en la barra lateral
  width?: number; // Ancho de la barra lateral en píxeles

  // agregar Eventos?
}

export interface PuduGraphSidebarColumn {
  id: string; // Identificador único de la columna
  label: string; // Título de la columna
  type: "text" | "input" ; // Tipo de columna (texto o entrada)
  field: string; // Campo asociado a la columna
  headerTooltip?: string; // Tooltip de la columna
  isVisible?: boolean; // Indica si la columna es visible
  width?: number; // Ancho de la columna en píxeles
}

export interface PuduGraphTheme {
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
  rowData: PuduGraphItemData[]; // Datos de la fila, array de objetos con fecha y valor
}

export interface PuduGraphItemData {
  date: string; // Fecha en formato ISO
  unix: number; // Timestamp en milisegundos
  value: number; // Valor asociado a la fecha
}

export interface PuduGraphUIState {
  selectedTab?: PuduGraphTabConfig | null;
  selectedRowIds?: string[];
  scrollLeft?: number;
  scrollTop?: number;
  zoomValue?: number; // Valor de zoom de la vista
}
