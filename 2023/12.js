import { getLinesFromInput } from '../utils/Input.js';
import { sum } from '../utils/Math.js';
import _ from 'lodash';


const BROKEN_SPRING = '#';

const isValidClusterPosition = (springMap, clusterPosition, clusterLength) => {

    // console.log(`${'v'.padStart(clusterPosition + 1, ' ')}${''.padEnd(clusterLength - 1, 'v')}`);
    // console.log(springMap.join(''));

    // There is a broken spring to the immediate left of the cluster
    if(clusterPosition > 0 && springMap[clusterPosition - 1] === BROKEN_SPRING) {
        return -1;
    }

    // There is a broken spring to the immediate right of the cluster
    if(clusterPosition + clusterLength < springMap.length && springMap[clusterPosition + clusterLength] === BROKEN_SPRING) {
        return -1;
    }

    return springMap.slice(clusterPosition, clusterPosition + clusterLength).reduce((count, spring) => spring === BROKEN_SPRING ? count + 1 : count, 0);

};

const countBrokenSpringPositions = ([ springMaps, brokenRanges, knownBrokenSprings ]) => {

    // Keep track of valid starting positions while stepping through the
    // broken range reports. The first iteration starts with the entire
    // map available.
    const startPositions = [ 
        { 
            '0,-1,0,0': {
                o: 0, // spring map offset
                s: -1, // start offset within spring map
                l: 0, // length of cluster
                c: 0, // broken spring coverage
                f: 1  // "factor"
            } 
        } 
    ];
    
    for(let i = 0; i < brokenRanges.length; i++) {
        const clusterLength = brokenRanges[i];
        startPositions[i + 1] = {};

        for(const startPosition of Object.values(startPositions[i]) ) {

            const {
                o: startSpringMap,
                s: previousClusterStart,
                l: previousClusterLength,
                c: brokenSpringsCoveredSoFar,
                f: factor
            } = startPosition;

            for(let j = startSpringMap; j < springMaps.length; j++) {
                const springMap = springMaps[j];
                const springMapOffset = j === startSpringMap ? previousClusterStart + previousClusterLength + 1 : 0;
                const firstBrokenSpringIndex = springMap.indexOf(BROKEN_SPRING, springMapOffset);

                for(let clusterPosition = springMapOffset; clusterPosition + clusterLength <= springMap.length; clusterPosition++) {

                    const brokenSpringsCovered = isValidClusterPosition(springMap, clusterPosition, clusterLength);

                    if(brokenSpringsCovered === -1) {
                        continue;
                    }

                    const coverage = brokenSpringsCoveredSoFar + brokenSpringsCovered;

                    const k = j + ',' + clusterPosition + ',' + clusterLength + ',' + coverage;

                    if(startPositions[i + 1][k]) {
                        startPositions[i + 1][k].f += factor;
                        continue;
                    }

                    if(firstBrokenSpringIndex > -1 && firstBrokenSpringIndex < clusterPosition) {
                        break;
                    }

                    // If we can fit this broken range into a map, add it
                    // as a starting position for fitting in the next range
                    // accounting for needing one space to the right for an
                    // operational spring.
                    startPositions[i + 1][k] = {
                        o: j, // spring map offset
                        s: clusterPosition, // start offset within spring map
                        l: clusterLength, // length of cluster
                        c: coverage, // broken spring coverage
                        f: factor  // "factor"
                    };

                }

            }

        }

    }

    // Count the number of ways we were able to get the last range to fit
    // into the spring map.
    return Object.values(startPositions[startPositions.length - 1]).map(({ c, f }) => {
        return c === knownBrokenSprings ? f : 0;
    }).reduce(sum);
};


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const springs = getLinesFromInput(input).map((line) => line.split(' ')).map(([springs, reports]) => {

        // Find all ranges where broken springs can exist
        const springRanges = springs.split('.').filter(x => !!x).map(cluster => cluster.split(''));

        const knownBrokenSprings = springs.split('').reduce((count, spring) => spring === BROKEN_SPRING ? count + 1 : count, 0);

        // Add up the total space where broken springs can exist
        const availableRange = springRanges.reduce((range, [ cluster ]) => {
            return range + cluster.length;
        }, 0);

        // Parse the broken spring cluster reports
        const brokenRanges = reports.split(',').map(i => parseInt(i));

        return [springRanges, brokenRanges, knownBrokenSprings, availableRange ];

    });

    const total = springs.reduce((total, springInfo) => {
        return total + countBrokenSpringPositions(springInfo);
    }, 0);

    return { answer: total, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const springs = getLinesFromInput(input).map((line) => line.split(' ')).map(([springs, reports]) => {

        const s = new Array(5).fill(springs).join('?')

        const r = new Array(5).fill(reports).join(',');

        // Find all ranges where broken springs can exist
        const springRanges = s.split('.').filter(x => !!x).map(cluster => cluster.split(''));

        const knownBrokenSprings = s.split('').reduce((count, spring) => spring === BROKEN_SPRING ? count + 1 : count, 0);

        // Add up the total space where broken springs can exist
        const availableRange = springRanges.reduce((range, [ cluster ]) => {
            return range + cluster.length;
        }, 0);

        // Parse the broken spring cluster reports
        const brokenRanges = r.split(',').map(i => parseInt(i));

        return [springRanges, brokenRanges, knownBrokenSprings, availableRange ];

    });

    const total = springs.reduce((total, springInfo) => {
        return total + countBrokenSpringPositions(springInfo);
    }, 0);

    return { answer: total, extraInfo: undefined };

}
