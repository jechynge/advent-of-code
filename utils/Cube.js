export const CUBE_CARDINAL_TRANSFORMS = [
    [0,-1,0],
    [0, 1,0],
    [ 1,0,0],
    [-1,0,0],
    [0,0, 1],
    [0,0,-1]
];

export const CUBE_CARDINAL_MOVEMENT = {
    X_POS: CUBE_CARDINAL_TRANSFORMS[ 2 ],
    X_NEG: CUBE_CARDINAL_TRANSFORMS[ 3 ],
    Y_POS: CUBE_CARDINAL_TRANSFORMS[ 1 ],
    Y_NEG: CUBE_CARDINAL_TRANSFORMS[ 0 ],
    Z_POS: CUBE_CARDINAL_TRANSFORMS[ 4 ],
    Z_NEG: CUBE_CARDINAL_TRANSFORMS[ 5 ]
};

export default class Cube {
    constructor(width, height, depth, options) {
        this.width = width + (options?.baseOne ? 1 : 0);
        this.height = height + (options?.baseOne ? 1 : 0);
        this.depth = depth + (options?.baseOne ? 1 : 0);

        this.offsetX = options?.offsetX ?? 0;
        this.offsetY = options?.offsetY ?? 0;
        this.offsetZ = options?.offsetZ ?? 0;

        this.initialValue = options?.initialValue;

        this.cube = new Array(this.depth).fill(undefined)
            .map(() => new Array(this.height).fill(undefined)
            .map(() => new Array(this.width).fill(this.initialValue)));
    }

    validDimensions() {
        return `[${this.offsetX} <= X <= ${this.width - 1 + this.offsetX}] | [${this.offsetY} <= Y <= ${this.height - 1 + this.offsetY}] | [${this.offsetZ} <= Z <= ${this.depth - 1 + this.offsetZ}]`;
    }

    getOffsetCoordinates(coordinates) {
        return Cube.Transform3DCoordinate(coordinates, [-this.offsetX, -this.offsetY, -this.offsetZ]);
    }

    isValidCell(coordinates) {
        const [x, y, z] = this.getOffsetCoordinates(coordinates);

        return x >= 0 && x < this.width && y >= 0 && y < this.height && z >= 0 && z < this.depth;
    }

    getCell(coordinates) {
        if(!this.isValidCell(coordinates)) {
            return null;
        }

        const [x, y, z] = this.getOffsetCoordinates(coordinates);

        return this.cube[z][y][x];
    }

    // It is not recommended to call this directly!
    _setCell(coordinates, value, overwriteNonInitialValue = true) {
        const [x, y, z] = this.getOffsetCoordinates(coordinates);

        if(overwriteNonInitialValue || this.cube[z][y][x] === this.initialValue) {
            this.cube[z][y][x] = value;
        }
    }

    setCell(coordinates, value, overwriteNonInitialValue = true) {
        if(!this.isValidCell(coordinates)) {
            throw new Error(`Cell coordinates [${coordinates.join(',')}] are invalid! ${this.validDimensions()}`);
        }

        this._setCell(coordinates, value, overwriteNonInitialValue);
    }

    // Range coordinates are inclusive!
    setRange(from, to, value, overwriteNonInitialValue = true) {
        if(!this.isValidCell(from)) {
            throw new Error(`"from" coordinates [${from.join(', ')}] are invalid! ${this.validDimensions()}`);
        }

        if(!this.isValidCell(to)) {
            throw new Error(`"to" coordinates [${to.join(', ')}] are invalid! ${this.validDimensions()}`);
        }

        const startX = Math.min(from[0], to[0]);
        const startY = Math.min(from[1], to[1]);
        const startZ = Math.min(from[2], to[2]);
        const endX = Math.max(from[0], to[0]);
        const endY = Math.max(from[1], to[1]);
        const endZ = Math.max(from[2], to[2]);

        for(let x = startX; x <= endX; x++) {
            for(let y = startY; y <= endY; y++) {
                for(let z = startZ; z <= endZ; z++) {
                    this._setCell([x, y, z], value, overwriteNonInitialValue);
                }
            }
        }
    }

    
    isValidMove(coordinates, transform = [0,0,0]) {
        return coordinates.map(coordinate => Cube.Transform3DCoordinate(coordinate, transform)).every(nextPosition => {
            return this.isValidCell(nextPosition) && this.getCell(nextPosition) === this.initialValue;
        });
    }

