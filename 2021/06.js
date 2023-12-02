import Grid from '../utils/Grid.js';


const GENERATION_CYCLE_TIME = 7;
const FIRST_GENERATION_CYCLE_TIME = GENERATION_CYCLE_TIME + 2;

////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const TOTAL_TIME = 80;

    const fishArray = input.split(',').map(counter => [TOTAL_TIME, parseInt(counter) + 1]);

    const memo = new Grid(TOTAL_TIME, FIRST_GENERATION_CYCLE_TIME, null, {
        baseOne: true
    });

    let fishCount = 0;

    const generateFish = ([initialTimeRemaining, counter]) => {
        let generatedFish = [];
        let remainingTime = initialTimeRemaining - counter;
    
        while(remainingTime > -1) {
            generatedFish.push([remainingTime, FIRST_GENERATION_CYCLE_TIME]);
    
            remainingTime -= GENERATION_CYCLE_TIME;
        }
    
        return generatedFish;
    }

    while(fishArray.length > 0) {
        const fish = fishArray.shift();
        fishCount++;

        const memoFish = memo.getCell(fish);
        const newFish =  memoFish ?? generateFish(fish);

        fishArray.push(...newFish);

        if(!memoFish) {
            memo.setCell(fish, newFish);
        }
    }

    return { answer: fishCount };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const TOTAL_TIME = 256;

    const factorArray = new Array(TOTAL_TIME + 1).fill(0);

    const generateFish = (currentRemainingTime, counter) => {
        let generatedFish = [];
        let remainingTime = currentRemainingTime - counter;
    
        while(remainingTime > -1) {
            generatedFish.push(TOTAL_TIME - remainingTime);
    
            remainingTime -= GENERATION_CYCLE_TIME;
        }
    
        return generatedFish;
    }

    const initialFish = input.split(',').map(counter => parseInt(counter) + 1);
    
    initialFish.forEach(counter => {
        generateFish(TOTAL_TIME, counter).forEach(generatedAt => {
            factorArray[generatedAt]++
        });
    });

    for(let i = 0; i < factorArray.length; i++) {
        const factor = factorArray[i];

        if(factor === 0) {
            continue;
        }

        const remainingTime = TOTAL_TIME - i;

        const generatedAtStep = generateFish(remainingTime, FIRST_GENERATION_CYCLE_TIME);

        generatedAtStep.forEach((generatedAt) => {
            factorArray[generatedAt] += factor;
        });
    }

    const generatedFishCount = factorArray.reduce((count, generated) => count + generated, initialFish.length);

    return { answer: generatedFishCount };

}
