import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

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

    return { answer: depth * distance };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

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

    return { answer: depth * distance };

}
