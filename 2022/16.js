import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';


class Volcano {
    constructor(valves, time, startPosition) {
        this.valves = valves;
        this.startPosition = startPosition;

        this.relievedPressure = 0;

        this.timeElapsed = 0;
        this.totalTime = time;

        this.openedValves = new Set();
        this.usefulValveNames = [];

        Object.keys(this.valves).forEach((valveName) => {
            if(this.valves[valveName].flowRate < 1) {
                this.openedValves.add(valveName);
            } else {
                this.usefulValveNames.push(valveName);
            }
        });

        this.costs = this.usefulValveNames.reduce((accum, valveName) => ({
            ...accum,
            [valveName]: {}
        }), { [startPosition]: {} });

        for(let i = 0; i < this.usefulValveNames.length; i++) {
            const to = this.usefulValveNames[i];

            this.costs[startPosition][to] = this.costs[to][startPosition] = this.calculateShortestPathLength(startPosition, to);
        }
    
        for(let i = 0; i < this.usefulValveNames.length; i++) {
            const from = this.usefulValveNames[i];
    
            for(let j = i + 1; j < this.usefulValveNames.length; j++) {
                const to = this.usefulValveNames[j];
    
                this.costs[from][to] = this.costs[to][from] = this.calculateShortestPathLength(from, to);
            }
        }

        this.allPaths = [];
    }

    // Only works for unweighted graphs
    calculateShortestPathLength(fromValveName, toValveName) {
        const visited = {};
        const queue = [{
            valveName: fromValveName,
            depth: 0
        }];

        while(queue.length > 0) {
            const queueItem = queue.shift();

            visited[queueItem.valveName] = true;

            if(queueItem.valveName === toValveName) {
                return queueItem.depth;
            }

            const currentValve = this.valves[queueItem.valveName];

            currentValve.connectedTo.forEach(connectedValveName => {
                if(visited[connectedValveName]) {
                    return;
                }

                queue.push({ valveName: connectedValveName, depth: queueItem.depth + 1});
            });
        }

        return -1;
    }

    calculateAllPaths(currentPath, remainingMinutes) {
        
        const unseenValveNames = this.usefulValveNames.filter((valveName) => currentPath.indexOf(valveName) === -1);

        if(unseenValveNames.length === 0) {
            this.allPaths.push(currentPath);
        }

        const currentPosition = currentPath[currentPath.length - 1];

        for(let valveName of unseenValveNames) {
            const minutesToOpenValve = this.costs[currentPosition][valveName] + 1;
            if(minutesToOpenValve < remainingMinutes) {
                this.calculateAllPaths([...currentPath, valveName], remainingMinutes - minutesToOpenValve);
            } else {
                this.allPaths.push(currentPath);
            }
        }
    }
}

function calculatePathBenefit(path, volcano) {

    let ticks = 0;
    let pressureRelievedPerTick = 0;
    let totalPressureRelieved = 0;

    let currentPosition = volcano.startPosition;

    const tick = (n = 1) => {
        ticks += n;
        totalPressureRelieved += n * pressureRelievedPerTick;
    };

    for(let i = 0; i < path.length; i++) {
        const nextPosition = path[i];
        const minutesToOpenNextValve = volcano.costs[currentPosition][nextPosition] + 1;
        const remainingMinutes = volcano.totalTime - ticks;

        if(minutesToOpenNextValve > remainingMinutes) {
            tick(remainingMinutes);
            break;
        }

        tick(minutesToOpenNextValve);
        pressureRelievedPerTick += volcano.valves[nextPosition].flowRate;
        currentPosition = nextPosition;
    }

    tick(volcano.totalTime - ticks);

    return totalPressureRelieved;
}

////////////
// Part 1 //
////////////


