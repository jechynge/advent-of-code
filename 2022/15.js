import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';
import Grid from '../utils/Grid.js';


////////////
// Part 1 //
////////////


export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const boundaries = {
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity,
        left: Infinity
    }

    const sensors = getLinesFromInput(input).map(line => {
        const [sensorX, sensorY, beaconX, beaconY] = /^Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/.exec(line).slice(1).map(i => parseInt(i));

        const sensorCoordinates = [sensorX, sensorY];
        const beaconCoordinates = [beaconX, beaconY];
        const distanceToBeacon = Grid.GetManhattanDistance(sensorCoordinates, beaconCoordinates);

        const { boundaries: sensorBoundaries } = Grid.GetManhattanBoundary(sensorCoordinates, distanceToBeacon);

        boundaries.top = Math.min(sensorBoundaries[0], boundaries.top);
        boundaries.right = Math.max(sensorBoundaries[1], boundaries.right);
        boundaries.bottom = Math.max(sensorBoundaries[2], boundaries.bottom);
        boundaries.left = Math.min(sensorBoundaries[3], boundaries.left);

        return {
            sensorCoordinates,
            beaconCoordinates,
            distanceToBeacon
        };
    });

    let rowLeftBound = Infinity;
    let rowRightBound = -Infinity;

    const ROW = 2000000;

    for(let i = 0; i < sensors.length; i++) {
        const { sensorCoordinates, distanceToBeacon } = sensors[i];

        const { boundaries } = Grid.GetManhattanBoundary(sensorCoordinates, distanceToBeacon);

        const [ top, right, bottom, left ] = boundaries;

        if(top > ROW || bottom < ROW) {
            continue;
        }

        const startX = left + Math.abs(sensorCoordinates[1] - ROW);
        const endX = right - Math.abs(sensorCoordinates[1] - ROW);

        rowLeftBound = Math.min(startX, rowLeftBound);
        rowRightBound = Math.max(endX, rowRightBound);
    }

    const checkedPositions = rowRightBound - rowLeftBound;

    timer.stop();

    printResult(`Part 1 Result`, checkedPositions, timer);
}


////////////
// Part 2 //
////////////

// ####B######################
export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    // ...todo

    timer.stop();

    printResult(`Part 2 Result`, null, timer);
}
