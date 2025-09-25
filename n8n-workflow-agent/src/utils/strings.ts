/** Utility string helpers used across the agent. */
export const toSentence = (items: string[]): string => {
  if (items.length === 0) {
    return '';
  }
  if (items.length === 1) {
    return items[0];
  }
  const head = items.slice(0, -1).join(', ');
  return `${head} e ${items[items.length - 1]}`;
};

export const sanitizeInput = (value: string): string => value.trim();

export const isAffirmative = (value: string): boolean => {
  const normalized = value.trim().toUpperCase();
  return normalized === 'APROVO' || normalized === 'SIM';
};
