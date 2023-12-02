import { getLinesFromInput, splitByDoubleNewline } from '../utils/Input.js';
import Grid from '../utils/Grid.js';


const getCardScore = (card, winningCalledNumber) => {
    let sum = 0;

    for(let x = 0; x < card.width; x++) {
        for(let y = 0; y < card.height; y++) {
            const number = card.getCell([x,y]);

            if(number) {
                sum += number ?? 0;
            }
        }
    }

    return sum * winningCalledNumber;
};

const populateBingoCard = (cardNumbers) => {
    const rows = getLinesFromInput(cardNumbers).map(row => row.trim().split(/\s+/).map(s => parseInt(s)));

    const rowCount = rows.length;
    const columnCount = rows[0].length;

    const card = new Grid(columnCount, rowCount);

    for (let x = 0; x < columnCount; x++) {
        for (let y = 0; y < rowCount; y++) {
            card.setCell([x,y], rows[y][x]);
        }
    }

    return card;
};


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const [ numberInput, ...cardInputs ] = splitByDoubleNewline(input);

    const calledNumbers = numberInput.split(',').map(s => parseInt(s));

    const cards = cardInputs.map(cardInput => populateBingoCard(cardInput));

    let bestCardIndex;
    let winningCalledNumber;

    for(let i = 0; i < calledNumbers.length; i++) {
        const calledNumber = calledNumbers[i];

        for(let j = 0; j < cards.length; j++) {
            const card = cards[j];

            const coordinates = card.findCell((number) => number === calledNumber);

            if(coordinates === null) {
                continue;
            }

            card.setCell(coordinates, undefined);

            const isRowBingo = card.getRow(coordinates[1]).every((number) => number === undefined);
            const isColumnBingo = card.getColumn(coordinates[0]).every((number) => number === undefined);

            if(isRowBingo || isColumnBingo) {
                bestCardIndex = j;
                break;
            }
        }

        if(bestCardIndex) {
            winningCalledNumber = calledNumber;
            break;
        }
    }

    const cardScore = getCardScore(cards[bestCardIndex], winningCalledNumber);

    return { answer: cardScore };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const [ numberInput, ...cardInputs ] = splitByDoubleNewline(input);

    const calledNumbers = numberInput.split(',').map(s => parseInt(s));

    const cards = cardInputs.map((cardInput, i) => {
        const card = populateBingoCard(cardInput);

        card.isBingo = false;

        return card;
    });

    let worstCardIndex;
    let winningCalledNumber;
    let isBingoCount = 0;

    for(let i = 0; i < calledNumbers.length; i++) {
        const calledNumber = calledNumbers[i];

        for(let j = 0; j < cards.length; j++) {
            const card = cards[j];

            if(card.isBingo) {
                continue;
            }

            const coordinates = card.findCell((number) => number === calledNumber);

            if(coordinates === null) {
                continue;
            }

            card.setCell(coordinates, undefined);

            const isRowBingo = card.getRow(coordinates[1]).every((number) => number === undefined);
            const isColumnBingo = card.getColumn(coordinates[0]).every((number) => number === undefined);

            card.isBingo = isRowBingo || isColumnBingo;

            if(card.isBingo) {

                ++isBingoCount;

                if(isBingoCount === cards.length) {
                    winningCalledNumber = calledNumber;
                    worstCardIndex = j;
                    break;
                }
                
            }
        }

        if(worstCardIndex !== undefined) {
            break;
        }

    }

    const cardScore = getCardScore(cards[worstCardIndex], winningCalledNumber);

    return { answer: cardScore };

}
