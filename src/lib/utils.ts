import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateFinalRate(rate: number, gst: number): number {
  if (typeof rate !== 'number' || typeof gst !== 'number' || isNaN(rate) || isNaN(gst)) {
    return 0;
  }
  const final = rate + (rate * gst / 100);
  return parseFloat(final.toFixed(2));
}
