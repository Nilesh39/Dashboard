/**
 * Parses custom string metrics (e.g., "1.5M", "10K", "5,200") into numbers.
 */
export function parseMetric(val) {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  
  const clean = val.toString().trim().replace(/,/g, '').toUpperCase();
  if (!clean) return 0;
  
  const num = parseFloat(clean.replace(/[KMB]/g, ''));
  if (isNaN(num)) return 0;
  
  if (clean.endsWith('K')) return Math.round(num * 1000);
  if (clean.endsWith('M')) return Math.round(num * 1000000);
  if (clean.endsWith('B')) return Math.round(num * 1000000000);
  return Math.round(num);
}

/**
 * Formats numbers to human-readable strings (e.g., 1500000 -> "1.5M").
 */
export function formatMetric(val) {
  if (val === undefined || val === null) return '0';
  const num = Number(val);
  if (isNaN(num)) return '0';
  
  if (num >= 1000000000) {
    const formatted = (num / 1000000000).toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'B' : formatted + 'B';
  }
  if (num >= 1000000) {
    const formatted = (num / 1000000).toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'M' : formatted + 'M';
  }
  if (num >= 1000) {
    const formatted = (num / 1000).toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'K' : formatted + 'K';
  }
  return num.toLocaleString();
}
