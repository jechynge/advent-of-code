import { getLinesFromInput } from '../utils/Input.js';


const items = 'abcdefghijklmnopqrstuvwxyz';
const itemPriorityValueMap = `${items}${items.toUpperCase()}`.split('').reduce((accum, item, i) => ({ ...accum, [item]: i + 1 }), {});


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const compartmentCommonItemPriorityValue = getLinesFromInput(input).reduce((accum, items) => {
        const half = items.length / 2;
    
        for(let i = 0; i < half; i++) {
            for(let j = half; j < items.length; j++) {
                if(items[i] === items[j]) {
                    return accum + itemPriorityValueMap[items[i]];
                }
            }
        }
    }, 0);
    
    return { answer: compartmentCommonItemPriorityValue };

}



////////////
// Part 2 //
////////////


const findCommonItemPriority = (firstElfItems, secondElfItems, thirdElfItems) => {
    for(let firstElfIndex = 0; firstElfIndex < firstElfItems.length; firstElfIndex++) {
        for(let secondElfIndex = 0; secondElfIndex < secondElfItems.length; secondElfIndex++) {
            for(let thirdElfIndex = 0; thirdElfIndex < thirdElfItems.length; thirdElfIndex++) {
                if(firstElfItems[firstElfIndex] === secondElfItems[secondElfIndex] && secondElfItems[secondElfIndex] === thirdElfItems[thirdElfIndex]) {
                    return itemPriorityValueMap[firstElfItems[firstElfIndex]];
                }
            }
        }
    }
};

export async function secondPuzzle(input) {

    const packs = getLinesFromInput(input);

    //> Unique packs

    const uniquePacks = packs.map(pack => [...new Set(pack.split(''))].join(''));

    let uniqueGroupedCommonItemPriorityValue = 0;

    for(let i = 0; i < uniquePacks.length; i += 3) {
        uniqueGroupedCommonItemPriorityValue += findCommonItemPriority(uniquePacks[i], uniquePacks[i + 1], uniquePacks[i + 2]);
    }

    return { answer: uniqueGroupedCommonItemPriorityValue };

}
