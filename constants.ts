
import { MonthlyEntry } from './types';

// Values based on the image provided: 120, 180, 230, 270, 360, 430, 450, 530, 550, 600, 630, 650
// Total = 5000. For a couple (x2) = 10000.
export const INITIAL_VALUES = [
  120, 180, 230, 270, 360, 430, 450, 530, 550, 600, 630, 650
];

export const DEFAULT_ENTRIES: MonthlyEntry[] = INITIAL_VALUES.map((val, index) => ({
  month: index + 1,
  value: val,
  isSaved: false
}));

export const APP_STORAGE_KEY = 'poupanca_10k_data';
