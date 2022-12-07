import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';


function getDirectorySizes(commands) {
    let currentPath = [];
    const directorySizes = {
        'root': 0
    };

    let i = 0;

    while(i < commands.length) {
        const command = commands[i];

        ++i;

        if(command.startsWith('$ cd')) {
            const to = command.substring(5);

            switch(to) {
                case '/':
                    currentPath = [];
                    break;
                case '..':
                    currentPath.pop();
                    break;
                default:
                    currentPath.push(to);
                    break;
            }
        } else if(command.startsWith('$ ls')) {
            let fileInfo = commands[i];
            let directorySize = 0;

            while(fileInfo && !fileInfo.startsWith('$')) {
                ++i;

                if(!fileInfo.startsWith('dir')) {
                    const [ fileSize ] = fileInfo.split(' ').map(i => parseInt(i));

                    if(isNaN(fileSize)) {
                        throw new Error(`got NaN for filesize at ${i}`);
                    }

                    directorySize += fileSize;
                }

                fileInfo = commands[i];
            }

            directorySizes.root += directorySize;

            let path = '';

            for(let j = 0; j < currentPath.length; j++) {
                path += `/${currentPath[j]}`;

                directorySizes[path] = (directorySizes[path] ?? 0) + directorySize;
            }
        } else {
            throw new Error(`unexpected command ${command}`);
        }
    }

    return directorySizes;
}


////////////
// Part 1 //
////////////


function buildPath(segments) {
    return '/' + segments.join('/');
}

export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const commands = getLinesFromInput(input);

    const directorySizes = getDirectorySizes(commands);

    const smallDirectorySum = Object.keys(directorySizes).reduce((accum, directoryName) => directorySizes[directoryName] <= 100000 ? accum + directorySizes[directoryName] : accum, 0);

    timer.stop();

    printResult(`Part 1 Result`, smallDirectorySum, timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const totalSpace = 70000000;
    const freeSpaceNeeded = 30000000;

    const commands = getLinesFromInput(input);

    const directorySizes = getDirectorySizes(commands);

    const unusedSpace = totalSpace - directorySizes.root;
    const minDirectorySize = freeSpaceNeeded - unusedSpace;

    let closestDirectorySize = Infinity;
    let closestDirectoryName = null;

    Object.entries(directorySizes).forEach(([directoryName, directorySize]) => {
        if(directorySize < minDirectorySize) {
            return;
        }

        if(directorySize - minDirectorySize < closestDirectorySize - minDirectorySize) {
            closestDirectorySize = directorySize;
            closestDirectoryName = directoryName;
        }
    })

    timer.stop();

    printResult(`Part 2 Result`, closestDirectorySize, timer, `Delete directory ${closestDirectoryName}`);
}
