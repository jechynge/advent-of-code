import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput, splitByDoubleNewline } from '../utils/Input.js';


////////////
// Part 1 //
////////////


class Monkey {
    constructor(input, worryFactor = 1) {
        const params = getLinesFromInput(input);

        this.id = parseInt(/\d+/.exec(params[0])[0]);
        this.items = params[1].substring('  Starting items: '.length).split(', ').map(item => parseInt(item));
        const operation_parts = params[2].substring('  Operation: new = '.length).split(' ');

        if(operation_parts[1] === '+') {
            this.operation = (old) => old + parseInt(operation_parts[2]);
        } else if(operation_parts[2] === 'old') {
            this.operation = (old) => old * old;
        } else {
            this.operation = (old) => old * parseInt(operation_parts[2]);
        }

        this.divisibleBy = parseInt(params[3].substring('  Test: divisible by '.length));

        this.throwToIfTrue = parseInt(params[4].substring('    If true: throw to monkey '.length));
        this.throwToIfFalse = parseInt(params[5].substring('    If false: throw to monkey '.length));

        this.inspectedItemCount = 0;
        this.worryFactor = worryFactor;
    }

    inspectAndThrowNextItem() {
        let item = this.items.shift();

        if(!item) return false;

        this.inspectedItemCount++;

        item = Math.floor(this.operation(item) / this.worryFactor);

        const throwTo = item % this.divisibleBy === 0 ? this.throwToIfTrue : this.throwToIfFalse;

        return { throwTo, item };
    }

    catchItem(item) {
        this.items.push(item);
    }
}

export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const monkeys = splitByDoubleNewline(input).map(params => new Monkey(params, 3));

    for(let i = 0; i < 20; i++) {
        for(let j = 0; j < monkeys.length; j++) {
            let thrownItem = monkeys[j].inspectAndThrowNextItem();

            while(thrownItem) {
                const { throwTo, item } = thrownItem;

                monkeys[throwTo].catchItem(item);

                thrownItem = monkeys[j].inspectAndThrowNextItem();
            }
        }
    }

    const monkeyBusiness = monkeys.sort((a, b) => b.inspectedItemCount - a.inspectedItemCount).slice(0,2).reduce((accum, monkey) => accum * monkey.inspectedItemCount, 1);

    timer.stop();

    printResult(`Part 1 Result`, monkeyBusiness, timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const monkeys = splitByDoubleNewline(input).map(params => new Monkey(params));

    const LCM = monkeys.reduce((accum, monkey) => monkey.divisibleBy * accum, 1);

    for(let i = 0; i < 10000; i++) {
        for(let j = 0; j < monkeys.length; j++) {
            let thrownItem = monkeys[j].inspectAndThrowNextItem();

            while(thrownItem) {
                const { throwTo, item } = thrownItem;

                monkeys[throwTo].catchItem(item % LCM);

                thrownItem = monkeys[j].inspectAndThrowNextItem();
            }
        }
    }

    const monkeyBusiness = monkeys.sort((a, b) => b.inspectedItemCount - a.inspectedItemCount).slice(0,2).reduce((accum, monkey) => accum * monkey.inspectedItemCount, 1);

    timer.stop();

    printResult(`Part 2 Result`, monkeyBusiness, timer);
}
