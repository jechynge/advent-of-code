import { getLinesFromInput } from '../utils/Input.js';
import Range from '../utils/Range.js';
import _ from 'lodash';

const MAP_NAMES = [
    'seed-to-soil',
    'soil-to-fertilizer',
    'fertilizer-to-water',
    'water-to-light',
    'light-to-temperature',
    'temperature-to-humidity',
    'humidity-to-location'
];

const SHORTCUT = 'seed-to-location';

const createSeedMap = () => {
    return MAP_NAMES.reduce(( seedMap, mapName ) => {
        return {
            ...seedMap,
            [mapName]: []
        };
    }, { });
};


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const lines = getLinesFromInput(input);

    const seedNumbers = lines.splice(0, 2)[0].split(': ')[1].split(' ').map((num) => parseInt(num));

    const seedMap = createSeedMap();

    let currentMapName;

    for( const line of lines ) {

        if(line.trim() === '') {

            continue;

        } else if(/\d/.test(line[0])) {

            const [ destRangeStart, sourceRangeStart, rangeLength ] = line.split(' ').map((num) => parseInt(num));

            const additive = destRangeStart - sourceRangeStart;

            const sourceRangeEnd = sourceRangeStart + rangeLength - 1;

            seedMap[currentMapName].push([ sourceRangeStart, sourceRangeEnd, additive ]);

        } else {

            currentMapName = MAP_NAMES.find((mapName) => line.indexOf(mapName) === 0);

        }

    }

    const minimumLocationNumber = seedNumbers.reduce((minimumLocationNumber, seedNumber) => {

        const locationNumber = MAP_NAMES.reduce((num, mapName) => {
            
            const [ , , additive ] = seedMap[mapName].find(([ sourceRangeStart, sourceRangeEnd, ]) => sourceRangeStart <= num && num <= sourceRangeEnd) ?? [ null, null, 0 ];

            return num + additive;

        }, seedNumber);

        return Math.min(locationNumber, minimumLocationNumber);

    }, Infinity);

    return { answer: minimumLocationNumber, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


const getLocationNumberForSeed = (seedNumber, seedMap) => {
    return MAP_NAMES.reduce((num, mapName) => {
            
        const [ , , additive ] = seedMap[mapName].find(([ sourceRangeStart, sourceRangeEnd, ]) => sourceRangeStart <= num && num <= sourceRangeEnd) ?? [ null, null, 0 ];

        return num + additive;

    }, seedNumber);
}


export async function secondPuzzle(input) {

    const lines = getLinesFromInput(input);

    const seedNumbers = lines.splice(0, 2)[0].split(': ')[1].split(' ').map((num) => parseInt(num));

    const seedMap = createSeedMap();

    let currentMapName;

    for( const line of lines ) {

        if(line.trim() === '') {

            continue;

        } else if(/\d/.test(line[0])) {

            const [ destRangeStart, sourceRangeStart, rangeLength ] = line.split(' ').map((num) => parseInt(num));

            const additive = destRangeStart - sourceRangeStart;

            const sourceRangeEnd = sourceRangeStart + rangeLength - 1;

            seedMap[currentMapName].push([ sourceRangeStart, sourceRangeEnd, additive ]);

        } else {

            currentMapName = MAP_NAMES.find((mapName) => line.indexOf(mapName) === 0);

        }

    }

    const DEFAULT_INCREMENT = 1000000;

    let minimumLocationNumber = Infinity;

    for(let s = 0; s < seedNumbers.length; s += 2) {
        const seedNumberStart = seedNumbers[s];
        const seedNumberRange = seedNumbers[s + 1];

        const seedNumberBounds = [ [ seedNumberStart, getLocationNumberForSeed(seedNumberStart, seedMap) ] ];

        let i = 0, increment = DEFAULT_INCREMENT;

        while(i < seedNumberRange) {
            const [lowerSeedNumber, lowerLocationNumber] = seedNumberBounds[ seedNumberBounds.length - 1 ];

            // The transform delta between seed and location number
            const lowerBoundDiff = lowerLocationNumber - lowerSeedNumber;

            const upperSeedNumber = seedNumberStart + i;

            const upperLocationNumber = getLocationNumberForSeed(upperSeedNumber, seedMap);

            const nextSeedNumber = upperSeedNumber + 1;

            const nextLocationNumber = getLocationNumberForSeed(nextSeedNumber, seedMap);

            // The transform delta between our test seed and location number
            const upperBoundDiff = upperLocationNumber - upperSeedNumber;

            // Should be 1 if the sequence is continuing
            const nextLocationDiff = nextLocationNumber - upperLocationNumber;

            // If the transform deltas were equal
            if(lowerBoundDiff === upperBoundDiff) {

                // And the next location was a continuation, keep searching
                if(nextLocationDiff === 1) {
                    i += increment;
                } else {
                    seedNumberBounds.push([ nextSeedNumber, nextLocationNumber ]);
                    increment = DEFAULT_INCREMENT;
                    i++;
                }

                continue;
                
            }

            if(increment > 1) {
                i -= increment;

                increment = Math.max(1, Math.floor(increment / 2));
            }

            i += increment;

        }

        const minLocation = seedNumberBounds.reduce((min, [, locationNumber]) => {
            return Math.min(min, locationNumber);
        }, Infinity);

        minimumLocationNumber = Math.min(minimumLocationNumber, minLocation);
    }

    


    return { answer: minimumLocationNumber, extraInfo: undefined };

}
