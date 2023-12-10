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

printTitle(`!! Testing !! ${year} -- Day ${paddedDay}`);

const input = await FetchInput(year, `${paddedDay}`, true);

const { test } = await import(`./${year}/${paddedDay}.js`);

const testResult = await test(input);

printResult(`Test Result:`, testResult.passed ? 'Pass' : 'Fail', null, testResult.extraInfo);

console.log('\nDone!\n');
