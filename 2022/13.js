import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput, removeBlankLines, splitByDoubleNewline } from '../utils/Input.js';


////////////
// Part 1 //
////////////


function arePacketsInOrder(leftPacket, rightPacket) {
    for(let i = 0; true; i++) {
        let leftValue = leftPacket[i];
        let rightValue = rightPacket[i];

        if(leftValue === undefined && rightValue === undefined) {
            return null;
        }

        if(leftValue === undefined) {
            return true;
        }

        if(rightValue === undefined) {
            return false;
        }

        if(typeof leftValue !== typeof rightValue) {
            if(typeof leftValue === 'number') {
                leftValue = [ leftValue ];
            } else {
                rightValue = [ rightValue ];
            }
        }

        if(typeof leftValue === 'number') {
            if(leftValue < rightValue) {
                return true;
            }

            if(leftValue > rightValue) {
                return false;
            }
        }

        if(Array.isArray(leftValue)) {
            const isArrayInOrder = arePacketsInOrder(leftValue, rightValue);

            if(isArrayInOrder !== null) {
                return isArrayInOrder;
            }
        }
    }
}

export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const packets = splitByDoubleNewline(input).map(packetPair => getLinesFromInput(packetPair).map(eval));

    const inOrderIndicesSum = packets.reduce((accum, [ leftPacket, rightPacket ], index) => {
        return arePacketsInOrder(leftPacket, rightPacket) ? accum + index + 1 : accum;
    }, 0);

    timer.stop();

    printResult(`Part 1 Result`, inOrderIndicesSum, timer);
}


////////////
// Part 2 //
////////////


const dividerPackets = [
    [[ 2 ]],
    [[ 6 ]]
];

export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const packets = getLinesFromInput(removeBlankLines(input)).map(eval).concat(dividerPackets).sort((packetA, packetB) => {
        return arePacketsInOrder(packetA, packetB) ? -1 : 1;
    });

    const decoderKey = dividerPackets.reduce((accum, dividerPacket) => {
        const dividerPacketIndex = packets.findIndex(packet => packet?.[0]?.[0] === dividerPacket?.[0]?.[0]);

        return dividerPacketIndex === -1 ? accum : accum * (dividerPacketIndex + 1);
    }, 1);

    timer.stop();

    printResult(`Part 2 Result`, decoderKey, timer);
}
