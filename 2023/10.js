import { GRID_CARDINAL_MOVEMENT_NAMES, GRID_ORTHOGONAL_TRANSFORMS, constructGridFromInput, Grid, GRID_CARDINAL_MOVEMENT, GRID_ORTHOGONAL_MOVEMENT } from '../utils/Grid.js';


const getConnectionsForPipe = (pipe) => {

    const NO_CONNECTIONS = {
        symbol: pipe,
        isLoop: false,
        visited: false,
        up: false,
        right: false,
        down: false,
        left: false
    };

    switch(pipe) {
        case '|':
            return {
                ...NO_CONNECTIONS,
                up: true,
                down: true
            };
        case '-':
            return {
                ...NO_CONNECTIONS,
                left: true,
                right: true
            };
        case 'L':
            return {
                ...NO_CONNECTIONS,
                up: true,
                right: true
            };
        case 'J':
            return {
                ...NO_CONNECTIONS,
                up: true,
                left: true
            };
        case '7':
            return {
                ...NO_CONNECTIONS,
                down: true,
                left: true
            };
        case 'F':
            return {
                ...NO_CONNECTIONS,
                right: true,
                down: true
            };
        case 'S':
            return {
                ...NO_CONNECTIONS,
                up: true,
                right: true,
                down: true,
                left: true
            }
        case '.':
            return {
                ...NO_CONNECTIONS
            };
        default:
            throw new Error(`Unexpected map symbol ${pipe}`);
    }

};

const connectionMap = {
    'up': 'down',
    'down': 'up',
    'right': 'left',
    'left': 'right'
};

const doCellsConnect = (movementDirection, from, to) => {

    return !!from && !!to && from[movementDirection] && to[connectionMap[movementDirection]];

};


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const pipes = constructGridFromInput(input, '', getConnectionsForPipe);

    const startCoordinates = pipes.findCellCoordinates((v) => v.symbol === 'S');

    let currentCoordinates = [ ...startCoordinates ];
    let lastMove = 'start';

    let steps = 0;

    do {

        ++steps;

        const currentCell = pipes.getCell(currentCoordinates);

        const nextMove = GRID_CARDINAL_MOVEMENT_NAMES.find((movementDirection) => {
            if(movementDirection === connectionMap[lastMove] || !currentCell[movementDirection]) {
                return;
            }

            const nextCoordinates = Grid.Transform2DCoordinate(currentCoordinates, GRID_CARDINAL_MOVEMENT[movementDirection]);
            const nextCell = pipes.getCell(nextCoordinates);

            if(!nextCell || !doCellsConnect(movementDirection, currentCell, nextCell)) {
                return;
            }

            return true;
        });

        lastMove = nextMove;
        currentCoordinates = Grid.Transform2DCoordinate(currentCoordinates, GRID_CARDINAL_MOVEMENT[nextMove]);

    } while(!Grid.AreCoordinatesEqual(startCoordinates, currentCoordinates));

    return { answer: steps / 2, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const pipes = constructGridFromInput(input, '', getConnectionsForPipe);

    const startCoordinates = pipes.findCellCoordinates((v) => v.symbol === 'S');

    let currentCoordinates = [ ...startCoordinates ];
    let path = [ ];
    let lastMove = 'start';

    do {

        path.push(currentCoordinates);
        const currentCell = pipes.getCell(currentCoordinates);

        currentCell.isLoop = true;

        const nextMove = GRID_CARDINAL_MOVEMENT_NAMES.find((movementDirection) => {
            if(movementDirection === connectionMap[lastMove] || !currentCell[movementDirection]) {
                return;
            }

            const nextCoordinates = Grid.Transform2DCoordinate(currentCoordinates, GRID_CARDINAL_MOVEMENT[movementDirection]);
            const nextCell = pipes.getCell(nextCoordinates);

            if(!nextCell || !doCellsConnect(movementDirection, currentCell, nextCell)) {
                return;
            }

            return true;
        });

        lastMove = nextMove;
        currentCoordinates = Grid.Transform2DCoordinate(currentCoordinates, GRID_CARDINAL_MOVEMENT[nextMove]);

    } while(!Grid.AreCoordinatesEqual(startCoordinates, currentCoordinates));

    const rotationDirection = Grid.GetPathRotationDirection(path);

    // Ensure that we're traversing the loop clockwise
    if(rotationDirection  === 'counterclockwise') {
        path = path.reverse();
    }

    const nodesToConsider = [ ];

    const maybeConsiderNodes = (...nodes) => {
        for(const node of nodes) {
            const cell = pipes.getCell(node);

            if(cell.isLoop) {
                continue;
            }

            const nodeString = node.join(',');

            if(nodesToConsider.indexOf(nodeString) !== -1) {
                continue;
            }

            nodesToConsider.push(nodeString);
        }
    };

    for(let i = 0; i < path.length; i++) {
        const currentCoordinates = path[ i ];
        const currentCell = pipes.getCell(currentCoordinates);

        const nextCoordinates = path[ (i + 1) % path.length ];
        const nextMoveDireciton = Grid.GetStepDirection(currentCoordinates, nextCoordinates);
        
        switch(currentCell.symbol) {
            case '7':
                if(nextMoveDireciton === 'left') {
                    maybeConsiderNodes(
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.right),
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.up_right),
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.up)
                    );
                }

                break;
            case 'F':
                if(nextMoveDireciton === 'down') {
                    maybeConsiderNodes(
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.left),
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.up_left),
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.up)
                    );
                }

                break;
            case 'J':
                if(nextMoveDireciton === 'up') {
                    maybeConsiderNodes(
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.right),
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.down_right),
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.down)
                    );
                }

                break;
            case 'L':
                if(nextMoveDireciton === 'right') {
                    maybeConsiderNodes(
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.left),
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.down_left),
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.down)
                    );
                }
                break;
            case '-':
                if(nextMoveDireciton === 'left') {
                    maybeConsiderNodes(
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.up)
                    );
                }

                if(nextMoveDireciton === 'right') {
                    maybeConsiderNodes(
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.down)
                    );
                }

                break;
            case '|':
                if(nextMoveDireciton === 'up') {
                    maybeConsiderNodes(
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.right)
                    );
                }

                if(nextMoveDireciton === 'down') {
                    maybeConsiderNodes(
                        Grid.Transform2DCoordinate(currentCoordinates, GRID_ORTHOGONAL_MOVEMENT.left)
                    );
                }

                break;
        }

    }

    do {

        const currentCoordinates = nodesToConsider.pop().split(',').map(c => parseInt(c));
        const currentCell = pipes.getCell(currentCoordinates);

        currentCell.visited = true;

        GRID_ORTHOGONAL_TRANSFORMS.forEach((transform) => {
            const nextCoordinates = Grid.Transform2DCoordinate(currentCoordinates, transform);
            const nextCoordinatesString = nextCoordinates.join(',');
            const nextCell = pipes.getCell(nextCoordinates);

            if(nextCell.isLoop || nextCell.visited || nodesToConsider.indexOf(nextCoordinatesString) !== -1) {
                return;
            }

            nodesToConsider.push(nextCoordinatesString);
        });

    } while(nodesToConsider.length > 0);

    const visitedNodes = pipes.reduce((count, { visited }) => visited ? count + 1 : count, 0);

    return { answer: visitedNodes, extraInfo: undefined };

}
