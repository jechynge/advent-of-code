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


function findNeighborOutOfRange(coordinates, sensors) {
    for(let i = 0; i < coordinates.length; i++) {
        const { coordinates: neighbors } = Grid.GetManhattanBoundary(coordinates[i], 1);

        for(let j = 0; j < neighbors.length; j++) {
            const isAnySensorInRange = sensors.some(({sensorCoordinates, distanceToBeacon}) => {
                const distanceToSensor = Grid.GetManhattanDistance(neighbors[j], sensorCoordinates);
                
                return distanceToSensor <= distanceToBeacon;
            });

            if(!isAnySensorInRange) {
                return(neighbors[j]);
            }
        }
    }
}

export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const sensorBoundaries = [];

    // Get the boundaries for each sensor scan
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

        return {
            sensorCoordinates,
            beaconCoordinates,
            distanceToBeacon
        };
    });

    const intersections = [];
    const MAX_SEARCH_RANGE = 4000000;

    // Find where sensor boundaries occur within the search range
    for(let i = 0; i < sensorBoundaries.length; i++) {
        const boundaryA = sensorBoundaries[i];
        for(let j = 0; j < sensorBoundaries.length; j++) {
            if(i === j) continue;

            const boundaryB = sensorBoundaries[j];

            boundaryA.forEach(segmentA => {
                boundaryB.forEach(segmentB => {
                    const intersection = doLinesIntersect(...segmentA, ...segmentB);
    
                    if(intersection 
                        && !intersections.find(seenIntersection => Grid.AreCoordinatesEqual(seenIntersection, intersection))
                        && intersection.every(i => i >= 0 && i <= MAX_SEARCH_RANGE)) {
                        intersections.push(intersection);
                    }
                });
            });
        }
    }

    // Check each neighbor of the intersections to see if it is in range of at least one sensor
    const outOfRangeCoordinate = findNeighborOutOfRange(intersections, sensors);

    const tuningFrequency = outOfRangeCoordinate[0] * MAX_SEARCH_RANGE + outOfRangeCoordinate[1];

    timer.stop();

    printResult(`Part 2 Result`, tuningFrequency, timer, `Coordinate is [${outOfRangeCoordinate.join(',')}]`);
}
