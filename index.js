import minimist from 'minimist';
import FetchInput from './utils/FetchInput.js';
import { printTitle } from './utils/PrettyPrint.js';


const { day: dayArg, year: yearArg } = minimist(process.argv.slice(2));

const day = dayArg ?? new Date().getDate();
const year = yearArg ?? new Date().getFullYear();

const paddedDay = day.toString().padStart(2, '0');

printTitle(`Advent of Code ${year} -- Day ${paddedDay}`);

const input = await FetchInput(year, paddedDay);

const { puzzle1, puzzle2 } = await import(`./${year}/${paddedDay}.js`);

await puzzle1(input);

await puzzle2(input);

console.log('\nDone!\n');
