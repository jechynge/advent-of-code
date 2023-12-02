import { getLinesFromInput } from '../utils/Input.js';


////////////
// Part 1 //
////////////


const ROBOT_TYPES = ['ore', 'clay', 'obsidian', 'geode'];

class Robots {
    constructor(blueprint, totalMinutes = 24) {
        const robotCosts = /^Blueprint \d+: Each ore robot costs (\d+) ore. Each clay robot costs (\d+) ore. Each obsidian robot costs (\d+) ore and (\d+) clay. Each geode robot costs (\d+) ore and (\d+) obsidian.$/.exec(blueprint).slice(1).map(s => parseInt(s));

        this.robotCosts = {
            ore: {
                ore: robotCosts[0]
            },
            clay: {
                ore: robotCosts[1]
            },
            obsidian: {
                ore: robotCosts[2],
                clay: robotCosts[3]
            },
            geode: {
                ore: robotCosts[4],
                obsidian: robotCosts[5]
            }
        };

        this.totalMinutes = totalMinutes;
    }

    getResourcesPerTurn(robots) {
        return this.addResources(robots)
    }

    addResources(robots, currentResources = {}) {
        return Object.entries(robots).reduce((newResources, [robotType, robotCount]) => {
            newResources[robotType] += robotCount;

            return newResources;
        }, {
            ore: 0,
            clay: 0,
            obsidian: 0,
            geode: 0,
            ...currentResources
        });
    }

    affordableRobots(currentResources) {
        return Object.entries(this.robotCosts).reduce((accum, [ robotType, resourceCosts ]) => {
            accum[robotType] = Object.entries(resourceCosts).every(([ resource, cost ]) => {
                return currentResources[resource] >= cost;
            });

            return accum;
        }, {});
    }

    build(currentResources, robotType) {
        return Object.entries(currentResources).reduce((accum, [ resourceType, amount ]) => {
            accum[resourceType] = amount - (this.robotCosts[robotType][resourceType] ?? 0);

            return accum;
        }, {});
    }

    /*
     * Assuming the best case scenario is that we can build 1 geode-cracking bot every minute until time expires, how many geodes would we have
     *
     * If minutesRemaining = 6, for example:
     * 
     * Minute 6: Build 1 geode bot, crack 0 geodes, have  0 geodes
     * Minute 5: Build 1 geode bot, crack 1 geodes, have  1 geodes
     * Minute 4: Build 1 geode bot, crack 2 geodes, have  3 geodes
     * Minute 3: Build 1 geode bot, crack 3 geodes, have  6 geodes
     * Minute 2: Build 1 geode bot, crack 4 geodes, have 10 geodes
     * Minute 1: Build 1 geode bot, crack 5 geodes, have 15 geodes
     */
    geodeHeuristic(currentGeodeCount, geodeRobotCount, minutesRemaining) {
        return currentGeodeCount + (geodeRobotCount * minutesRemaining) + ((minutesRemaining - 1) / 2) * (minutesRemaining);
    }

    findBestBuildOrder() {
        let mostGeodes = 0;

        const maxOreRobotsWanted = Math.max(this.robotCosts.clay.ore, this.robotCosts.obsidian.ore, this.robotCosts.geode.ore);

        const evaluateNextBuildStep = (currentResources, robots, minutesRemaining, skippedBuilds) => {
            // If we're out of time, check our result against the best and bail out
            if(minutesRemaining === 0) {
                if(currentResources.geode > mostGeodes) {
                    mostGeodes = currentResources.geode;
                }

                return;
            }

            // If we can't beat the current best score assuming we could build another geode robot per turn, bail out of this branch
            if(this.geodeHeuristic(currentResources.geode, robots.geode, minutesRemaining) < mostGeodes) {
                return;
            }

            const possibleBuilds = [];

            const affordableRobots = this.affordableRobots(currentResources);
            const nextResources = this.addResources(robots, currentResources);

            // If I can afford a geode-cracking robot, build it, and move on
            if(affordableRobots.geode) {
                const nextRobots = {
                    ...robots,
                    geode: robots.geode + 1
                };

                return evaluateNextBuildStep(this.build(nextResources, 'geode'), nextRobots, minutesRemaining - 1);
            }


            // If I can afford an geode-cracking bot...
            if(affordableRobots.geode) {
                possibleBuilds.push('geode');
            }
            
            // If I can afford an obsidian-gathering bot...
            if(affordableRobots.obsidian && robots.obsidian < this.robotCosts.geode.obsidian && !skippedBuilds?.obsidian) {
                possibleBuilds.push('obsidian');
            }
            
            if(affordableRobots.clay && robots.clay < this.robotCosts.obsidian.clay && !skippedBuilds?.clay) {
                possibleBuilds.push('clay');
            }

            // If I can afford an ore-drilling robot, and I only have the inital one, and I only have a few robots, try building one
            if(affordableRobots.ore && robots.ore < maxOreRobotsWanted && !skippedBuilds?.ore) {
                possibleBuilds.push('ore');
            }

            // Try building each potential robot we can afford
            possibleBuilds.forEach(robotType => {
                const nextRobots = {
                    ...robots,
                    [robotType]: robots[robotType] + 1
                };

                evaluateNextBuildStep(this.build(nextResources, robotType), nextRobots, minutesRemaining - 1);
            });

            evaluateNextBuildStep(nextResources, {...robots}, minutesRemaining - 1, {...affordableRobots});
        }

        const startingResources = {
            ore: 0,
            clay: 0,
            obsidian: 0,
            geode: 0
        };

        const startingRobots = {
            ore: 1,
            clay: 0,
            obsidian: 0,
            geode: 0
        }

        evaluateNextBuildStep(startingResources, startingRobots, this.totalMinutes);

        return mostGeodes;
    }
}

export async function firstPuzzle(input) {

    const blueprints = getLinesFromInput(input).map(blueprint => new Robots(blueprint));

    const qualitySum = blueprints.reduce((sum, blueprint, i) => {
        const quality = blueprint.findBestBuildOrder();

        return (quality * (i + 1)) + sum;
    }, 0);

    return { answer: qualitySum };

}


////////////
// Part 2 //
////////////


export async function secondPuzzle(input) {

    const blueprints = getLinesFromInput(input).slice(0,3).map(blueprint => new Robots(blueprint, 32));

    const qualityProduct = blueprints.reduce((product, blueprint) => {
        const quality = blueprint.findBestBuildOrder();

        return quality * product;
    }, 1);

    return { answer: qualityProduct };

}
