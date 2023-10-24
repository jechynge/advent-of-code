import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const numbers = getLinesFromInput(input).map(num => parseInt(num));

    let count = 0;

    for(let i = 1; i < numbers.length; i++) {
      if(numbers[i] > numbers[i-1]) {
        ++count;
      }
    }

    timer.stop();

    printResult(`Part 1 Result`, count, timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const numbers = getLinesFromInput(input).map(num => parseInt(num));

    let count = 0;

    for(let i = 3; i < numbers.length; i++) {
      if(numbers[i] > numbers[i-3]) {
        ++count;
      }
    }

    timer.stop();

    printResult(`Part 2 Result`, count, timer);
}
