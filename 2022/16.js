import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


class Volcano {
    constructor(valves, time) {
        this.valves = valves;

        const zeroFlowValveNames = Object.keys(this.valves).filter((valveName) => {
            return this.valves[valveName].flowRate < 1;
        });

        this.openedValves = new Set(zeroFlowValveNames);

        this.relievedPressure = 0;
        this.timeElapsed = 0;
        this.totalTime = time;
    }

    areAllValvesOpen() {
        return this.openedValves.size === Object.keys(this.valves).length;
    }

    isValveOpen(valveName) {
        return this.openedValves.has(valveName);
    }

    openValve(valveName) {
        if(this.isValveOpen(valveName)) {
            throw new Error(`Valve ${valveName} is already open!`);
        }

        this.openedValves.add(valveName);
    }

    calculateDistanceToClosedValves(valveNamesToConsider, valveNamesSeen, steps = 0, isNext = '') {

        if(this.areAllValvesOpen()) {
            return null;
        }

        let possibleMoves = [];
        const next = new Set();
        valveNamesSeen = valveNamesSeen ?? new Set();

        const timeToOpen = steps + 1;

        // For all valves this distance away...
        for(let i = 0; i < valveNamesToConsider.length; i++) {
            const valveName = valveNamesToConsider[i];

            // Record that we've seen this valve now
            valveNamesSeen.add(valveName);

            const valve = this.valves[valveName];
            
            // For each valve this valve is connected to, if we haven't seen it yet, add it to the next batch to consider
            valve.connectedTo.forEach((connectedValveName) => {
                if(!valveNamesSeen.has(connectedValveName)) {
                    next.add(connectedValveName);
                }
            });

            // For the valve we're at, if its already open, skip it as a possible move
            if(this.isValveOpen(valveName) || isNext === valveName) {
                continue;
            }

            let nextStep;

            if(!isNext) {
                nextStep = this.calculateDistanceToClosedValves([valveName], new Set(), steps, valveName);
            }

            possibleMoves.push({
                benefit: valve.flowRate / (timeToOpen * timeToOpen) + (nextStep?.benefit ?? 0),
                timeToOpen,
                valveName,
                steps,
                likelyNextMove: nextStep?.valveName
            });
        }


        if(next.size > 0 && timeToOpen + this.timeElapsed < this.totalTime) {
            possibleMoves = possibleMoves.concat(this.calculateDistanceToClosedValves([...next], valveNamesSeen, steps + 1, isNext)).filter(m => !!m);
        }

        // if(steps > 0) {
        //     return possibleMoves;
        // }

        if(possibleMoves.length === 0) {
            return null;
        } else if(possibleMoves.length === 1) {
            return possibleMoves[0];
        } else {
            return possibleMoves.slice(1).reduce((bestMove, possibleMove) => {
                return possibleMove.benefit > bestMove.benefit ? possibleMove : bestMove;
            }, possibleMoves[0]);
        }
    }

    resolve() {
        while(this.timeElapsed < this.totalTime) {
            this.tick();
        }
    }

    tick(ticks = 1) {
        for(let i = 0; i < ticks; i++) {
            const pressureRelievedThisTick = [...this.openedValves].reduce((accum, valveName) => accum + this.valves[valveName].flowRate, 0);

            const openValves = [...this.openedValves].filter((valveName) => this.valves[valveName].flowRate > 0);

            console.log(`\n== Minute ${this.timeElapsed+1} ==`);
            if(openValves.length === 0) {
                console.log('No valves are open.');
            } else {
                console.log(`Valves ${openValves.join(', ')} are open, relieving [${pressureRelievedThisTick}] pressure.`);
            }

            console.log(`Relieved ${this.relievedPressure} pressure so far`);

            this.relievedPressure += pressureRelievedThisTick;
            this.timeElapsed++;
        }
    }
}

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

    let position = 'AA';
    const volcano = new Volcano(valves, 30);

    while(volcano.timeElapsed < volcano.totalTime) {
        const nextMove = volcano.calculateDistanceToClosedValves([position]);

        if(!nextMove) {
            break;
        }

        position = nextMove.valveName;

        volcano.tick(nextMove.timeToOpen);
        volcano.openValve(position);
    }

    volcano.resolve();

    timer.stop();

    printResult(`Part 1 Result`, volcano.relievedPressure, timer);
}


////////////
// Part 2 //
////////////


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

    const volcano = new Volcano(valves, 26);
    const startPosition = 'AA';

    let myMove = volcano.calculateDistanceToClosedValves([startPosition]);
    let elephantMove = volcano.calculateDistanceToClosedValves([startPosition], new Set([myMove.valveName]));

    let myRemainingSteps = myMove.steps;
    let elephantRemainingSteps = elephantMove.steps;

    let myPosition = 'AA';
    let elephantPosition = 'AA';

    while(!volcano.areAllValvesOpen() && volcano.timeElapsed < volcano.totalTime) {
        volcano.tick();

        if(!myMove && !elephantMove) {
            const ifIMoveFirst = volcano.calculateDistanceToClosedValves([myPosition]);
            const ifElephantMovesSecond = volcano.calculateDistanceToClosedValves([elephantPosition], new Set([ifIMoveFirst?.valveName]));

            const ifElephantMovesFirst = volcano.calculateDistanceToClosedValves([elephantPosition]);
            const ifIMoveSecond = volcano.calculateDistanceToClosedValves([myPosition], new Set([ifElephantMovesFirst?.valveName]));

            if(ifIMoveFirst?.benefit ?? 0 + ifElephantMovesSecond?.benefit ?? 0 > ifIMoveSecond?.benefit ?? 0 + ifElephantMovesFirst?.benefit ?? 0) {
                myMove = ifIMoveFirst;
                elephantMove = ifElephantMovesSecond;
            } else {
                myMove = ifIMoveSecond;
                elephantMove = ifElephantMovesFirst;
            }

            myRemainingSteps = myMove?.steps;
            elephantRemainingSteps = elephantMove?.steps;
        }

        if(!myMove) {
            const avoid = elephantMove ? [elephantMove.valveName] : [];
            const myNextMove = volcano.calculateDistanceToClosedValves([myPosition], new Set(avoid));

            if(myNextMove) {
                myMove = myNextMove;
                myRemainingSteps = myMove.steps;
            }
        }

        if(!elephantMove) {
            const avoid = myMove ? [myMove.valveName] : [];
            const elephantNextMove = volcano.calculateDistanceToClosedValves([elephantPosition], new Set(avoid));

            if(elephantNextMove) {
                elephantMove = elephantNextMove;
                elephantRemainingSteps = elephantMove.steps;
            }
        }
        
        if(myMove) {
            if(myRemainingSteps === 0) {
                console.log(`I'm opening valve ${myMove.valveName}`);
                volcano.openValve(myMove.valveName);
                myPosition = myMove.valveName;
                myMove = null;
            } else {
                console.log(`I have ${myRemainingSteps} steps to go to reach valve ${myMove.valveName}`);
                myRemainingSteps--;
            }
        }

        if(elephantMove) {
            if(elephantRemainingSteps === 0) {
                console.log(`Elephant is opening valve ${elephantMove.valveName}`);
                volcano.openValve(elephantMove.valveName);
                elephantPosition = elephantMove.valveName;
                elephantMove = null;
            } else {
                console.log(`Elephant has ${elephantRemainingSteps} steps to go to reach valve ${elephantMove.valveName}`);
                elephantRemainingSteps--;
            }
        }
    }

    volcano.resolve();

    timer.stop();

    printResult(`Part 2 Result`, volcano.relievedPressure, timer);
}
