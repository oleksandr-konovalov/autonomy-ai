import fs from 'fs';

export function isTokenExistAndValidByTime(path: string): boolean {
  if (!fs.existsSync(path)) {
    console.info('🧨File with storage state not exist🧨');
    return false;
  }

  return isValidByTime(path);
}

export function isValidByTime(path: string): boolean {
  const stats: fs.Stats = fs.statSync(path);
  const threeHoursAgo: number = new Date().getTime() - 3 * 60 * 60 * 1000;

  return stats.ctimeMs > threeHoursAgo;
}
