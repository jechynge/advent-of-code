import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


const getCoordinateDelta = (c1, c2) => ({
    deltaX: c1.x - c2.x,
    deltaY: c1.y - c2.y
});

class Rope {
    constructor(knotCount = 2) {
        this.knotPositions = new Array(knotCount).fill(null).map(() => ({
            x: 0,
            y: 0
        }));

        // The tail always starts at (0,0)
        this.tailPositions = [[ 0, 0 ]];
    }

    stepHeadInDirection(direction) {
        switch(direction) {
            case 'U':
                this.knotPositions[0].y++;
                break;
            case 'D':
                this.knotPositions[0].y--;
                break;
            case 'L':
                this.knotPositions[0].x--;
                break;
            case 'R':
                this.knotPositions[0].x++;
                break;
            default:
                throw new Error(`Unexpected direction [${direction}] - must be one of [ "U" | "D" | "L" | "R" ]`);
        }

        this.checkKnotDeltas();
    }

    checkKnotDeltas() {
        for(let i = 0; i < this.knotPositions.length; i++) {

            // If this is the tail, record its position and bail
            if(i === this.knotPositions.length - 1) {
                this.tailPositions.push([ this.knotPositions[i].x, this.knotPositions[i].y ]);

                break;
            }

            const head = this.knotPositions[i];
            const tail = this.knotPositions[i + 1];

            const { deltaX, deltaY } = getCoordinateDelta(head, tail);
            
            if(Math.abs(deltaX) > 1) {
                this.moveKnot(tail, deltaX / 2, Math.abs(deltaY) / (deltaY || 1));
            } else if(Math.abs(deltaY) > 1) {
                this.moveKnot(tail, Math.abs(deltaX) / (deltaX || 1), deltaY / 2);
            }
        }
    }

    moveKnot(knot, deltaX, deltaY) {
        knot.x += deltaX;
        knot.y += deltaY;
    }

    getUniqueTailPositionCount() {
        return [...new Set(this.tailPositions.map((position) => position.join(',')))].length;
    }
}

export async function firstPuzzle(input) {

    const moves = getLinesFromInput(input);

    const rope = new Rope();

    moves.forEach((move) => {
        const [ direction, steps ] = move.split(' ').map((x, i) => i === 0 ? x : parseInt(x));

        for(let i = 0; i < steps; i++) {
            rope.stepHeadInDirection(direction);
        }
    });

    return { answer: rope.getUniqueTailPositionCount() };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const moves = getLinesFromInput(input);

    const rope = new Rope(10);

    moves.forEach((move) => {
        const [ direction, steps ] = move.split(' ').map((x, i) => i === 0 ? x : parseInt(x));

        for(let i = 0; i < steps; i++) {
            rope.stepHeadInDirection(direction);
        }
    });

    return { answer: rope.getUniqueTailPositionCount() };

}
