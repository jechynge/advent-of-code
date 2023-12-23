export const greatestCommonDivisor = (a, b) => a ? greatestCommonDivisor(b % a, a) : b;

export const lowestCommonMultiple = (a, b) => a * b / greatestCommonDivisor(a, b);

export const sum = (a, b) => a + b;

export const product = (a, b) => a * b;

export const percent = (numerator, denominator, max = Infinity) => Math.min(max, denominator > 0 ? Math.floor(numerator / denominator * 100) : 0);

export const isPowerOfTwo = (x) => !!x && ((x & (x - 1)) === 0);

export const identity = (x) => x === 0 ? 0 : x / Math.abs(x);