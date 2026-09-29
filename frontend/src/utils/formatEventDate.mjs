const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const formatEventDate = (isoDate) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new TypeError(`Invalid event date: ${isoDate}`);

  const [, year, month, day] = match;
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex >= monthNames.length) {
    throw new TypeError(`Invalid event date: ${isoDate}`);
  }
  const calendarDate = new Date(Date.UTC(Number(year), monthIndex, Number(day)));
  if (calendarDate.getUTCFullYear() !== Number(year) || calendarDate.getUTCMonth() !== monthIndex || calendarDate.getUTCDate() !== Number(day)) {
    throw new TypeError(`Invalid event date: ${isoDate}`);
  }

  return { day, mon: monthNames[monthIndex], year: Number(year) };
};
