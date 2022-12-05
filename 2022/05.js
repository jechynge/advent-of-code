import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';
import { detectNewline } from 'detect-newline';


const buildInitialStacks = (stackCount, initialStackLayout) => {
    const stacks = new Array(stackCount).fill(null).map(() => []);

    initialStackLayout.reverse().map((stackLayer) => stackLayer.substring(1)).forEach((stackLayer) => {
        for(let i = 0; i < stackLayer.length; i += 4) {
            if(stackLayer[i] === ' ') {
                continue;
            } 

            stacks[i / 4].push(stackLayer[i]);
        }
    });

    return stacks;
};


////////////
// Part 1 //
////////////


export async function puzzle1(input) {

    const timer = new PerformanceTimer('Puzzle 1');

    const splitBy = detectNewline(input);

    const [ initialStackLayout, moveInstructions ] = input.split(splitBy + splitBy).map(inputPart => getLinesFromInput(inputPart));

    const stackCount = parseInt((initialStackLayout.splice(-1, 1))[0].split('   ').reverse()[0]);

    const stacks = buildInitialStacks(stackCount, initialStackLayout);

    moveInstructions.map(line => line.split(' ').map(i => parseInt(i)).filter(i => !isNaN(i))).forEach(([count, from, to]) => {
        stacks[to - 1] = stacks[to - 1].concat(...stacks[from - 1].splice(-count, count).reverse());
    });

    const topLayer = stacks.reduce((accum, stack) => accum + stack[stack.length - 1], '');

    timer.stop();

    printResult(`Part 1 Result`, topLayer, timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {

    const timer = new PerformanceTimer('Puzzle 2');

    const splitBy = detectNewline(input);

    const [ initialStackLayout, moveInstructions ] = input.split(splitBy + splitBy).map(inputPart => getLinesFromInput(inputPart));

    const stackCount = parseInt((initialStackLayout.splice(-1, 1))[0].split('   ').reverse()[0]);

    const stacks = buildInitialStacks(stackCount, initialStackLayout);

    moveInstructions.map(line => line.split(' ').map(i => parseInt(i)).filter(i => !isNaN(i))).forEach(([count, from, to]) => {
        stacks[to - 1] = stacks[to - 1].concat(...stacks[from - 1].splice(-count, count));
    });

    const topLayer = stacks.reduce((accum, stack) => accum + stack[stack.length - 1], '');

    timer.stop();

    printResult(`Part 2 Result`, topLayer, timer);
}
