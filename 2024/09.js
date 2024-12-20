import { getLinesFromInput } from '../utils/Input.js';
import { Grid, constructGridFromInput } from '../utils/Grid.js';
import { LinkedList } from '../utils/LinkedList.js';

////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    let checksum = 0;

    const fileMap = input.split('').reduce((fileMap, x, i) => {
        const length = parseInt(x);
        const file = new Array(length).fill(i % 2 === 0 ? Math.floor(i / 2) : null);

        fileMap.push(...file);

        return fileMap;
    }, []);

    let r = fileMap.length - 1;

    for(let i = 0; i <= r; i++) {
        if(fileMap[ i ] !== null) {
            checksum += i * fileMap[ i ];
            continue;
        }

        while(fileMap[ r ] === null) {
            --r;
        }

        if(r < i) {
            break;
        }

        checksum += i * fileMap[ r ];

        --r;
    }

    return { answer: checksum, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


const printFileMap = (fileMap) => {
    const s = fileMap.reduce((s, { fileLength, contents }) => {
        return s += ''.padEnd(fileLength, contents ?? '.');
    }, '');

    console.log(s);
}


export async function secondPuzzle(input) {

    const fileMap = new LinkedList();
    let totalLength = 0;
    
    input.split('').forEach((x, i) => {
        const fileLength = parseInt(x);
        totalLength += fileLength;
        fileMap.push(i, {
            fileLength,
            contents: i % 2 === 0 ? Math.floor(i / 2) : null
        });
    });

    let filePointer = fileMap.head;

    while(filePointer) {
        if(filePointer.value.contents !== null) {
            filePointer = filePointer.next;
            continue;
        }

        let moveCandidate = fileMap.tail;

        while(filePointer.value.fileLength > 0 && filePointer !== moveCandidate) {
            
            if(moveCandidate.value.contents === null) {
                moveCandidate = moveCandidate.prev;
                continue;
            }

            if(moveCandidate.value.fileLength > filePointer.value.fileLength) {
                moveCandidate = moveCandidate.prev;
                continue;
            }

            const newFile = LinkedList.CreateListItem(fileMap.length + 1, { ...moveCandidate.value });

            fileMap.insertBefore(filePointer, newFile);

            moveCandidate.value.contents = null;
            filePointer.value.fileLength -= moveCandidate.value.fileLength;

            moveCandidate = moveCandidate.prev;

        }

        filePointer = filePointer.next;
    }

    let offset = 0;

    const checksum = fileMap.reduce((checksum, { fileLength, contents}) => {
        if(!contents) {
            offset += fileLength;

            return checksum;
        }

        let fileChecksum = 0;

        for(let i = 0; i < fileLength; i++) {
            fileChecksum += contents * (i + offset);
        }

        offset += fileLength;

        return checksum + fileChecksum;
    }, 0);

    return { answer: checksum, extraInfo: undefined };

}


////////////
// Tests  //
////////////


export async function test(input) {

    const firstExpectedAnswer = 1928;

    const firstActualAnswer = await firstPuzzle(input);

    const secondExpectedAnswer = 2858;

    const secondActualAnswer = await secondPuzzle(input);

    return { 
        passed: firstExpectedAnswer === firstActualAnswer.answer 
            && secondActualAnswer.answer === secondExpectedAnswer, 
        extraInfo: `First Puzzle: Expected ${firstExpectedAnswer} - Got ${firstActualAnswer.answer}\nSecond Puzzle: Expected ${secondExpectedAnswer} - Got ${secondActualAnswer.answer}` };

}
