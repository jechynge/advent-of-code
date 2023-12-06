import { getLinesFromInput } from '../utils/Input.js';


const parseCards = (input) => {
    return getLinesFromInput(input).map((card) => card.split(': ')[1].split(' | ').map((numbers) => {
        return numbers.trim().replaceAll(/\s+/g, ' ').split(' ').map((num) => parseInt(num));
    }));
}


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const cards = parseCards(input);
    
    const points = cards.reduce((points, [ cardNumbers, winningNumbers ]) => {
        const winningNumberMap = winningNumbers.reduce((m, winningNumber) => {
            m[winningNumber] = true;

            return m;
        }, {});

        const totalWinningNumbers = cardNumbers.reduce((count, cardNumber) => {
            return winningNumberMap[cardNumber] ? count + 1 : count;
        }, 0);

        if(totalWinningNumbers === 0) {
            return points;
        }

        return points + Math.pow(2, totalWinningNumbers - 1);
        
    }, 0);

    return { answer: points, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const cards = parseCards(input);

    const cardMultiples = new Array(cards.length).fill(1);

    cards.forEach(([ cardNumbers, winningNumbers ], i) => {
        

        const winningNumberMap = winningNumbers.reduce((m, winningNumber) => {
            m[winningNumber] = true;

            return m;
        }, {});

        const totalWinningNumbers = cardNumbers.reduce((count, cardNumber) => {
            return winningNumberMap[cardNumber] ? count + 1 : count;
        }, 0);

        for(let j = 1; j <= totalWinningNumbers && i + j < cards.length; j++) {
            cardMultiples[i + j] += cardMultiples[i];
        }
    });

    const totalCards = cardMultiples.reduce((count, multiples) => {
        return count + multiples;
    }, 0);

    return { answer: totalCards, extraInfo: undefined };

}
