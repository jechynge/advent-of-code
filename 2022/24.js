import { getLinesFromInput } from '../utils/Input.js';
import Grid, { GRID_CARDINAL_MOVEMENT, GRID_CARDINAL_TRANSFORMS } from '../utils/Grid.js';


////////////
// Part 1 //
////////////


const joinCoords = coordinates => `${coordinates[0]},${coordinates[1]}`;
const splitCoords = coordinateString => coordinateString.split(',').map(i => parseInt(i));

export async function firstPuzzle(input) {

    const layoutInput = getLinesFromInput(input).map(line => line.split(''));

    const width = layoutInput[0].length;
    const height = layoutInput.length;

    const map = new Grid(width, height);
    const blizzards = [];
    const blizzardPositions = [];
    let originCoordinates;
    let destinationCoordinates;

    layoutInput.forEach((row, y) => {
        row.forEach((cell, x) => {
            const coordinates = [x, y];

            switch(cell) {
                case '#':
                    map.setCell(coordinates, '#');
                    break;
                case '.':
                    if(y === 0) originCoordinates = [...coordinates];
                    if(y === height - 1) destinationCoordinates = [...coordinates];
                    break;
                case '^':
                    blizzards.push({
                        coordinates,
                        direction: cell,
                        transform: GRID_CARDINAL_MOVEMENT.north
                    });
                    break;
                case '>':
                    blizzards.push({
                        coordinates,
                        direction: cell,
                        transform: GRID_CARDINAL_MOVEMENT.east
                    });
                    break;
                case 'v':
                    blizzards.push({
                        coordinates,
                        direction: cell,
                        transform: GRID_CARDINAL_MOVEMENT.south
                    });
                    break;
                case '<':
                    blizzards.push({
                        coordinates,
                        direction: cell,
                        transform: GRID_CARDINAL_MOVEMENT.west
                    });
                    break;

            }
        });
    });

    const moveBlizzards = () => {
        blizzards.forEach(blizzard => {
            let nextPosition = Grid.Transform2DCoordinate(blizzard.coordinates, blizzard.transform);

            if(map.getCell(nextPosition) === '#') {
                switch(blizzard.direction) {
                    case '^':
                        nextPosition = [nextPosition[0], height - 2];
                        break;
                    case '>':
                        nextPosition = [1, nextPosition[1]];
                        break;
                    case 'v':
                        nextPosition = [nextPosition[0], 1];
                        break;
                    case '<':
                        nextPosition = [width - 2, nextPosition[1]];
                        break;
                }
            }

            blizzard.coordinates = [...nextPosition];
        });
    }

    const getBlizzardMap = (blizzards, print = false) => {
        const map = new Grid(width, height);
        map.setRange([0, 0], [0, height - 1], '#');
        map.setRange([0, height - 1], [width - 3, height - 1], '#');
        map.setRange([width - 1, height - 1], [width - 1, 0], '#');
        map.setRange([2, 0], [width - 1, 0], '#');

        blizzards.forEach(blizzard => {
            const existingBlizzard = map.getCell(blizzard.coordinates);

            if(!existingBlizzard) {
                map.setCell(blizzard.coordinates, blizzard.direction);
            } else if(Number.isInteger(existingBlizzard)) {
                map.setCell(blizzard.coordinates, existingBlizzard + 1);
            } else {
                map.setCell(blizzard.coordinates, 2);
            }
        });

        if(print) {
            map.print();
        }

        return map;
    }

    const getBlizzardLayoutKey = () => {
        return blizzards.map(blizzard => joinCoords(blizzard.coordinates)).join('|');
    }

    blizzardPositions.push(getBlizzardMap(blizzards));
    const initialBlizzardLayoutKey = getBlizzardLayoutKey();

    while(true) {
        moveBlizzards();

        const blizzardLayoutKey = getBlizzardLayoutKey();

        if(blizzardLayoutKey === initialBlizzardLayoutKey) {
            break;
        }

        blizzardPositions.push(getBlizzardMap(blizzards));
    }

    function findBestPathBFS(originCoordinates, destinationCoordinates, offsetMinutes = 0) {
        const toPossibleMove = (currentCoordinates, elapsedMinutes) => ({
            currentCoordinates: [...currentCoordinates],
            elapsedMinutes,
            estimatedMinutes: Grid.GetManhattanDistance(currentCoordinates, destinationCoordinates) + elapsedMinutes
        })

        const visited = new Set();
        const possibleMoves = [toPossibleMove(originCoordinates, offsetMinutes)];

        const toVisitedKey = (currentCoordinates, elapsedMinutes) => `${joinCoords(currentCoordinates)} @ ${elapsedMinutes % blizzardPositions.length}m`;

        while(possibleMoves.length > 0) {
            const {
                currentCoordinates, 
                elapsedMinutes
            } = possibleMoves.shift();

            // If we've reached our destination, we're done
            if(Grid.AreCoordinatesEqual(currentCoordinates, destinationCoordinates)) {
                return elapsedMinutes;
            }

            const visitedKey = toVisitedKey(currentCoordinates, elapsedMinutes);

            // If there's another path that has reached this cell at the same time in the cycle interval, bail out
            if(visited.has(visitedKey)) {
                continue;
            }

            visited.add(visitedKey);

            const nextBlizzardMap = blizzardPositions[(elapsedMinutes + 1) % blizzardPositions.length];
    
            // Get all possible moves by looking at where the blizzards will move
            [[...currentCoordinates]]
                .concat(GRID_CARDINAL_TRANSFORMS.map(transform => Grid.Transform2DCoordinate(currentCoordinates, transform)))
                .filter((possibleNextCoordinates => 
                    nextBlizzardMap.getCell(possibleNextCoordinates) === undefined &&
                    !visited.has(toVisitedKey(possibleNextCoordinates, elapsedMinutes + 1)))
                ).forEach(nextCoordinates => {
                    const move = toPossibleMove(nextCoordinates, elapsedMinutes + 1);

                    const insertAt = possibleMoves.findIndex((possibleMove) => {
                        return move.estimatedMinutes < possibleMove.estimatedMinutes;
                    });
        
                    // handles either an empty array or if it's not a better move than any currently found
                    if(insertAt === -1) {
                        possibleMoves.push(move);
                    } else {
                        possibleMoves.splice(insertAt, 0, move);
                    }
                });
        }
    }

    function findBestPathDFS() {
        let bestPathLength = Infinity;
        let bestPath = null;

        const visited = new Set();

        function evaluatePath(currentCoordinates, currentPath = []) {
            const visitedKey = `${joinCoords(currentCoordinates)} @ ${currentPath.length % blizzardPositions.length}m`;

            // If there's another path that has reached this cell at the same time in the cycle interval, bail out
            if(visited.has(visitedKey)) {
                return;
            }

            visited.add(visitedKey);

            // If we've found a path already and this one can't beat it even in the ideal case, bail out
            if(Grid.GetManhattanDistance(currentCoordinates, destinationCoordinates) + currentPath.length >= bestPathLength) {
                return;
            }
            
            if(Grid.AreCoordinatesEqual(currentCoordinates, destinationCoordinates)) {
                bestPathLength = currentPath.length;
                bestPath = [...currentPath, [...currentCoordinates]];

                return;
            }

            const nextBlizzardMap = blizzardPositions[(currentPath.length + 1) % blizzardPositions.length];
    
            // Get all possible moves by looking at where the blizzards will move
            const validNextCoordinates = [[...currentCoordinates]]
                .concat(GRID_CARDINAL_TRANSFORMS.map(transform => Grid.Transform2DCoordinate(currentCoordinates, transform)))
                .filter((possibleNextCoordinates => 
                    nextBlizzardMap.getCell(possibleNextCoordinates) === undefined &&
                    Grid.GetManhattanDistance(possibleNextCoordinates, destinationCoordinates) + currentPath.length < bestPathLength)
                );
    
            // this path is a literal dead end
            if(validNextCoordinates.length === 0) {
                return;
            }

            for(const nextCoordinates of validNextCoordinates) {
                evaluatePath(nextCoordinates, [...currentPath, [...currentCoordinates]]);
            }
        }

        evaluatePath(originCoordinates);

        return {
            bestPath,
            bestPathLength
        };
    }

    const there = findBestPathBFS(originCoordinates, destinationCoordinates);

    return { answer: there };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const layoutInput = getLinesFromInput(input).map(line => line.split(''));

    const width = layoutInput[0].length;
    const height = layoutInput.length;

    const map = new Grid(width, height);
    const blizzards = [];
    const blizzardPositions = [];
    let originCoordinates;
    let destinationCoordinates;

    layoutInput.forEach((row, y) => {
        row.forEach((cell, x) => {
            const coordinates = [x, y];

            switch(cell) {
                case '#':
                    map.setCell(coordinates, '#');
                    break;
                case '.':
                    if(y === 0) originCoordinates = [...coordinates];
                    if(y === height - 1) destinationCoordinates = [...coordinates];
                    break;
                case '^':
                    blizzards.push({
                        coordinates,
                        direction: cell,
                        transform: GRID_CARDINAL_MOVEMENT.north
                    });
                    break;
                case '>':
                    blizzards.push({
                        coordinates,
                        direction: cell,
                        transform: GRID_CARDINAL_MOVEMENT.east
                    });
                    break;
                case 'v':
                    blizzards.push({
                        coordinates,
                        direction: cell,
                        transform: GRID_CARDINAL_MOVEMENT.south
                    });
                    break;
                case '<':
                    blizzards.push({
                        coordinates,
                        direction: cell,
                        transform: GRID_CARDINAL_MOVEMENT.west
                    });
                    break;

            }
        });
    });

    const moveBlizzards = () => {
        blizzards.forEach(blizzard => {
            let nextPosition = Grid.Transform2DCoordinate(blizzard.coordinates, blizzard.transform);

            if(map.getCell(nextPosition) === '#') {
                switch(blizzard.direction) {
                    case '^':
                        nextPosition = [nextPosition[0], height - 2];
                        break;
                    case '>':
                        nextPosition = [1, nextPosition[1]];
                        break;
                    case 'v':
                        nextPosition = [nextPosition[0], 1];
                        break;
                    case '<':
                        nextPosition = [width - 2, nextPosition[1]];
                        break;
                }
            }

            blizzard.coordinates = [...nextPosition];
        });
    }

    const getBlizzardMap = (blizzards, print = false) => {
        const map = new Grid(width, height);
        map.setRange([0, 0], [0, height - 1], '#');
        map.setRange([0, height - 1], [width - 3, height - 1], '#');
        map.setRange([width - 1, height - 1], [width - 1, 0], '#');
        map.setRange([2, 0], [width - 1, 0], '#');

        blizzards.forEach(blizzard => {
            const existingBlizzard = map.getCell(blizzard.coordinates);

            if(!existingBlizzard) {
                map.setCell(blizzard.coordinates, blizzard.direction);
            } else if(Number.isInteger(existingBlizzard)) {
                map.setCell(blizzard.coordinates, existingBlizzard + 1);
            } else {
                map.setCell(blizzard.coordinates, 2);
            }
        });

        if(print) {
            map.print();
        }

        return map;
    }

    const getBlizzardLayoutKey = () => {
        return blizzards.map(blizzard => joinCoords(blizzard.coordinates)).join('|');
    }

    blizzardPositions.push(getBlizzardMap(blizzards));
    const initialBlizzardLayoutKey = getBlizzardLayoutKey();

    while(true) {
        moveBlizzards();

        const blizzardLayoutKey = getBlizzardLayoutKey();

        if(blizzardLayoutKey === initialBlizzardLayoutKey) {
            break;
        }

        blizzardPositions.push(getBlizzardMap(blizzards));
    }

    function findBestPathBFS(originCoordinates, destinationCoordinates, offsetMinutes = 0) {
        const toPossibleMove = (currentCoordinates, elapsedMinutes) => ({
            currentCoordinates: [...currentCoordinates],
            elapsedMinutes,
            estimatedMinutes: Grid.GetManhattanDistance(currentCoordinates, destinationCoordinates) + elapsedMinutes
        })

        const visited = new Set();
        const possibleMoves = [toPossibleMove(originCoordinates, offsetMinutes)];

        const toVisitedKey = (currentCoordinates, elapsedMinutes) => `${joinCoords(currentCoordinates)} @ ${elapsedMinutes % blizzardPositions.length}m`;

        while(possibleMoves.length > 0) {
            const {
                currentCoordinates, 
                elapsedMinutes
            } = possibleMoves.shift();

            // If we've reached our destination, we're done
            if(Grid.AreCoordinatesEqual(currentCoordinates, destinationCoordinates)) {
                return elapsedMinutes;
            }

            const visitedKey = toVisitedKey(currentCoordinates, elapsedMinutes);

            // If there's another path that has reached this cell at the same time in the cycle interval, bail out
            if(visited.has(visitedKey)) {
                continue;
            }

            visited.add(visitedKey);

            const nextBlizzardMap = blizzardPositions[(elapsedMinutes + 1) % blizzardPositions.length];
    
            // Get all possible moves by looking at where the blizzards will move
            [[...currentCoordinates]]
                .concat(GRID_CARDINAL_TRANSFORMS.map(transform => Grid.Transform2DCoordinate(currentCoordinates, transform)))
                .filter((possibleNextCoordinates => 
                    nextBlizzardMap.getCell(possibleNextCoordinates) === undefined &&
                    !visited.has(toVisitedKey(possibleNextCoordinates, elapsedMinutes + 1)))
                ).forEach(nextCoordinates => {
                    const move = toPossibleMove(nextCoordinates, elapsedMinutes + 1);

                    const insertAt = possibleMoves.findIndex((possibleMove) => {
                        return move.estimatedMinutes < possibleMove.estimatedMinutes;
                    });
        
                    // handles either an empty array or if it's not a better move than any currently found
                    if(insertAt === -1) {
                        possibleMoves.push(move);
                    } else {
                        possibleMoves.splice(insertAt, 0, move);
                    }
                });
        }
    }

    function findBestPathDFS() {
        let bestPathLength = Infinity;
        let bestPath = null;

        const visited = new Set();

        function evaluatePath(currentCoordinates, currentPath = []) {
            const visitedKey = `${joinCoords(currentCoordinates)} @ ${currentPath.length % blizzardPositions.length}m`;

            // If there's another path that has reached this cell at the same time in the cycle interval, bail out
            if(visited.has(visitedKey)) {
                return;
            }

            visited.add(visitedKey);

            // If we've found a path already and this one can't beat it even in the ideal case, bail out
            if(Grid.GetManhattanDistance(currentCoordinates, destinationCoordinates) + currentPath.length >= bestPathLength) {
                return;
            }
            
            if(Grid.AreCoordinatesEqual(currentCoordinates, destinationCoordinates)) {
                bestPathLength = currentPath.length;
                bestPath = [...currentPath, [...currentCoordinates]];

                return;
            }

            const nextBlizzardMap = blizzardPositions[(currentPath.length + 1) % blizzardPositions.length];
    
            // Get all possible moves by looking at where the blizzards will move
            const validNextCoordinates = [[...currentCoordinates]]
                .concat(GRID_CARDINAL_TRANSFORMS.map(transform => Grid.Transform2DCoordinate(currentCoordinates, transform)))
                .filter((possibleNextCoordinates => 
                    nextBlizzardMap.getCell(possibleNextCoordinates) === undefined &&
                    Grid.GetManhattanDistance(possibleNextCoordinates, destinationCoordinates) + currentPath.length < bestPathLength)
                );
    
            // this path is a literal dead end
            if(validNextCoordinates.length === 0) {
                return;
            }

            for(const nextCoordinates of validNextCoordinates) {
                evaluatePath(nextCoordinates, [...currentPath, [...currentCoordinates]]);
            }
        }

        evaluatePath(originCoordinates);

        return {
            bestPath,
            bestPathLength
        };
    }

    // const {bestPath, bestPathLength} = findBestPathDFS();
    const there = findBestPathBFS(originCoordinates, destinationCoordinates);
    const back = findBestPathBFS(destinationCoordinates, originCoordinates, there);
    const thereAgain = findBestPathBFS(originCoordinates, destinationCoordinates, back);

    return { answer: thereAgain };
    
}
