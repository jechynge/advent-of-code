import { printResult, generateLine } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


class SignalGenerator {
    constructor() {
        this.signalStrengths = [];
        this.X = 1;
        this.cycle = 0;

        this.displayWidth = 40;
        this.displayHeight = 6;
        this.CRT;
    }

    addx(v) {
        this.tick();
        this.tick();
        this.X += v;
    }

    noop() {
        this.tick();
    }

    tick() {
        this.drawPixel();

        this.cycle++;
        this.signalStrengths.push(this.X * this.cycle);
    }

    drawPixel() {
        if(this.cycle % (this.displayHeight * this.displayWidth) === 0) {
            this.CRT = new Array(this.displayHeight).fill().map(() => []);
        }

        const pixelX = this.cycle % this.displayWidth;
        const pixelY = Math.floor(this.cycle / this.displayWidth);

        const character = Math.abs(this.X - pixelX) > 1 ? ' ' : '#';

        this.CRT[pixelY].push(character);
    }

    displayFrame() {

        const lPad = '| ';
        const rPad = ' |';

        const padding = lPad.length + rPad.length;

        const horizFrame = '+' + generateLine(this.displayWidth + padding - 2, '-') + '+';

        console.log('');
        console.log(horizFrame);
        this.CRT.forEach((line) => console.log(lPad + line.join('') + rPad));
        console.log(horizFrame);
    }

    // Cycle is 1-indexed, but the signalStrengths array is 0-indexed
    getSignalStrength(cycle) {
        if(cycle > this.signalStrengths.length) {
            throw new Error(`Tried to get signal from after execution: [${cycle}] - only performed ${this.signalStrengths.length} cycles`);
        }

        return this.signalStrengths[cycle - 1];
    }
}

export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const instructions = getLinesFromInput(input);

    const signalGenerator = new SignalGenerator();

    instructions.forEach((instruction) => {
        const [ op, x ] = instruction.split(' ').map((x, i) => i === 0 ? x : parseInt(x));

        switch(op) {
            case 'addx':
                signalGenerator.addx(x);
                break;
            case 'noop':
                signalGenerator.noop();
                break;
            default:
                throw new Error(`Encountered unknown op ${[op]}`);
        }
    });

    timer.stop();

    signalGenerator.displayFrame();

    const signalSum = [20, 60, 100, 140, 180, 220].reduce((accum, cycle) => accum + signalGenerator.getSignalStrength(cycle), 0);

    printResult(`Part 1 Result`, signalSum, timer, `Signal Generator cycled [${signalGenerator.signalStrengths.length}] times`);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    timer.stop();

    printResult(`Part 2 Result`, null, timer);
}
