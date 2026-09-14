const TZ = 'Europe/Prague'

/** Returns a YYYY-MM-DD string for the given date (or now) in Europe/Prague timezone */
export function localDateStr(date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(date)
}