    findShortestDistance(from, to) {
        const Step = (currentSteps, possibleRemainingSteps, previousCoordinates) => ({
            currentSteps,
            possibleRemainingSteps,
            estimatedSteps: currentSteps + possibleRemainingSteps,
            previousCoordinates
        });

        const cellDetails = new Cube(this.width, this.height, this.depth, {
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            offsetZ: this.offsetZ
        });

        // Stays sorted in ascending order based on estimatedSteps
        const uncheckedCoordinates = [from];
        const checkedCoordinates = [];

        let currentCoordinates = uncheckedCoordinates.shift();

        cellDetails.setCell(currentCoordinates, Step(0,0,null));

        while(currentCoordinates && !Cube.AreCoordinatesEqual(currentCoordinates, to)) {
            const currentStep = cellDetails.getCell(currentCoordinates);

            const nextSteps = CUBE_CARDINAL_TRANSFORMS.map(transform => Cube.Transform3DCoordinate(currentCoordinates, transform)).map(maybeNextCoordinates => {

                if(this.getCell(maybeNextCoordinates) !== this.initialValue) {
                    return null;
                }

                const estimatedCost = Cube.GetManhattanDistance(maybeNextCoordinates, to);

                return {
                    coordinates: maybeNextCoordinates,
                    estimatedCost
                };
            }).filter(nextStep => !!nextStep);

            for(let i = 0; i < nextSteps.length; i++) {

                const nextStep = nextSteps[i];
                const step = Step(currentStep.currentSteps + 1, nextStep.estimatedCost, currentCoordinates);

                if(Cube.AreCoordinatesEqual(nextStep.coordinates, to)) {
                    cellDetails.setCell(nextStep.coordinates, step);
                    uncheckedCoordinates.unshift(nextStep.coordinates);
                    break;
                }

                const existingUncheckedIndex = uncheckedCoordinates.findIndex(uncheckedCoordinates => Cube.AreCoordinatesEqual(uncheckedCoordinates, nextStep.coordinates));
                
                // See if we're already planning on checking this possible step from a better position
                if(existingUncheckedIndex > -1) {
                    const waitingToCheckStep = cellDetails.getCell(uncheckedCoordinates[existingUncheckedIndex]);

                    // We've found this possible step from a better position - skip it
                    if(waitingToCheckStep.estimatedSteps <= step.estimatedSteps) {
                        continue;
                    }
                }

                const existingCheckedIndex = checkedCoordinates.findIndex(checkedCoordinates => Cube.AreCoordinatesEqual(checkedCoordinates, nextStep.coordinates));

                // See if we've already visited this step from a shorter path
                if(existingCheckedIndex > -1) {
                    const checkedStep = cellDetails.getCell(checkedCoordinates[existingCheckedIndex]);

                    // We've already visited this step from a shorter path - skip it
                    if(checkedStep.estimatedSteps <= step.estimatedSteps) {
                        continue;
                    }
                }

                cellDetails.setCell(nextStep.coordinates, step);

                const insertAt = uncheckedCoordinates.findIndex(uncheckedCoordinates => {
                    const uncheckedCoordinateStep = cellDetails.getCell(uncheckedCoordinates);

                    return step.estimatedSteps < uncheckedCoordinateStep.estimatedSteps;
                });

                if(insertAt === -1) {
                    uncheckedCoordinates.push(nextStep.coordinates);
                } else {
                    uncheckedCoordinates.splice(insertAt, 0, nextStep.coordinates)
                }
            }

            checkedCoordinates.push(currentCoordinates);
            currentCoordinates = uncheckedCoordinates.shift();
        }

        const destination = cellDetails.getCell(to);

        return destination?.currentSteps ?? -1;
    }

    static GetManhattanDistance(from, to) {
        return Math.abs(from[0] - to[0]) + Math.abs(from[1] - to[1] + Math.abs(from[2] - to[2]));
    }

    static AreCoordinatesEqual(coord1, coord2) {
        return coord1[0] === coord2[0] && coord1[1] === coord2[1] && coord1[2] === coord2[2];
    }

    static Transform3DCoordinate(coordinate, ...transforms) {
        return transforms.reduce((coordinate, transform) => {
            return [coordinate[0] + transform[0], coordinate[1] + transform[1], coordinate[2] + transform[2]];
        }, coordinate);
    }

    static GetShapeCoordinates(shapeOrigin, shapeLayout, ...transforms) {
        return shapeLayout.reduce((cubes, cube, z) => {
            const cubeCoordinates = cube.reduce((coordinates, row, y) => {
                const rowCoordinates = row.map(x => Cube.Transform3DCoordinate(shapeOrigin, [x,y,z], ...transforms));
                return [...coordinates, ...rowCoordinates];
            }, []);
            return [...cubes, ...cubeCoordinates];
        }, []);
    }
}