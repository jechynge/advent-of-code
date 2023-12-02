import { detectNewline } from 'detect-newline';


const getCaloriesCarriedPerElf = (input) => {
    const newlineCharacter = detectNewline(input);
    const splitBy = `${newlineCharacter}${newlineCharacter}`;

    return input.split(splitBy).map((carriedItems) => carriedItems.split(newlineCharacter).reduce((accum, item) => accum + parseInt(item), 0) ?? 0).sort((a, b) => b - a);
}


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const caloriesCarriedPerElf = getCaloriesCarriedPerElf(input);
    
    return { answer: caloriesCarriedPerElf[0] };
    
}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const caloriesCarriedPerElf = getCaloriesCarriedPerElf(input);

    return { answer: caloriesCarriedPerElf.slice(0, 3).reduce((accum, calories) => accum + calories, 0) };

}
