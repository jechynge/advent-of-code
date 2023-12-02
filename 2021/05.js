import { getLinesFromInput } from '../utils/Input.js';
import Grid from '../utils/Grid.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const ventCoordinates = getLinesFromInput(input).map(line => line.split(' -> ').map(Grid.ParseCoordinateString));

    const boundaries = Grid.CalculateGridSize(ventCoordinates.flat());

    const map = new Grid(boundaries.width, boundaries.height, 0, { offsetX: boundaries.offsetX, offsetY: boundaries.offsetY });

    for(let i = 0; i < ventCoordinates.length; i++) {
        const [from, to] = ventCoordinates[i];

        if(from[0] === to[0] || from[1] === to[1]) {
            map.setRange(from, to, value => ++value);
        }
    }

    const overlapCoordinates = map.reduce((count, value) => value > 1 ? ++count : count, 0);

    return { answer: overlapCoordinates };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const ventCoordinates = getLinesFromInput(input).map(line => line.split(' -> ').map(Grid.ParseCoordinateString));

    const boundaries = Grid.CalculateGridSize(ventCoordinates.flat());

    const map = new Grid(boundaries.width, boundaries.height, 0, { offsetX: boundaries.offsetX, offsetY: boundaries.offsetY });

    for(let i = 0; i < ventCoordinates.length; i++) {
        const [from, to] = ventCoordinates[i];

        map.setLine(from, to, value => ++value);
    }

    const overlapCoordinates = map.reduce((count, value) => value > 1 ? ++count : count, 0);

    return { answer: overlapCoordinates };

}
