import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';
import Grid from '../utils/Grid.js';
import { doLinesIntersect } from '../utils/Lines.js';


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


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const sensorBoundaries = [];

    const sensors = getLinesFromInput(input).map(line => {
        const [sensorX, sensorY, beaconX, beaconY] = /^Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/.exec(line).slice(1).map(i => parseInt(i));

        const sensorCoordinates = [sensorX, sensorY];
        const beaconCoordinates = [beaconX, beaconY];
        const distanceToBeacon = Grid.GetManhattanDistance(sensorCoordinates, beaconCoordinates);

        const { coordinates: boundaryCoordinates } = Grid.GetManhattanBoundary(sensorCoordinates, distanceToBeacon);

        const topRight = [[...boundaryCoordinates[0]], [...boundaryCoordinates[1]]];
        const bottomRight = [[...boundaryCoordinates[1]], [...boundaryCoordinates[2]]];
        const bottomLeft = [[...boundaryCoordinates[2]], [...boundaryCoordinates[3]]];
        const topLeft = [[...boundaryCoordinates[3]], [...boundaryCoordinates[0]]];

        sensorBoundaries.push([topRight, bottomRight, bottomLeft, topLeft]);

        // boundaries.top = Math.min(sensorBoundaries[0], boundaries.top);
        // boundaries.right = Math.max(sensorBoundaries[1], boundaries.right);
        // boundaries.bottom = Math.max(sensorBoundaries[2], boundaries.bottom);
        // boundaries.left = Math.min(sensorBoundaries[3], boundaries.left);

        return {
            sensorCoordinates,
            beaconCoordinates,
            distanceToBeacon
        };
    });

    const intersections = [];

    for(let i = 0; i < sensorBoundaries.length; i++) {
        let boundaryA = sensorBoundaries[i];
        let boundaryB = sensorBoundaries[i + 1 === sensorBoundaries.length ? 0 : i + 1];

        boundaryA.forEach(segmentA => {
            boundaryB.forEach(segmentB => {
                const intersection = doLinesIntersect(...segmentA, ...segmentB);

                if(intersection && !intersections.find(seenIntersection => Grid.AreCoordinatesEqual(seenIntersection, intersection))) {
                    intersections.push(intersection);
                }
            });
        });
    }

    for(let i = 0; i < intersections.length; i++) {
        const { coordinates: neighbors } = Grid.GetManhattanBoundary(intersections[i], 1);

        for(let j = 0; j < neighbors.length; j++) {
            if(sensors.find(({sensorCoordinates, distanceToBeacon}) => distanceToBeacon < Grid.GetManhattanDistance(neighbors[j], sensorCoordinates))) {
                console.log('found!', neighbors[j]);
            }
        }
    }

    timer.stop();

    printResult(`Part 2 Result`, intersections.length, timer);
}
