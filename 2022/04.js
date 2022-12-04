import { printResult } from '../utils/PrettyPrint.js';
import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function puzzle1(input) {
    const isRangeSubset = (a, b) => a[0] <= b[0] && a[1] >= b[1];

    const subsetAssignmentCounts = getLinesFromInput(input).filter((assignment) => {
        const [ firstElfAssignment, secondElfAssignment ] = assignment.split(',').map(sections => sections.split('-').map((section) => parseInt(section)));

        return isRangeSubset(firstElfAssignment, secondElfAssignment) || isRangeSubset(secondElfAssignment, firstElfAssignment);
    }).length;

    printResult(`Part 1 Result`, subsetAssignmentCounts);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const doesRangeContainNumber = (range, n) => range[0] <= n && n <= range[1];
    const doRangesOverlap = (a, b) => doesRangeContainNumber(a, b[0]) || doesRangeContainNumber(a, b[1]) || doesRangeContainNumber(b, a[0]) || doesRangeContainNumber(b, a[1]);

    const overlappingAssignmentCounts = getLinesFromInput(input).filter((assignment) => {
        const [ firstElfAssignment, secondElfAssignment ] = assignment.split(',').map(sections => sections.split('-').map((section) => parseInt(section)));

        return doRangesOverlap(firstElfAssignment, secondElfAssignment);
    }).length;

    printResult(`Part 2 Result`, overlappingAssignmentCounts);
}
