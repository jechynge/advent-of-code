import { getLinesFromInput } from '../utils/Input.js';
import _ from 'lodash';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const signals = getLinesFromInput(input).map(s => s.split(' | ').map(s => s.split(' ')));

    const uniqueCount = signals.reduce((count, [, display]) => {
        const correctLength = display.filter(s => [2,3,4,7].indexOf(s.length) > -1);
        return count + correctLength.length;
    }, 0);

    return { answer: uniqueCount };

}


////////////
// Part 2 //
////////////


const signalCharacters = 'abcdefg'.split('');

const decodeSignals = (scrambledSignals) => {

    let scrambled = [...scrambledSignals];

    const unscrambled = new Array(10).fill(null);

    unscrambled[1] = scrambled.find(s => s.length === 2);
    unscrambled[4] = scrambled.find(s => s.length === 4);
    unscrambled[7] = scrambled.find(s => s.length === 3);
    unscrambled[8] = scrambled.find(s => s.length === 7);

    const topSegment = _.difference(unscrambled[7].split(''), unscrambled[1].split(''))[0];

    scrambled = scrambled.filter(s => unscrambled.indexOf(s) === -1);

    unscrambled[9] = scrambled.find(s => {
        if(s.length !== 6) return false;

        const commonSegments = _.uniq([...unscrambled[4].split(''), ...unscrambled[7].split('')]);

        const extraSegments = _.difference(s.split(''), commonSegments);

        return extraSegments.length === 1;
    });

    const bottomSegment = _.difference(unscrambled[9].split(''), [...unscrambled[4].split(''), ...unscrambled[7].split('')])[0];
    const bottomLeftSegment = _.difference(signalCharacters, unscrambled[9].split(''))[0];

    scrambled = scrambled.filter(s => unscrambled.indexOf(s) === -1);

    unscrambled[3] = scrambled.find(s => {
        if(s.length !== 5) return false;

        const commonSegments = _.uniq([bottomSegment, ...unscrambled[7].split('')]);

        const extraSegments = _.difference(s.split(''), commonSegments);

        return extraSegments.length === 1;
    });

    scrambled = scrambled.filter(s => unscrambled.indexOf(s) === -1);

    const middleSegment = _.difference(unscrambled[3].split(''), [bottomSegment, ...unscrambled[7].split('')])[0];
    const topLeftSegment = _.difference(unscrambled[4].split(''), [middleSegment, ...unscrambled[1].split('')])[0];

    unscrambled[2] = scrambled.find(s => {
        if(s.length !== 5) return false;

        return s.split('').indexOf(topLeftSegment) === -1;
    });

    scrambled = scrambled.filter(s => unscrambled.indexOf(s) === -1);

    unscrambled[5] = scrambled.find(s => s.length === 5);

    scrambled = scrambled.filter(s => unscrambled.indexOf(s) === -1);

    const topRightSegment = _.difference(unscrambled[1].split(''), unscrambled[5].split(''))[0];
    const bottomRightSegment = _.difference(unscrambled[1].split(''), [topRightSegment])[0];

    unscrambled[0] = scrambled.find(s => s.length === 6 && _.difference(s.split(''), _.without(signalCharacters, middleSegment)).length === 0);
    unscrambled[6] = scrambled.find(s => s.length === 6 && _.difference(s.split(''), _.without(signalCharacters, topRightSegment)).length === 0);

    scrambled = scrambled.filter(s => unscrambled.indexOf(s) === -1);

    return unscrambled.reduce((dict, scrambledSignal, unscrambledNumber) => {
        dict[scrambledSignal] = `${unscrambledNumber}`;

        return dict;
    }, {});
};


export async function secondPuzzle(input) {

    const signals = getLinesFromInput(input).map(s => s.split(' | ').map(s => s.split(' ').map(s => s.split('').sort().join(''))));

    const signalNumbers = signals.map(([signalPatterns, scrambledSignals]) => {
        const numberDictionary = decodeSignals(signalPatterns);

        const digits = scrambledSignals.map(scrambledSignal => numberDictionary[scrambledSignal]);

        return parseInt(digits.join(''));
    });

    const signalSum = signalNumbers.reduce((sum, signalNumber) => sum + signalNumber, 0);

    return { answer: signalSum };

}
