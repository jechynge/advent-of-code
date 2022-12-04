import { detectNewline } from 'detect-newline';
import { printResult } from '../utils/PrettyPrint.js';


const getCaloriesCarriedPerElf = (input) => {
    const newlineCharacter = detectNewline(input);
    const splitBy = `${newlineCharacter}${newlineCharacter}`;

    return input.split(splitBy).map((carriedItems) => carriedItems.split(newlineCharacter).reduce((accum, item) => accum + parseInt(item), 0) ?? 0).sort((a, b) => b - a);
}


////////////
// Part 1 //
////////////


export async function puzzle1(input) {
    const caloriesCarriedPerElf = getCaloriesCarriedPerElf(input);
    
    printResult('Part 1', caloriesCarriedPerElf[0]);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const caloriesCarriedPerElf = getCaloriesCarriedPerElf(input);

    const topThreeCalories = caloriesCarriedPerElf.slice(0, 3).reduce((accum, calories) => accum + calories, 0);

    printResult('Part 2', topThreeCalories);
}
