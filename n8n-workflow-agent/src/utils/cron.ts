const hourlyPattern = /^([0-1]?\d|2[0-3])h$/i;

export const normalizeCron = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) {
    return '* * * * *';
  }
  const lower = trimmed.toLowerCase();
  if (hourlyPattern.test(lower)) {
    const hour = lower.replace('h', '');
    return `0 ${hour} * * *`;
  }
  if (/^\d+$/.test(lower)) {
    const minute = parseInt(lower, 10) % 60;
    return `${minute} * * * *`;
  }
  if (lower === 'diario' || lower === 'diário' || lower === 'daily') {
    return '0 9 * * *';
  }
  return trimmed;
};
