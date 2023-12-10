import { getLinesFromInput, parseSpacedDataFromLine } from '../utils/Input.js';
import _ from 'lodash';


const calculateDistance = (totalTime, buttonHeldFor) => {
    return (totalTime - buttonHeldFor) * buttonHeldFor;
}


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const [ timesString, distancesString ] = getLinesFromInput(input);

    const times = parseSpacedDataFromLine(timesString.substring('time:'.length)).map((time) => parseInt(time));
    const distances = parseSpacedDataFromLine(distancesString.substring('distance:'.length)).map((distance) => parseInt(distance));

    const races = _.zip(times, distances);

    const product = races.reduce((product, [ totalTime, bestDistance ], raceNumber) => {
        const bestDistanceAtTime = Math.ceil(totalTime / 2);

        for(let i = 1; true; i++) {
            if(calculateDistance(totalTime, bestDistanceAtTime + i) <= bestDistance) {
                const betterTimes = 2 * i + (totalTime % 2 === 0 ? -1 : 0);

                console.log(`Race number ${raceNumber} has ${betterTimes} better possibilities`);

                return product * betterTimes;
            }
        }
    }, 1);

    return { answer: product, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const [ timesString, distancesString ] = getLinesFromInput(input);

    const totalTime = parseInt(parseSpacedDataFromLine(timesString.substring('time:'.length)).join(''));
    const bestDistance = parseInt(parseSpacedDataFromLine(distancesString.substring('distance:'.length)).join(''));

    const bestDistanceAtTime = Math.ceil(totalTime / 2);

    for(let i = 1; true; i++) {
        if(calculateDistance(totalTime, bestDistanceAtTime + i) <= bestDistance) {
            const betterTimes = 2 * i + (totalTime % 2 === 0 ? -1 : 0);

            return { answer: betterTimes, extraInfo: undefined };
        }
    }

}
