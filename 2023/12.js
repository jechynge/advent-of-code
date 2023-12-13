import { getLinesFromInput } from '../utils/Input.js';
import _ from 'lodash';


const BROKEN_SPRING = '#';

const DEBUG = false;


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const springs = getLinesFromInput(input).map((line) => line.split(' ')).map(([springs, reports]) => {

        // Find all ranges where broken springs can exist
        const springRanges = springs.split('.').filter(x => !!x).map(cluster => cluster.split(''));

        // Add up the total space where broken springs can exist
        const availableRange = springRanges.reduce((range, [ cluster ]) => {
            return range + cluster.length;
        }, 0);

        // Parse the broken spring cluster reports
        const brokenRanges = reports.split(',').map(i => parseInt(i));

        return [springRanges, availableRange, brokenRanges];

    });

    const isValidClusterPosition = (springMap, clusterPosition, clusterLength) => {

        if(DEBUG) {
            console.log(`${'v'.padStart(clusterPosition + 1, ' ')}${''.padEnd(clusterLength - 1, 'v')}`);
            console.log(springMap.join(''));
        }

        // Cluster offset and length is longer than the available space
        if(clusterPosition + clusterLength > springMap.length) {
            return false;
        }

        // There is a broken spring to the immediate left of the cluster
        if(clusterPosition > 0 && springMap[clusterPosition - 1] === BROKEN_SPRING) {
            return false;
        }

        // There is a broken spring to the immediate right of the cluster
        if(clusterPosition + clusterLength < springMap.length && springMap[clusterPosition + clusterLength] === BROKEN_SPRING) {
            return false;
        }

        return true;
    }

    

    const countBrokenSpringPositions = ([ springMaps, availableRange, brokenRanges ]) => {

        // Keep track of valid starting positions while stepping through the
        // broken range reports. The first iteration starts with the entire
        // map available.
        const startPositions = [ [ [0,0] ] ];
        
        for(let i = 0; i < brokenRanges.length; i++) {
            const clusterLength = brokenRanges[i];
            startPositions[i + 1] = [];

            for(const [ startSpringMap, startPosition ] of startPositions[i] ) {

                for(let j = startSpringMap; j < springMaps.length; j++) {
                    const springMap = springMaps[j];
    
                    for(let k = j === startSpringMap ? startPosition : 0; k < springMap.length; k++) {
                        const isValid = isValidClusterPosition(springMap, k, clusterLength);
    
                        // If we can fit this broken range into a map, add it
                        // as a starting position for fitting in the next range
                        // accounting for needing one space to the right for an
                        // operational spring.
                        if(isValid) {
                            startPositions[i + 1].push([j, k + clusterLength + 1]);
                        }
                    }
    
                }

            }

        }

        // Count the number of ways we were able to get the last range to fit
        // into the spring map.
        return startPositions[startPositions.length - 1].length;
    };

    const total = springs.reduce((total, springInfo) => {
        return total + countBrokenSpringPositions(springInfo);
    }, 0);

    return { answer: total, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    // ...todo

    return { answer: null, extraInfo: undefined };

}
