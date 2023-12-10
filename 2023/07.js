import { getLinesFromInput } from '../utils/Input.js';


const handTypeStrengths = {
    'fiveOfAKind': 7,
    'fourOfAKind': 6,
    'fullHouse': 5,
    'threeOfAKind': 4,
    'twoPair': 3,
    'onePair': 2,
    'highCard': 1
};

const getHandTypeStrength = (cardGroups, useJokers = false) => {

    const groups = Object.keys(cardGroups);

    if(groups.length === 1) {
        return handTypeStrengths.fiveOfAKind;
    }

    const hasJoker = useJokers && cardGroups['J'] > 0;

    if(groups.length === 5) {
        return hasJoker ? handTypeStrengths.onePair : handTypeStrengths.highCard;
    }

    if(groups.length === 4) {
        return hasJoker ? handTypeStrengths.threeOfAKind : handTypeStrengths.onePair;
    }

    const groupSizes = Object.values(cardGroups);

    if(groups.length === 2) {

        if(hasJoker) {
            return handTypeStrengths.fiveOfAKind;
        }

        if(groupSizes[0] === 4 || groupSizes[0] === 1) {
            return handTypeStrengths.fourOfAKind;
        } else {
            return handTypeStrengths.fullHouse;
        }

    }

    if(groups.length === 3) {

        if(groupSizes.every(size => size < 3)) {

            if(hasJoker) {
                return cardGroups['J'] === 1 ? handTypeStrengths.fullHouse : handTypeStrengths.fourOfAKind;
            } else {
                return handTypeStrengths.twoPair;
            }

        } else {
            return hasJoker ? handTypeStrengths.fourOfAKind : handTypeStrengths.threeOfAKind;
        }

    }

    throw new Error(`Unknown hand type - check card groups`);

};

const getHandStrength = (hand, useJokers = false) => {

    const cards = hand.split('');

    const cardGroups = {

    };

    const handOrderStrength = cards.reduce((strength, char, i) => {
        const power = (cards.length - i - 1) * 2;
        const mult = Math.pow(10, power);
        
        if(!cardGroups[char]) {
            cardGroups[char] = 0;
        }

        ++cardGroups[char];

        let val;

        switch(char) {
            case 'A':
                val = 99;
                break;
            case 'K':
                val = 98;
                break;
            case 'Q': 
                val = 97;
                break;
            case 'J':
                val = useJokers ? 1 : 96;
                break;
            case 'T':
                val = 95;
                break;
            default:
                val = char.charCodeAt(0);
        }

        return (val * mult) + strength;
    }, 0);

    
    const handTypeStrength = getHandTypeStrength(cardGroups, useJokers) * Math.pow(10, cards.length * 2);

    return handTypeStrength + handOrderStrength;

};


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const hands = getLinesFromInput(input).map((line) => {

        const [ hand, bid ] = line.split(' ');

        return [ getHandStrength(hand), parseInt(bid) ];

    });

    const totalWinnings = hands.sort((a, b) => a[0] - b[0]).reduce((totalWinnings, [ , bid ], rank, hands) => {
        return totalWinnings + ( bid * (rank + 1) );
    }, 0);

    return { answer: totalWinnings, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const hands = getLinesFromInput(input).map((line) => {

        const [ hand, bid ] = line.split(' ');

        return [ getHandStrength(hand, true), parseInt(bid) ];

    });

    const totalWinnings = hands.sort((a, b) => a[0] - b[0]).reduce((totalWinnings, [ , bid ], rank, hands) => {
        return totalWinnings + ( bid * (rank + 1) );
    }, 0);

    return { answer: totalWinnings, extraInfo: undefined };

}


export async function test(input) {
    const lines = getLinesFromInput(input);

    const badLine = lines.findIndex((line) => {

        const [ hand, expected ] = line.split(' ');

        return getHandStrength(hand, true) !== parseInt(expected);

    });


    return { passed: badLine === -1, extraInfo: badLine > -1 ? `Found invalid result at line ${badLine + 1}` : undefined };
}