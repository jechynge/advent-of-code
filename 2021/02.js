import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    let depth = 0;
    let distance = 0;

    getLinesFromInput(input).map(direction => direction.split(' ')).forEach(([ direction, amount ]) => {
        switch(direction) {
            case 'up':
                depth -= parseInt(amount);
                break;
            case 'down':
                depth += parseInt(amount);
                break;
            case 'forward':
                distance += parseInt(amount);
                break;
        }
    });

    timer.stop();

    printResult(`Part 1 Result`, depth * distance, timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    let aim = 0;
    let depth = 0;
    let distance = 0;

    getLinesFromInput(input).map(direction => direction.split(' ')).forEach(([ direction, amount ]) => {
        switch(direction) {
            case 'up':
                aim -= parseInt(amount);
                break;
            case 'down':
                aim += parseInt(amount);
                break;
            case 'forward':
                distance += parseInt(amount);
                depth += aim * parseInt(amount);
                break;
        }
    });

    timer.stop();

    printResult(`Part 2 Result`, depth * distance, timer);
}
