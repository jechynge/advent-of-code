import { getLinesFromInput } from '../utils/Input.js';
import { lowestCommonMultiple } from '../utils/Math.js';


const setupModules = (input) => {

    // Create a map keyed by module name. Contains relevant state for each
    // module depending on type.
    const modules = getLinesFromInput(input).map(line => line.split(' -> ')).reduce((modules, [ moduleName, outputs ]) => {

        outputs = outputs.split(', ');

        if(moduleName.startsWith('%')) {
            return {
                ...modules, 
                [moduleName.substring(1)]: {
                    type: 'flipflop',
                    state: 0,
                    outputs
                }
            }
        }

        if(moduleName.startsWith('&')) {
            return {
                ...modules,
                [moduleName.substring(1)]: {
                    type: 'conjunction',
                    state: 1,
                    outputs,
                    inputs: { },

                    // Meta info
                    inputMemo: { }
                }
            }
        }

        if(moduleName === 'broadcaster') {
            return {
                ...modules,
                broadcaster: {
                    type: 'broadcaster',
                    outputs,
                    state: 0
                }
            }
        }

        return modules;

    }, { 
        button: {
            type: 'button',
            state: 0,
            outputs: [ 'broadcaster' ]
        },
        rx: {
            type: 'output',
            outputs: [ ],
            pulses: [ 0, 0 ],
            inputs: { }
        }
    });

    // For each module, look at the other modules it sends output to. If the
    // receiving module tracks its input modules, register it as an input.
    for(const [ name, module ] of Object.entries(modules)) {
        for(const output of module.outputs) {

            const outputModule = modules[output];

            if(!outputModule) {
                continue;
            }

            if(!outputModule.hasOwnProperty('inputs')) {
                continue;
            }

            outputModule.inputs[name] = 0;

            if(!outputModule.hasOwnProperty('inputMemo')) {
                continue;

            }

            outputModule.inputMemo[name] = 0;

        }
    };

    return modules;
}

// Returns an array containing the count of low and high pulses sent.
const pressButton = (modules) => {

    const pulses = [ 0, 0 ];
    const queue = [[ 'button', 0, 'broadcaster' ]];

    while(queue.length > 0) {

        const [ senderName, pulse, receiverName ] = queue.shift();

        ++pulses[pulse];

        const receiver = modules[receiverName];

        if(!receiver) {
            continue;
        }

        if(receiver.type === 'output') {
            ++receiver.pulses[pulse];
        }

        if(receiver.type === 'broadcaster') {
            receiver.state = pulse;
        }

        if(receiver.type === 'flipflop') {
            if(pulse === 1) {
                continue;
            }

            receiver.state ^= 1;
        }

        if(receiver.type === 'conjunction') {
            receiver.inputs[senderName] = pulse;

            const newState = Object.values(receiver.inputs).every(signal => !!signal) ? 0 : 1;

            receiver.inputMemo[ senderName ] |= pulse;

            receiver.state = newState;
        }

        for(const output of receiver.outputs) {
            queue.push([ receiverName, receiver.state, output ]);
        }
    }

    return pulses;

}


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const modules = setupModules(input);

    const pulses = [ 0, 0 ];

    for(let i = 0; i < 1000; i++) {
        const [ lowPulses, highPulses ] = pressButton(modules);

        pulses[0] += lowPulses;
        pulses[1] += highPulses;
    }

    return { answer: pulses[0] * pulses[1], extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const modules = setupModules(input);

    const rx = modules.rx;

    const txName = Object.keys(rx.inputs)[0];

    const tx = modules[txName];

    const txInputs = Object.keys(tx.inputs);

    const inputModuleCycles = new Array(txInputs.length).fill(-1);

    let pressCount = 0;

    while(inputModuleCycles.some(cycleLength => cycleLength === -1)) {

        ++pressCount;

        pressButton(modules);

        for(let i = 0; i < txInputs.length; i++) {
            if(inputModuleCycles[i] !== -1) {
                continue;
            }

            if(tx.inputMemo[txInputs[i]] === 1) {
                inputModuleCycles[i] = pressCount;
            }
        }
    }

    const cycleLCM = Object.values(inputModuleCycles).reduce((cycleLCM, cycleLength) => {
        return lowestCommonMultiple(cycleLCM, cycleLength);
    }, 1);

    return { answer: cycleLCM, extraInfo: undefined };

}
