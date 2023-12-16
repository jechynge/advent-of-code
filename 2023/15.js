import { getLinesFromInput } from '../utils/Input.js';
import { LinkedList } from '../utils/LinkedList.js';
import { sum } from '../utils/Math.js';


const hashA1 = (s) => s.split('').reduce((total, char) => {
    total += char.charCodeAt(0);
    total *= 17;
    total %= 256;

    return total;
}, 0);


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const total = input.split(',').map(hashA1).reduce(sum);

    return { answer: total, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const boxes = new Array(256).fill(null);

    const instructions = input.split(',').map((instruction) => {
        const lastChar = instruction.slice(-1);
        const lastCharCode = lastChar.charCodeAt(0);

        if(lastCharCode >= 48 && lastCharCode <= 57) {
            return {
                label: instruction.slice(0, -2),
                boxIndex: hashA1(instruction.slice(0, -2)),
                op: '=',
                focalLength: parseInt(lastChar)
            };
        } else {
            return {
                label: instruction.slice(0, -1),
                boxIndex: hashA1(instruction.slice(0, -1)),
                op: '-',
                focalLength: NaN
            };
        }
    });

    for(const instruction of instructions) {
        // Make sure every box has a list
        boxes[instruction.boxIndex] ??= new LinkedList();

        const box = boxes[instruction.boxIndex];

        if(instruction.op === '-') {
            box.remove(instruction.label);

            continue;
        }

        if(instruction.op === '=') {

            if(box.has(instruction.label)) {
                box.set(instruction.label, instruction.focalLength);
            } else {
                box.push(instruction.label, instruction.focalLength);
            }

            continue;
        }

        throw new Error(`Unknown operation "${instruction.op}"!`);
    }

    const focusingPower = boxes.reduce((sum, box, boxIndex) => {
        if(!box) {
            return sum;
        }

        return sum + box.reduce((boxSum, focalLength, label, slotNumber) => 
            boxSum + ((boxIndex + 1) * (slotNumber + 1) * focalLength), 0);
    }, 0);

    return { answer: focusingPower, extraInfo: undefined };

}
