export default function formatDate(date: Date, format: string): string {
  // Función para rellenar con ceros a la izquierda
  const pad = (n: number) => n.toString().padStart(2, "0");

  // Diccionario de tokens y sus valores
  const tokens: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };

  // Reemplaza cada token en el formato por su valor correspondiente
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (token) => tokens[token]);
}
