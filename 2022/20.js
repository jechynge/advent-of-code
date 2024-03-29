import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const initialFile = getLinesFromInput(input).map((num, i) => `${num}|${i}`);
    const mixed = [...initialFile];

    for(let i = 0; i < initialFile.length; i++) {
        const currentPosition = mixed.findIndex(num => num === initialFile[i]);

        const num = parseInt(mixed[currentPosition].split('|')[0]);

        mixed.splice(currentPosition, 1);

        const newPosition = (currentPosition + num) % mixed.length;

        if(newPosition === 0) {
            mixed.push(num);
        } else {
            mixed.splice(newPosition, 0, num);
        }
    }

    const zeroIndex = mixed.findIndex(num => num === 0);

    const a = (zeroIndex + 1000) % mixed.length;
    const b = (zeroIndex + 2000) % mixed.length;
    const c = (zeroIndex + 3000) % mixed.length;

    return { answer: mixed[a] + mixed[b] + mixed[c] };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const decryptionKey = 811589153;
    const initialFile = getLinesFromInput(input).map((num, i) => `${parseInt(num) * decryptionKey}|${i}`);
    const mixed = [...initialFile];

    for(let r = 0; r < 10; r++) {
        for(let i = 0; i < initialFile.length; i++) {
            const currentPosition = mixed.findIndex(num => num === initialFile[i]);
    
            const uniqueElement = mixed[currentPosition];
            const num = parseInt(uniqueElement.split('|')[0]);
    
            mixed.splice(currentPosition, 1);
    
            const newPosition = (currentPosition + num) % mixed.length;
    
            if(newPosition === 0) {
                mixed.push(uniqueElement);
            } else {
                mixed.splice(newPosition, 0, uniqueElement);
            }
        }
    }

    const zeroIndex = mixed.findIndex(num => num.startsWith('0|'));

    const coordinateSum = [1000,2000,3000].reduce((sum, offsetIndex) => {
        const coordinateIndex = (zeroIndex + offsetIndex) % mixed.length;

        return sum + parseInt(mixed[coordinateIndex].split('|')[0]);
    }, 0);

    return { answer: coordinateSum };
    
}
