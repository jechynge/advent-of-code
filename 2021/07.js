////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const positions = input.split(',').map(position => parseInt(position)).sort((a, b) => a - b);

    const modes = [Math.floor(positions.length / 2)];

    if(positions.length % 2 === 0) {
        modes.push(Math.ceil(positions.length / 2));
    }

    const calculateMoveToIndex = (positions, targetPosition) => {
        return positions.reduce((totalCost, position) => {
            return Math.abs(position - targetPosition) + totalCost;
        }, 0);
    };

    const costs = modes.map(modeIndex => calculateMoveToIndex(positions, positions[modeIndex]));

    const lowestCost = Math.min(...costs);

    return { answer: lowestCost };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const positions = input.split(',').map(position => parseInt(position)).sort((a, b) => a - b);

    const average = positions.reduce((sum, position) => sum + position, 0) / positions.length;

    const averageIndices = [Math.ceil(average), Math.floor(average)];

    const sumInts = x => {
        return x * ( x + 1 ) / 2;
    }
    
    const calculateMoveToIndex = (positions, targetPosition) => {
        return positions.reduce((totalCost, position) => {
            return sumInts(Math.abs(position - targetPosition)) + totalCost;
        }, 0);
    }

    const costs = averageIndices.map(averageIndex => calculateMoveToIndex(positions, averageIndex));

    const lowestCost = Math.min(...costs);

    return { answer: lowestCost };

}
