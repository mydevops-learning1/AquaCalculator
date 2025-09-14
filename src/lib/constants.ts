export const FLATS = [
  'G01',
  'G01 SOLAR',
  '101',
  '101 SOLAR',
  '201',
  '301',
  '202',
  '302',
  'COMMON',
] as const;

export type FlatName = typeof FLATS[number];
