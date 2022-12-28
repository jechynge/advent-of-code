import { printResult } from '../utils/PrettyPrint.js';
import PerformanceTimer from '../utils/PerformanceTimer.js';
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

    getTimeToBuild(currentResources, resourcesPerTurn) {
        return ROBOT_TYPES.reduce((accum, robotType) => {
            let timeNeeded = 0;

            for(const [resourceType, cost] of Object.entries(this.robotCosts[robotType])) {
                if(resourcesPerTurn[resourceType] === 0) {
                    timeNeeded = -1;
                    break;
                }

                timeNeeded = Math.max(timeNeeded, Math.ceil((cost - currentResources[resourceType]) / resourcesPerTurn[resourceType]), 0);
            }

            return {
                ...accum,
                [robotType]: timeNeeded
            }
        }, {});
    }

    build(currentResources, robotType) {
        return Object.entries(currentResources).reduce((accum, [ resourceType, amount ]) => {
            accum[resourceType] = amount - (this.robotCosts[robotType][resourceType] ?? 0);

            return accum;
        }, {});
    }

    geodeHeuristic(currentGeodeCount, minutesRemaining) {
        return currentGeodeCount + ((minutesRemaining - 1) / 2) * (minutesRemaining);
    }

    findBestBuildOrder() {
        let checkedBuilds = 0;
        let mostGeodes = 0;
        let totalBuilt = {};

        const maxOreRobotsWanted = Math.max(this.robotCosts.clay.ore, this.robotCosts.obsidian.ore, this.robotCosts.geode.ore);

        console.log(`Building up to ${maxOreRobotsWanted} ore, ${this.robotCosts.obsidian.clay} clay, and ${this.robotCosts.geode.obsidian} obsidian`);

        const evaluateNextBuildStep = (currentResources, robots, minutesRemaining, waitingToPurchase = {
            ore: true,
            clay: true,
            obsidian: true,
            geode: true
        }) => {
            // If we're out of time, check our result against the best and bail out
            if(minutesRemaining === 0) {
                checkedBuilds++;

                if(currentResources.geode > mostGeodes) {
                    mostGeodes = currentResources.geode;
                    totalBuilt = {...robots};
                }

                return;
            }

            // If we can't beat the current best score assuming we could build another geode robot per turn, bail out of this branch
            if(this.geodeHeuristic(currentResources.geode, minutesRemaining) <= mostGeodes) {
                return;
            }

            const affordableRobots = this.affordableRobots(currentResources);
            const potentialNextBuilds = { ...waitingToPurchase };

            // If I can't afford anything, move on to next step
            if(Object.values(affordableRobots).every(canAfford => !canAfford) === 0) {
                evaluateNextBuildStep(this.addResources(robots, currentResources), [...robots], minutesRemaining - 1);
                return;
            }

            // If I can afford a geode-cracking robot, build it, and move on
            if(affordableRobots.geode) {
                const nextResources = this.addResources(robots, this.build(currentResources, 'geode'));
                const nextRobots = {
                    ...robots,
                    geode: robots.geode + 1
                };

                evaluateNextBuildStep(nextResources, nextRobots, minutesRemaining - 1);
                return;
            }

            let possibleBuilds = [];

            // If I can afford an geode-cracking bot...
            // if(affordableRobots.geode) {
            //     possibleBuilds.push('geode');
            // }
            
            // If I can afford an obsidian-gathering bot...
            if(affordableRobots.obsidian && robots.obsidian < this.robotCosts.geode.obsidian && waitingToPurchase.obsidian) {
                possibleBuilds.push('obsidian');
            }
            
            if(affordableRobots.clay && robots.clay < this.robotCosts.obsidian.clay && waitingToPurchase.clay) {
                possibleBuilds.push('clay');
            }

            // If I can afford an ore-drilling robot, and I only have the inital one, and I only have a few robots, try building one
            if(affordableRobots.ore && robots.ore < maxOreRobotsWanted && waitingToPurchase.ore) {
                possibleBuilds.push('ore');
            }

            // Try building each potential robot we can afford
            possibleBuilds.forEach(robotType => {
                const nextResources = this.addResources(robots, this.build(currentResources, robotType));
                const nextRobots = {
                    ...robots,
                    [robotType]: robots[robotType] + 1
                };

                evaluateNextBuildStep(nextResources, nextRobots, minutesRemaining - 1);
            });

            if(possibleBuilds.length > 0) {

            }
            evaluateNextBuildStep(this.addResources(robots, currentResources), {...robots}, minutesRemaining - 1);
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

        console.log(`produced ${mostGeodes} geodes - checked ${checkedBuilds} builds. Total robots built:`);
        Object.entries(totalBuilt).forEach(([ robotType, amount ]) => {
            console.log(`${robotType}: ${amount}`);
        })

        return mostGeodes;
    }

    timeRemaining() {
        return this.totalMinutes - this.elapsedMinutes;
    }
}

export async function puzzle1(input) {
    const timer = new PerformanceTimer('Puzzle 1');

    const blueprints = getLinesFromInput(input).map(blueprint => new Robots(blueprint));

    const qualitySum = blueprints.reduce((sum, blueprint, i) => {
        const quality = blueprint.findBestBuildOrder();

        return (quality * (i + 1)) + sum;
    }, 0);

    timer.stop();

    printResult(`Part 1 Result`, qualitySum, timer);
}


////////////
// Part 2 //
////////////


export async function puzzle2(input) {
    const timer = new PerformanceTimer('Puzzle 2');

    // ...todo

    timer.stop();

    printResult(`Part 2 Result`, null, timer);
}
