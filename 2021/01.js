import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const numbers = getLinesFromInput(input).map(num => parseInt(num));

    let count = 0;

    for(let i = 1; i < numbers.length; i++) {
      if(numbers[i] > numbers[i-1]) {
        ++count;
      }
    }

    return { answer: count };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const numbers = getLinesFromInput(input).map(num => parseInt(num));

    let count = 0;

    for(let i = 3; i < numbers.length; i++) {
      if(numbers[i] > numbers[i-3]) {
        ++count;
      }
    }

    return { answer: count };
    
}
