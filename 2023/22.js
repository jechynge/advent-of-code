import { getLinesFromInput, splitAndParseIntsFromLine } from '../utils/Input.js';
import { Grid, constructGridFromInput } from '../utils/Grid.js';
import Cube, { CUBE_CARDINAL_MOVEMENT } from '../utils/Cube.js';
import _ from 'lodash';

const generateBrickTower = (input) => {
    // Parse X,Y,Z coordinates
    const bricks = getLinesFromInput(input).map(line => line.split('~').map(brickCoordinate => splitAndParseIntsFromLine(brickCoordinate, ',')));

    const brickTower = new Array(bricks.length);

    // Sort bricks from closest to farthest from the ground
    bricks.sort((a, b) => {
        return Math.min(a[ 0 ][ 2 ], a[ 1 ][ 2 ]) - Math.min(b[ 0 ][ 2 ], b[ 1 ][ 2 ]);
    });

    const bounds = bricks.reduce((bounds, brick) => {
        return {
            x: Math.max(bounds.x, brick[ 0 ][ 0 ], brick[ 1 ][ 0 ]),
            y: Math.max(bounds.y, brick[ 0 ][ 1 ], brick[ 1 ][ 1 ]),
            z: Math.max(bounds.z, brick[ 0 ][ 2 ], brick[ 1 ][ 2 ])
        };
    }, {
        x: 0,
        y: 0,
        z: 0
    });

    const brickMap = new Cube(bounds.x, bounds.y, bounds.z, { baseOne: true, initialValue: -1 });

    const getBottomFace = (brickStart, brickEnd) => {
        const faceCoordinates = [];

        if(brickStart[ 2 ] !== brickEnd[ 2 ]) {
            faceCoordinates.push([ brickStart[ 0 ], brickStart[ 1 ], Math.min(brickStart[ 2 ], brickEnd[ 2 ])]);
        } else {
            for(let x = Math.min(brickStart[ 0 ], brickEnd[ 0 ]); x <= Math.max(brickStart[ 0 ], brickEnd[ 0 ]); x++) {
                for(let y = Math.min(brickStart[ 1 ], brickEnd[ 1 ]); y <= Math.max(brickStart[ 1 ], brickEnd[ 1 ]); y++) {
                    faceCoordinates.push([ x, y, brickStart[ 2 ]]);
                }
            }
        }

        return faceCoordinates;
    }


    for(let i = 0; i < bricks.length; i++) {

        const brickStart = [ [ ...bricks[ i ][ 0 ] ],  [ ...bricks[ i ][ 1 ] ] ];

        const bottomFaceStart = getBottomFace(brickStart[ 0 ], brickStart[ 1 ]);

        let distanceFallen = 0;

        while(true) {
            const distanceFromGround = bottomFaceStart[ 0 ][ 2 ] - distanceFallen - 1;

            if(distanceFromGround === 0 || !brickMap.isValidMove(bottomFaceStart, [ 0, 0, -distanceFallen - 1 ])) {
                break;
            }

            ++distanceFallen;
        }

        const brickEnd = [ Cube.Transform3DCoordinate(brickStart[ 0 ], [ 0, 0, -distanceFallen ]), Cube.Transform3DCoordinate(brickStart[ 1 ], [ 0, 0, -distanceFallen ])];
        const bottomFaceEnd = getBottomFace(brickEnd[ 0 ], brickEnd[ 1 ]);

        brickMap.setRange(brickEnd[ 0 ], brickEnd[ 1 ], i);

        const restingOnGround = bottomFaceEnd[ 0 ][ 2 ] === 1;

        const supportedBy = restingOnGround ? [ ] : bottomFaceEnd.reduce((supportingBrickIndices, coordinates) => {
            const supportingBrickIndex = brickMap.getCell(Cube.Transform3DCoordinate(coordinates, CUBE_CARDINAL_MOVEMENT.Z_NEG));

            if(supportingBrickIndex === -1) {
                return [ ...supportingBrickIndices ];
            }

            if(supportingBrickIndices.indexOf(supportingBrickIndex) !== -1) {
                return [ ...supportingBrickIndices ];
            }
            
            return [ ...supportingBrickIndices, supportingBrickIndex ];
        }, []);

        brickTower[ i ] = {
            belowMe: supportedBy,
            belowMeCount: supportedBy.length,
            aboveMe: [ ],
            coordinates: brickEnd,
            dangerPotential: 0
        };

        supportedBy.forEach((supportingBrick) => {
            brickTower[ supportingBrick ].aboveMe.push(i);
        });

    }

    return brickTower;
}

