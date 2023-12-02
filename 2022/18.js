import { getLinesFromInput } from '../utils/Input.js';
import Cube, { CUBE_CARDINAL_TRANSFORMS } from '../utils/Cube.js';


////////////
// Part 1 //
////////////


export async function firstPuzzle(input) {

    let maxDim = 0;

    const droplets = getLinesFromInput(input).map(line => line.split(',').map(coordinate => {
      const numCoordinate = parseInt(coordinate);

      maxDim = Math.max(maxDim, numCoordinate + 1);

      return numCoordinate;
    }));

    const cube = new Cube(maxDim, maxDim, maxDim);

    droplets.forEach(droplet => cube.setCell(droplet, true));

    const faceCount = droplets.reduce((faceCount, droplet) => {
      let dropletFaceCount = 0;

      for(let i = 0; i < CUBE_CARDINAL_TRANSFORMS.length; i++) {
        const transform = CUBE_CARDINAL_TRANSFORMS[i];
        const adjacentCoordinate = Cube.Transform3DCoordinate(droplet, transform);

        if(!cube.getCell(adjacentCoordinate)) {
          dropletFaceCount++;
        }
      }

      return faceCount + dropletFaceCount;
    }, 0);

    return { answer: faceCount };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    let maxDim = 0;

    const droplets = getLinesFromInput(input).map(line => line.split(',').map(coordinate => {
      const numCoordinate = parseInt(coordinate);

      maxDim = Math.max(maxDim, numCoordinate + 10);

      return numCoordinate;
    }));

    const cube = new Cube(maxDim, maxDim, maxDim, { initialValue: '.', offsetX: -5, offsetY: -5, offsetZ: -5 });

    droplets.forEach(droplet => cube.setCell(droplet, 'o'));

    const faceCount = droplets.reduce((faceCount, droplet) => {
      let dropletFaceCount = 0;

      for(let i = 0; i < CUBE_CARDINAL_TRANSFORMS.length; i++) {
        const transform = CUBE_CARDINAL_TRANSFORMS[i];
        const adjacentCoordinate = Cube.Transform3DCoordinate(droplet, transform);

        if(cube.getCell(adjacentCoordinate) === 'o') {
          continue;
        }

        const distance = cube.findShortestDistance(adjacentCoordinate, [0,0,0]);

        if(distance === -1) {
          continue;
        }

        dropletFaceCount++;
      }

      return faceCount + dropletFaceCount;
    }, 0);

    return { answer: faceCount };
    
}
