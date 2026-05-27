/**
 * Adiciona N dias úteis (seg-sex) a uma data.
 * @param {Date} startDate - Data de início
 * @param {number} days - Número de dias úteis a adicionar
 * @returns {Date}
 */
export function addWorkingDays(startDate, days) {
  const date = new Date(startDate);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) { // não é domingo (0) nem sábado (6)
      added++;
    }
  }
  return date;
}

/**
 * Retorna true se a data de descarte já passou ou é hoje.
 * @param {Date} dataDescarte
 * @returns {boolean}
 */
export function isDisposalAllowed(dataDescarte) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dataDescarte);
  d.setHours(0, 0, 0, 0);
  return d <= today;
}