const findDangerBlocks = (brickTower) => {

    const dangerBlockHash = {};

    return brickTower.reduce((dangerBlocks, brickInfo) => {
        if(brickInfo.belowMeCount === 1 && !dangerBlockHash[ brickInfo.belowMe[ 0 ] ]) {
            dangerBlockHash[ brickInfo.belowMe[ 0 ] ] = true;
            return [ ...dangerBlocks, brickInfo.belowMe[ 0 ] ];
        }

        return [ ...dangerBlocks ];
    }, []);

};

////////////
// Part 1 //
////////////

export async function firstPuzzle(input) {

    const brickTower = generateBrickTower(input);

    const dangerBlocks = findDangerBlocks(brickTower);

    return { answer: brickTower.length - dangerBlocks.length, extraInfo: `Checked ${brickTower.length} total bricks` };

}


////////////
// Part 2 //
////////////

const calculateDanger = (brickTower, dangerBlockIndex) => {

    const dangerBlock = brickTower[ dangerBlockIndex ];

    let definitelyDisintegrated = [ ];
    let maybeDisintegrated = [ ...dangerBlock.aboveMe ];

    while(maybeDisintegrated.length > 0) {
        const maybeBlockIndex = maybeDisintegrated.shift();
        const maybeBlock = brickTower[ maybeBlockIndex ];

        if(maybeBlock.belowMeCount === 1 || _.without(maybeBlock.belowMe, ...disintegrated).length === 0) {
            disintegrated.push(maybeBlockIndex);
            alreadyConsideredDangerBlockIndicies[ maybeBlockIndex ] = true;

            maybeDisintegrated.push(...maybeBlock.aboveMe);

            maybeDisintegrated.sort(sortByHighestBrick);
        }

    }


};

export async function secondPuzzle(input) {

    const brickTower = generateBrickTower(input);

    const sortByBrickTopDesc = (a, b) => {
        const aTop = Math.max(brickTower[ a ].coordinates[ 0 ][ 2 ], brickTower[ a ].coordinates[ 1 ][ 2 ]);
        const bTop = Math.max(brickTower[ b ].coordinates[ 0 ][ 2 ], brickTower[ b ].coordinates[ 1 ][ 2 ]);

        return bTop - aTop;
    };

    const sortByBrickBottomHeightDesc = (brickA, brickB) => {
        const aBottom = Math.min(brickTower[ brickA ].coordinates[ 0 ][ 2 ], brickTower[ brickA ].coordinates[ 1 ][ 2 ]);
        const bBottom = Math.min(brickTower[ brickB ].coordinates[ 0 ][ 2 ], brickTower[ brickB ].coordinates[ 1 ][ 2 ]);

        return bBottom - aBottom;
    };

    const dangerBlockIndicies = findDangerBlocks(brickTower).sort(sortByBrickTopDesc);

    // mark danger potential of load-bearing blocks as undefined to differentiate them
    dangerBlockIndicies.forEach((dangerBlockIndex) => {
        brickTower[ dangerBlockIndex ].dangerPotential = undefined;
    });



    // console.log(dangerBlockIndicies.length, 'danger blocks found...\n', dangerBlockIndicies.join(', '));

    // const alreadyConsideredDangerBlockIndicies = {};

    // for(let i = 0; i < dangerBlockIndicies.length; i++) {
    //     const dangerBlockIndex = dangerBlockIndicies[ i ];
    //     const dangerBlock = brickTower[ dangerBlockIndex ];

    //     const disintegrated = [ dangerBlockIndex ];

    //     if(alreadyConsideredDangerBlockIndicies[ dangerBlockIndex ]) {
    //         continue;
    //     }

    //     alreadyConsideredDangerBlockIndicies[ dangerBlockIndex ] = true;

    //     let maybeDisentagrated = [ ...dangerBlock.aboveMe ];

    //     while(maybeDisentagrated.length > 0) {
    //         const maybeBlockIndex = maybeDisentagrated.shift();
    //         const maybeBlock = brickTower[ maybeBlockIndex ];

    //         if(maybeBlock.belowMeCount === 1 || _.without(maybeBlock.belowMe, ...disintegrated).length === 0) {
    //             disintegrated.push(maybeBlockIndex);
    //             alreadyConsideredDangerBlockIndicies[ maybeBlockIndex ] = true;

    //             maybeDisentagrated.push(...maybeBlock.aboveMe);

    //             maybeDisentagrated.sort(sortByHighestBrick);
    //         }

    //     }

    //     alreadyConsideredDangerBlockIndicies[ dangerBlockIndex ] = disintegrated.length;

    // }

    // const mostDangerous


    return { answer: brickTower.length - dangerBlockIndicies.length, extraInfo: undefined };

}


////////////
// Tests  //
////////////


export async function test(input) {

    const result = await firstPuzzle(input);

    await secondPuzzle(input);

    return {
        passed: result.answer === 5,
        extraInfo: `Expected 5, got ${result.answer}\n${result.extraInfo}`
    };

}
