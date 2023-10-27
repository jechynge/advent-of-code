export const Range = (from, to) => {
  if(!Number.isInteger(from)) {
    throw new Error(`Parameter "from" must be an integer - got ${from} instead.`);
  }

  if(!Number.isInteger(to)) {
    throw new Error(`Parameter "to" must be an integer - got ${to} instead.`);
  }

  const start = from <= to ? from : to;
  const end = from <= to ? to : from;

  const range = new Array(end - start + 1).fill().map((value, i) => i + start);

  return from <= to ? range : range.reverse();

};

export default Range;