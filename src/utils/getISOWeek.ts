export default function getISOWeek(date: Date): number {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  // Jueves en la semana actual decide el año de la semana
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
  // 4 de enero es siempre en la semana 1
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  // Ajusta al jueves de la semana 1
  return (
    1 +
    Math.round(
      ((tempDate.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}
