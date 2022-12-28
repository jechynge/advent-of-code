export default class PerformanceTimer {
    constructor(taskName, options) {
        this.taskName = taskName;
        this.startTimestamp = options?.delayStart ? undefined : Date.now();
        this.elapsedMilliseconds = 0;
    }

    start() {
        this.startTimestamp = Date.now();
    }

    stop() {
        if(this.startTimestamp === undefined) {
            throw new Error(`Timer [${this.taskName}] hasn't been started yet!`);
        }

        this.elapsedMilliseconds += Date.now() - this.startTimestamp;

        return this.elapsedMilliseconds;
    }

    toString(includeName = false) {
        if(this.startTimestamp === undefined || this.elapsedMilliseconds === 0) {
            return this.taskName;
        }

        return includeName ? `${this.taskName} took ${this.elapsedMilliseconds}ms` : `${this.elapsedMilliseconds}ms`;
    }
}