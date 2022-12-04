import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';


const items = 'abcdefghijklmnopqrstuvwxyz';
const itemPriorityValueMap = `${items}${items.toUpperCase()}`.split('').reduce((accum, item, i) => ({ ...accum, [item]: i + 1 }), {});


////////////
// Part 1 //
////////////


export async function puzzle1(input) {
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
    
    printResult(`Part 1`, compartmentCommonItemPriorityValue);
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

export async function puzzle2(input) {
    const packs = getLinesFromInput(input);

    //> Unsorted packs

    const unsortedTimer = new PerformanceTimer('Find badge in unsorted packs');

    let unsortedGroupedCommonItemPriorityValue = 0;

    for(let i = 0; i < packs.length; i += 3) {
        unsortedGroupedCommonItemPriorityValue += findCommonItemPriority(packs[i], packs[i + 1], packs[i + 2]);
    }

    unsortedTimer.stop();

    printResult(`Part 2 - Unsorted Items`, unsortedGroupedCommonItemPriorityValue, unsortedTimer);

    //> Sorted packs

    const sortedTimer = new PerformanceTimer('Find badge in sorted packs');

    const sortedPacks = packs.map(pack => pack.split('').sort().join(''));

    let sortedGroupedCommonItemPriorityValue = 0;

    for(let i = 0; i < sortedPacks.length; i += 3) {
        sortedGroupedCommonItemPriorityValue += findCommonItemPriority(sortedPacks[i], sortedPacks[i + 1], sortedPacks[i + 2]);
    }

    sortedTimer.stop();

    printResult(`Part 2 - Sorted Items`, sortedGroupedCommonItemPriorityValue, sortedTimer);

    //> Unique packs

    const uniqueTimer = new PerformanceTimer('Find badge in unique-item packs');

    const uniquePacks = packs.map(pack => [...new Set(pack.split(''))].join(''));

    let uniqueGroupedCommonItemPriorityValue = 0;

    for(let i = 0; i < uniquePacks.length; i += 3) {
        uniqueGroupedCommonItemPriorityValue += findCommonItemPriority(uniquePacks[i], uniquePacks[i + 1], uniquePacks[i + 2]);
    }

    uniqueTimer.stop();

    printResult(`Part 2 - Unique Items`, uniqueGroupedCommonItemPriorityValue, uniqueTimer);
}
