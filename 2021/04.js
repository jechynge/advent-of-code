import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput, splitByDoubleNewline } from '../utils/Input.js';
import Grid from '../utils/Grid.js';


////////////
// Part 1 //
////////////


export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const [ numberInput, ...cardInputs ] = splitByDoubleNewline(input);

    const calledNumbers = numberInput.split(',').map(s => parseInt(s));

    const cards = cardInputs.map(cardInput => {
        const rows = getLinesFromInput(cardInput).map(row => row.split(/\s+/).map(s => parseInt(s)));

        const rowCount = rows.length;
        const columnCount = rows[0].length;

        const card = new Grid(columnCount, rowCount);

        for (let x = 0; x < columnCount; x++) {
            for (let y = 0; y < rowCount; y++) {
                card.setCell([x,y], [rows[y][x], false]);
            }
        }

        return card;
    });

    let bestCardIndex;
    let winningCalledNumber;

    for(let i = 0; i < calledNumbers.length; i++) {
        const calledNumber = calledNumbers[i];

        for(let j = 0; j < cards.length; j++) {
            const card = cards[j];

            const coordinates = card.findCell(([number, isCalled]) => number === calledNumber);

            if(coordinates === null) {
                continue;
            }

            card.setCell(coordinates, [calledNumber, true]);

            const isRowBingo = card.getRow(coordinates[1]).every(([number, isCalled]) => isCalled);
            const isColumnBingo = card.getColumn(coordinates[0]).every(([number, isCalled]) => isCalled);

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

    const bestCard = cards[bestCardIndex];

    let unmarkedSum = 0;

    for(let x = 0; x < bestCard.width; x++) {
        for(let y = 0; y < bestCard.height; y++) {
            const [number, isMarked] = bestCard.getCell([x,y]);

            if(!isMarked) {
                unmarkedSum += number;
            }
        }
    }

    timer.stop();

    printResult(`Part 1 Result`, unmarkedSum * winningCalledNumber, timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    // ...todo

    timer.stop();

    printResult(`Part 2 Result`, null, timer);
}
