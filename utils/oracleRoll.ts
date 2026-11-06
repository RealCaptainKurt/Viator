/** Small dice helpers shared by the Oracle's table files. */

/** A fair six-sided die. */
export const d6 = (): number => Math.floor(Math.random() * 6) + 1;

/** A uniformly random entry of any-length table. */
export function pick<T>(table: readonly T[]): T {
  return table[Math.floor(Math.random() * table.length)];
}

/** Roll a d6 on a 6-entry table. */
export function roll6<T>(table: readonly T[]): T {
  return table[d6() - 1];
}

/**
 * Roll 2d6 "in order" (tens digit, then ones digit) on a 36-entry table laid
 * out 11, 12 … 16, 21 … 66 — the way the Viator books print them.
 */
export function roll66<T>(table: readonly T[]): T {
  return table[(d6() - 1) * 6 + (d6() - 1)];
}

/** Capitalize the first character (leaves the rest — and proper nouns — alone). */
export function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Finish a sentence: add a period unless it already ends in . ! or ? */
export function stop(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}