export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const valves = getLinesFromInput(input).reduce((accum, line) => {
        const result = /^Valve (\w{2}) has flow rate=(\d+); tunnels? leads? to valves? (.+)$/.exec(line);

        const [ valveName, flowRateString, connectedToString ] = result.slice(1);

        const connectedTo = connectedToString.split(', ');

        const valveInfo = {
            flowRate: parseInt(flowRateString),
            connectedTo
        };

        return {
            ...accum,
            [valveName]: valveInfo
        }
    }, {});

    const START_POSITION = 'AA';
    const TOTAL_TIME = 30;
    const volcano = new Volcano(valves, TOTAL_TIME, START_POSITION);

    volcano.calculateAllPaths([START_POSITION], TOTAL_TIME);

    const bestPath = volcano.allPaths.reduce((bestPathBenefit, currentPath) => {
        const currentPathBenefit = calculatePathBenefit(currentPath.slice(1), volcano);
        return Math.max(bestPathBenefit, currentPathBenefit);
    }, 0);

    timer.stop();

    printResult(`Part 1 Result`, bestPath, timer);
}


////////////
// Part 2 //
////////////


//#region utils

function combinations(array) {
    return new Array(1 << array.length).fill().map(
      (e1, i) => array.filter((e2, j) => i & 1 << j));
}

function permute(permutation) {
    var length = permutation.length,
        result = [permutation.slice()],
        c = new Array(length).fill(0),
        i = 1, k, p;
  
    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = permutation[i];
            permutation[i] = permutation[k];
            permutation[k] = p;
            ++c[i];
            i = 1;
            result.push(permutation.slice());
        } else {
            c[i] = 0;
            ++i;
        }
    }

    return result;
}

function doArraysIntersect(a, b) {
    for(let i = 0; i < a.length; i++) {
        for(let j = 0; j < b.length; j++) {
            if(a[i] === b[j]) return true;
        }
    }

    return false;
}

export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const valves = getLinesFromInput(input).reduce((accum, line) => {
        const result = /^Valve (\w{2}) has flow rate=(\d+); tunnels? leads? to valves? (.+)$/.exec(line);

        const [ valveName, flowRateString, connectedToString ] = result.slice(1);

        const connectedTo = connectedToString.split(', ');

        const valveInfo = {
            flowRate: parseInt(flowRateString),
            connectedTo
        };

        return {
            ...accum,
            [valveName]: valveInfo
        }
    }, {});

    const START_POSITION = 'AA';
    const TOTAL_TIME = 26;
    const volcano = new Volcano(valves, TOTAL_TIME, START_POSITION);

    const MIN_PATH_LENGTH = Math.floor(volcano.usefulValveNames.length / 2);
    const MAX_PATH_LENGTH = Math.ceil(volcano.usefulValveNames.length / 2);

    console.log(`Generating all path halves`);

    const pathHalves = combinations(volcano.usefulValveNames)
        .filter(pathHalf => MIN_PATH_LENGTH <= pathHalf.length && pathHalf.length <= MAX_PATH_LENGTH);

    const validPathPartitions = [];

    console.log(`Finding all non-overlapping path halves pairs from ${pathHalves.length} paths`);

    for(let i = 0; i < pathHalves.length; i++) {

        if(i % Math.floor(pathHalves.length / 10) === 0) {
            console.log(Math.round(i / pathHalves.length * 100) + '% filtered...');
        }

        const pathA = pathHalves[i];

        for(let j = i + 1; j < pathHalves.length; j++) {
            const pathB = pathHalves[j];

            if(pathA.length + pathB.length !== volcano.usefulValveNames.length) {
                continue;
            }

            if(doArraysIntersect(pathA, pathB)) {
                continue;
            }

            validPathPartitions.push([pathA, pathB]);
        }
    }

    console.log(`Found ${validPathPartitions.length} valid partitions. Testing all permutations`);

    let bestPath = 0;

    for(let i = 0; i < validPathPartitions.length; i++) {

        if(i % Math.floor(validPathPartitions.length / 20) === 0) {
            console.log(Math.round(i / validPathPartitions.length * 100) + '% tested...');
        }

        const [pathA, pathB] = validPathPartitions[i];

        const optimalPathA = permute(pathA).reduce((bestPathBenefit, currentPath) => {
            const benefit = calculatePathBenefit(currentPath, volcano);

            return Math.max(benefit, bestPathBenefit);
        }, 0);

        const optimalPathB = permute(pathB).reduce((bestPathBenefit, currentPath) => {
            const benefit = calculatePathBenefit(currentPath, volcano);

            return Math.max(benefit, bestPathBenefit);
        }, 0);

        bestPath = Math.max(optimalPathA + optimalPathB, bestPath);
    }

    timer.stop();

    printResult(`Part 2 Result`, bestPath, timer);
}
