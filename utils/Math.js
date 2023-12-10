export const greatestCommonDivisor = (a, b) => a ? greatestCommonDivisor(b % a, a) : b;

export const lowestCommonMultiple = (a, b) => a * b / greatestCommonDivisor(a, b);

export const sum = (a, b) => a + b;

export const product = (a, b) => a * b;