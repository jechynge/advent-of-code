import minimist from 'minimist';
import FetchInput from './utils/FetchInput.js';
import { printTitle, printResult } from './utils/PrettyPrint.js';
import PerformanceTimer from './utils/PerformanceTimer.js';

const { day: dayArg, year: yearArg } = minimist(process.argv.slice(2));

const today = new Date();
today.setHours(today.getHours() + 2);

const day = dayArg ?? today.getDate();
const year = yearArg ?? today.getFullYear();

const paddedDay = day.toString().padStart(2, '0');

printTitle(`Advent of Code ${year} -- Day ${paddedDay}`);

const input = await FetchInput(year, paddedDay);

const { firstPuzzle, secondPuzzle } = await import(`./${year}/${paddedDay}.js`);

const firstPuzzleTimer = new PerformanceTimer('Puzzle 1');

const firstPuzzleSolution = await firstPuzzle(input);

firstPuzzleTimer.stop();

printResult(`Part 1 Result`, firstPuzzleSolution.answer, firstPuzzleTimer, firstPuzzleSolution.extraInfo);

const secondPuzzleTimer = new PerformanceTimer('Puzzle 2');

const secondPuzzleResult = await secondPuzzle(input);

secondPuzzleTimer.stop();

printResult(`Part 2 Result`, secondPuzzleResult.answer, secondPuzzleTimer, secondPuzzleResult.extraInfo);

console.log('\nDone!\n');
