import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////

const maybeTallestTree = (position, height) => ({
    position, height
});

class TreeSurveyor {
    constructor(treeHeightGrid) {
        this.treeHeightGrid = treeHeightGrid;
        this.height = treeHeightGrid.length;
        this.width = treeHeightGrid[0].length;

        this.tallestNorthwardTree = new Array(this.width).fill(-1);
        this.tallestWestwardTree = new Array(this.height).fill(-1);
        
        this.maybeTallestSouthwardTree = new Array(this.width).fill(null).map(() => maybeTallestTree(-1, -1));
        this.maybeTallestEastwardTree = new Array(this.width).fill(null).map(() => maybeTallestTree(-1, -1));
    }

    getTreeHeight(x, y) {
        return this.treeHeightGrid[y][x];
    }

    getRow(y) {
        return this.treeHeightGrid[y];
    }

    getColumn(x) {
        return this.treeHeightGrid.map(row => row[x]);
    }

    isTreeOnEdge(x, y) {
        return x === 0 || y === 0 || x === this.width - 1 || y === this.height -1;
    }

    isTreeVisibleFromEdgeEZ(x, y) {
        if(this.isTreeOnEdge(x, y)) {
            return true;
        }
        
        const maybeVisibleTreeHeight = this.getTreeHeight(x, y);

        const row = this.getRow(y);
        const column = this.getColumn(x);

        return Math.max(...row.slice(0, x)) < maybeVisibleTreeHeight
            || Math.max(...row.slice(x + 1)) < maybeVisibleTreeHeight
            || Math.max(...column.slice(0, y)) < maybeVisibleTreeHeight
            || Math.max(...column.slice(y + 1)) < maybeVisibleTreeHeight
    }

    isTreeVisibleFromEdge(x, y) {
        const maybeVisibleTreeHeight = this.getTreeHeight(x, y);
        const isVisibleFromNorth = this.isTreeVisibleFromNorth(maybeVisibleTreeHeight, x);
        const isVisibleFromWest = this.isTreeVisibleFromWest(maybeVisibleTreeHeight, y);

        return isVisibleFromNorth
            || isVisibleFromWest
            || this.isTreeVisibleFromSouth(x, y)
            || this.isTreeVisibleFromEast(x, y);
    }

    isTreeVisibleFromNorth(maybeVisibleTreeHeight, x) {
        if(this.tallestNorthwardTree[x] >= maybeVisibleTreeHeight) {
            return false;
        } else {
            this.tallestNorthwardTree[x] = maybeVisibleTreeHeight;
            return true;
        }
    }

    isTreeVisibleFromWest(maybeVisibleTreeHeight, y) {
        if(this.tallestWestwardTree[y] >= maybeVisibleTreeHeight) {
            return false;
        } else {
            this.tallestWestwardTree[y] = maybeVisibleTreeHeight;
            return true;
        }
    }

    isTreeVisibleFromSouth(x, y) {
        const maybeVisibleTreeHeight = this.getTreeHeight(x, y);
        const { position, height } = this.maybeTallestSouthwardTree[x];
        
        if(position > y && height >= maybeVisibleTreeHeight) {
            return false;
        }

        const southwardTrees = this.getColumn(x);

        for(let i = y + 1; i < southwardTrees.length; i++) {
            const maybeBlockingTreeHeight = southwardTrees[i];

            if(maybeBlockingTreeHeight >= maybeVisibleTreeHeight) {
                this.maybeTallestSouthwardTree[x] = maybeTallestTree(i, maybeBlockingTreeHeight);

                return false;
            }
        }

        return true;
    }

    isTreeVisibleFromEast(x, y) {
        const maybeVisibleTreeHeight = this.getTreeHeight(x, y);
        const { position, height } = this.maybeTallestEastwardTree[y];
        
        if(position > x && height >= maybeVisibleTreeHeight) {
            return false;
        }

        const eastwardTrees = this.getRow(y);

        for(let i = x + 1; i < eastwardTrees.length; i++) {
            const maybeBlockingTreeHeight = eastwardTrees[i];

            if(maybeBlockingTreeHeight >= maybeVisibleTreeHeight) {
                this.maybeTallestEastwardTree[y] = maybeTallestTree(i, maybeBlockingTreeHeight);
                
                return false;
            }
        }

        return true;
    }

    calculateScenicScore(x, y) {
        if(this.isTreeOnEdge(x, y)) return 0;

        const currentTreeHeight = this.getTreeHeight(x, y);

        const row = this.getRow(y);
        const eastwardTrees = row.slice(x + 1);
        const westwardTrees = row.slice(0, x).reverse();

        const column = this.getColumn(x);
        const southwardTrees = column.slice(y + 1);
        const northwardTrees = column.slice(0, y).reverse();

        const treesVisible = [northwardTrees, eastwardTrees, southwardTrees, westwardTrees].map((trees) => {
            for(let i = 0; i < trees.length; i++) {
                if(trees[i] >= currentTreeHeight) {
                    return i + 1;
                }
            }

            return trees.length;
        });

        const score = treesVisible.reduce((accum, x) => accum * x, 1);

        return {
            score,
            treesVisible
        }
    }
}

export async function puzzle1(input) {

    const treeHeightGrid = getLinesFromInput(input).map(row => row.split('').map(height => parseInt(height)));

    const optimizedTimer = new PerformanceTimer('Optimized Implementation');

    const treeSurveyorOptimized = new TreeSurveyor(treeHeightGrid);

    let visibleTreeCountOptimized = 0;

    for(let x = 0; x < treeSurveyorOptimized.width; x++) {
        for(let y = 0; y < treeSurveyorOptimized.height; y++) {
            if(treeSurveyorOptimized.isTreeVisibleFromEdge(x, y)) {
                visibleTreeCountOptimized++;
            }
        }
    }

    optimizedTimer.stop();

    const simpleTimer = new PerformanceTimer('EZ Implementation');

    const treeSurveyorSimple = new TreeSurveyor(treeHeightGrid);

    let visibleTreeCountSimple = 0;

    for(let x = 0; x < treeSurveyorSimple.width; x++) {
        for(let y = 0; y < treeSurveyorSimple.height; y++) {
            if(treeSurveyorSimple.isTreeVisibleFromEdgeEZ(x, y)) {
                visibleTreeCountSimple++;
            }
        }
    }

    simpleTimer.stop();

    printResult(`Part 1 Result - Simple`, visibleTreeCountSimple, simpleTimer, `There were ${treeSurveyorSimple.height * treeSurveyorSimple.width} trees total`);
    printResult(`Part 1 Result - Optimized`, visibleTreeCountOptimized, optimizedTimer, `There were ${treeSurveyorOptimized.height * treeSurveyorOptimized.width} trees total`);

}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    const treeHeightGrid = getLinesFromInput(input).map(row => row.split('').map(height => parseInt(height)));

    const treeSurveyor = new TreeSurveyor(treeHeightGrid);

    let maxScenicScore = 0;
    let mostScenicCoordinates = { 
        x: -1, 
        y: -1
    };

    for(let x = 0; x < treeSurveyor.width; x++) {
        for(let y = 0; y < treeSurveyor.height; y++) {
            const { score: scenicScore } = treeSurveyor.calculateScenicScore(x, y);

            if(scenicScore > maxScenicScore) {
                maxScenicScore = scenicScore;
                mostScenicCoordinates = { x, y }
            }
        }
    }

    timer.stop();

    printResult(`Part 2 Result`, maxScenicScore, timer, `Most scenic tree is at [${mostScenicCoordinates.x},${mostScenicCoordinates.y}]`);
}
