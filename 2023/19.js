import { getLinesFromInput } from '../utils/Input.js';
import { sum as calcSum } from '../utils/Math.js';


const PARTS_INDEX = [ 'x', 'm', 'a', 's' ];
const ATTR_MIN = 1;
const ATTR_MAX = 4000;


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const lines = getLinesFromInput(input);

    const splitAt = lines.indexOf('');

    const workflows = lines.slice(0, splitAt).reduce((workflows, workflow) => {
        const workflowName = workflow.substring(0, workflow.indexOf('{'));

        const paths = workflow.substring(workflow.indexOf('{') + 1, workflow.length - 1).split(',').map(path => {
            const pathParams = path.split(':');

            if(pathParams.length === 1) {
                return [ null, null, null, pathParams[0]];
            }

            const attribute = PARTS_INDEX.indexOf(pathParams[0].substring(0, 1));
            const comparison = pathParams[0].substring(1, 2);
            const value = parseInt(pathParams[0].substring(2));

            return [ attribute, comparison, value, pathParams[ 1 ] ];
        });

        return {
            ...workflows,
            [workflowName] : paths
        }
    }, {});

    const parts = lines.slice(splitAt + 1).map(line => line.substring(1, line.length - 1).split(',').reduce((attributes, attribute, i) => {
        const [ , attributeValue ] = attribute.split('=');

        return [
            ...attributes,
            parseInt(attributeValue)
        ];
    }, []));

    const isAccepted = (part, workflows) => {
        let result = 'in';

        do {
            const workflow = workflows[result].find(([ attributeName, comparison, attributeValue ]) => {
                if(attributeName === null) {
                    return true;
                }

                if(comparison === '>') {
                    return part[attributeName] > attributeValue;
                } else {
                    return part[attributeName] < attributeValue;
                }
            });

            result = workflow[3];
        } while(result !== 'A' && result !== 'R');

        return result === 'A';
    }

    const accepted = parts.reduce((sum, part) => {
        if(!isAccepted(part, workflows)) {
            return sum;
        }

        return sum + part.reduce(calcSum)
    }, 0);

    return { answer: accepted, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const lines = getLinesFromInput(input);

    const splitAt = lines.indexOf('');

    const workflows = lines.slice(0, splitAt).reduce((workflows, workflow) => {
        const workflowName = workflow.substring(0, workflow.indexOf('{'));

        const paths = workflow.substring(workflow.indexOf('{') + 1, workflow.length - 1).split(',').map(path => {
            const pathParams = path.split(':');

            if(pathParams.length === 1) {
                return [ null, null, null, pathParams[0]];
            }

            const attribute = PARTS_INDEX.indexOf(pathParams[0].substring(0, 1));
            const comparison = pathParams[0].substring(1, 2);
            const value = parseInt(pathParams[0].substring(2));

            return [ attribute, comparison, value, pathParams[ 1 ] ];
        });

        return {
            ...workflows,
            [workflowName] : paths
        }
    }, {});

    const acceptedRanges = [];

    const ranges = [
        [ 'in', ATTR_MIN, ATTR_MAX, ATTR_MIN, ATTR_MAX, ATTR_MIN, ATTR_MAX, ATTR_MIN, ATTR_MAX ]
    ];

    while(ranges.length) {
        const [ workflowName, ...attributes ] = ranges.pop();

        if(workflowName === 'R') {
            continue;
        }

        if(workflowName === 'A') {
            acceptedRanges.push(attributes);

            continue;
        }

        const workflow = workflows[workflowName];

        for(let i = 0; i < workflow.length; i++) {
            const [ attributeName, comparison, attributeValue, routeToWorkflow ] = workflow[i];

            if(attributeName === null) {
                ranges.push([ routeToWorkflow, ...attributes ]);

                continue;
            }

            const splitAttrs = [ ...attributes ];

            const lowerBoundIndex = attributeName * 2;
            const upperBoundIndex = lowerBoundIndex + 1;

            if(comparison === '<') {
                splitAttrs[ upperBoundIndex ] = attributeValue - 1;
                attributes[ lowerBoundIndex ] = attributeValue;

                ranges.push([ routeToWorkflow, ...splitAttrs ]);
            } else {
                splitAttrs[ lowerBoundIndex ] = attributeValue + 1;
                attributes[ upperBoundIndex ] = attributeValue;

                ranges.push([ routeToWorkflow, ...splitAttrs ]);
            }

        }

    }

    let sum = 0;

    for(let i = 0; i < acceptedRanges.length; i++) {
        const range = acceptedRanges[i];

        let rangeLengths = [];

        for(let j = 0; j < range.length; j += 2) {
            const lowerBound = range[j];
            const upperBound = range[j + 1];

            rangeLengths.push(upperBound - lowerBound + 1);
        }

        sum += rangeLengths.reduce((product, length) => product * length, 1);
    }

    return { answer: sum, extraInfo: undefined };

}
