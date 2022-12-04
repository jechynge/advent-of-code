export default class PerformanceTimer {
    constructor(taskName, options) {
        this.taskName = taskName;
        this.startTimestamp = options?.delayStart ? undefined : Date.now();
        this.elapsedMilliseconds = -1;
    }

    start() {
        if(this.startTimestamp !== undefined) {
            throw new Error(`Timer [${this.taskName}] was already started!`);
        }

        this.startTimestamp = Date.now();
    }

    stop() {
        if(this.startTimestamp === undefined) {
            throw new Error(`Timer [${this.taskName}] hasn't been started yet!`);
        }

        if(this.elapsedMilliseconds > -1) {
            throw new Error(`Timer [${this.taskName}] was already stopped!`);
        }

        this.elapsedMilliseconds = Date.now() - this.startTimestamp;

        return this.elapsedMilliseconds;
    }

    toString(includeName = false) {
        if(this.startTimestamp === undefined || this.elapsedMilliseconds === -1) {
            return this.taskName;
        }

        return includeName ? `${this.taskName} took ${this.elapsedMilliseconds}ms` : `${this.elapsedMilliseconds}ms`;
    }
}