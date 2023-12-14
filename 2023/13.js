import { getLinesFromInput } from '../utils/Input.js';
import { isPowerOfTwo } from '../utils/Math.js';

const isSmudge = (a, b) => {
    const x = a ^ b;

    return isPowerOfTwo(x);
}

const findReflection = (a, targetErrors = 0) => {
    let search = 0;

    while(search < a.length) {

        let axis = -1;

        for(let i = search; i < a.length - 1; i++) {
            if(a[i] === a[i+1] || isSmudge(a[i], a[i+1])) {
                axis = i + 1;
                break;
            }
        }

        if(axis === -1) {
            return -1;
        }

        search = axis;

        const mirrorLeft = a.slice(0, axis).reverse();
        const mirrorRight = a.slice(axis);

        const length = Math.min(mirrorLeft.length, mirrorRight.length);

        let isReflection = true;
        let e = 0;

        for(let i = 0; i < length && e <= targetErrors; i++) {
            if(mirrorLeft[i] === mirrorRight[i]) {
                continue;
            }

            if(isSmudge(mirrorLeft[i], mirrorRight[i])) {
                e++;
                continue;
            }

            isReflection = false;
            break;
        }

        if(isReflection && e === targetErrors) {
            return axis;
        }

    }

    return -1;
    
}


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    const sum = getLinesFromInput(input).reduce((grids, line) => {
        if(line === '') {
            return [...grids, []];
        }

        grids[grids.length - 1].push(line);

        return grids;
    }, [[]]).map((grid) => {

        const rows = new Array(grid.length).fill(0);
        const columns = new Array(grid[0].length).fill(0);

        for(let y = 0; y < grid.length; y++) {
            const row = grid[y];

            for(let x = 0; x < row.length; x++) {
                const char = row[x];

                rows[y] <<= 1;
                rows[y] += char === '#' ? 1 : 0;

                columns[x] <<= 1;
                columns[x] += char === '#' ? 1 : 0;
            }
        }

        return {
            grid,
            rows,
            columns
        };
    }).reduce((total, { rows, columns }, i) => {

        const rowReflection = findReflection(rows);

        if(rowReflection > -1) {
            return total += rowReflection * 100;
        }

        const columnReflection = findReflection(columns);

        if(columnReflection > -1) {
            return total += columnReflection;
        }

        throw new Error(`No reflection found at ${i}`);

    }, 0);


    return { answer: sum, extraInfo: undefined };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const sum = getLinesFromInput(input).reduce((grids, line) => {
        if(line === '') {
            return [...grids, []];
        }

        grids[grids.length - 1].push(line);

        return grids;
    }, [[]]).map((grid) => {

        const rows = new Array(grid.length).fill(0);
        const columns = new Array(grid[0].length).fill(0);

        for(let y = 0; y < grid.length; y++) {
            const row = grid[y];

            for(let x = 0; x < row.length; x++) {
                const char = row[x];

                rows[y] <<= 1;
                rows[y] += char === '#' ? 1 : 0;

                columns[x] <<= 1;
                columns[x] += char === '#' ? 1 : 0;
            }
        }

        return {
            grid,
            rows,
            columns
        };
    }).reduce((total, { rows, columns }, i) => {
        const rowReflection = findReflection(rows, 1);

        if(rowReflection > -1) {
            return total += rowReflection * 100;
        }

        const columnReflection = findReflection(columns, 1);

        if(columnReflection > -1) {
            return total += columnReflection;
        }

        throw new Error(`No reflection found at ${i}`);

    }, 0);


    return { answer: sum, extraInfo: undefined };

}
