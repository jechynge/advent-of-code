import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const monkeys = getLinesFromInput(input).reduce((accum, monkey) => {
        const [name, job] = /^(\w+): (.+)$/.exec(monkey).slice(1);

        const possibleNumber = parseInt(job);

        if(!isNaN(possibleNumber)) {
            return {
                ...accum,
                [name]: () => possibleNumber
            };
        }

        const [ monkeyA, operation, monkeyB ] = /^(\w+) ([+-/*]) (\w+)|$/.exec(job).slice(1);

        if(operation === '+') {
            return {
                ...accum,
                [name]: () => monkeys[monkeyA]() + monkeys[monkeyB]()
            };
        }

        if(operation === '-') {
            return {
                ...accum,
                [name]: () => monkeys[monkeyA]() - monkeys[monkeyB]()
            };
        }

        if(operation === '*') {
            return {
                ...accum,
                [name]: () => monkeys[monkeyA]() * monkeys[monkeyB]()
            };
        }

        if(operation === '/') {
            return {
                ...accum,
                [name]: () => monkeys[monkeyA]() / monkeys[monkeyB]()
            };
        }

        throw new Error(`Unknown operation ${operation}`);
    }, {});

    return { answer: monkeys.root() };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {
    
    // let myNumber = 3910938071092;
    let myNumber;
    let myInitialNumber;

    const monkeys = getLinesFromInput(input).reduce((accum, monkey) => {
        const [name, job] = /^(\w+): (.+)$/.exec(monkey).slice(1);

        const possibleNumber = parseInt(job);

        if(!isNaN(possibleNumber)) {
            if(name === 'humn') {
                myNumber = possibleNumber;
                myInitialNumber = possibleNumber;
                return {
                    ...accum,
                    [name]: () => myNumber
                };
            }

            return {
                ...accum,
                [name]: () => possibleNumber
            };
        }

        const [ monkeyA, operation, monkeyB ] = /^(\w+) ([+-/*]) (\w+)|$/.exec(job).slice(1);

        if(name === 'root') {
            return {
                ...accum,
                [name]: () => [monkeys[monkeyA], monkeys[monkeyB]]
            }
        }

        if(operation === '+') {
            return {
                ...accum,
                [name]: () => monkeys[monkeyA]() + monkeys[monkeyB]()
            };
        }

        if(operation === '-') {
            return {
                ...accum,
                [name]: () => monkeys[monkeyA]() - monkeys[monkeyB]()
            };
        }

        if(operation === '*') {
            return {
                ...accum,
                [name]: () => monkeys[monkeyA]() * monkeys[monkeyB]()
            };
        }

        if(operation === '/') {
            return {
                ...accum,
                [name]: () => monkeys[monkeyA]() / monkeys[monkeyB]()
            };
        }

        throw new Error(`Unknown operation ${operation}`);
    }, {});

    const [left, right] = monkeys.root();

    const target = right();

    let difference = left() - target;
    let increaseBy = 100000000;

    while(difference) {
        myNumber += increaseBy;
        const newDifference = left() - target;

        if((difference < 0 && newDifference < 0) || (difference > 0 && newDifference > 0)) {
            if(Math.abs(newDifference) < Math.abs(difference)) {
                difference = newDifference;
                continue;
            }
        }

        difference = newDifference;

        if(Math.abs(increaseBy) === 1) {
            increaseBy /= -1;
        } else {
            increaseBy /= -10;
        }
    }

    return { answer: myNumber };

}
