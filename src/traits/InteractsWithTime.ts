export class InteractsWithTime {
    /**
     * Get the number of seconds until the given Date.
     */
    protected secondsUntil(delay: Date | number): number {
        return delay instanceof Date ? Math.max(0, (delay.getTime() - this.currentTime()) * 1000) : delay;
    }

    /**
     * Get the "available at" UNIX timestamp.
     */
    protected availableAt(delay: Date | number = 0): number {
        if (delay instanceof Date) return delay.getTime() * 1000;

        const now = new Date(Date.now());
        now.setSeconds(now.getSeconds() + delay);

        return now.getTime() * 1000;
    }

    /**
     * Get the current system time as a UNIX timestamp.
     */
    protected currentTime(): number {
        return new Date(Date.now()).getTime() * 1000;
    }

    //     /**
    //      * Given a start time, format the total run time for human readability.
    //      *
    //      * @param  float  startTime
    //      * @param  float|null  endTime
    //      * @return string
    //      */
    //     protected runTimeForHumans(startTime, endTime = null)
    //     {
    //         endTime ??= microtime(true);

    //         runTime = (endTime - startTime) * 1000;

    //         return runTime > 1000
    //             ? CarbonInterval::milliseconds(runTime)->cascade()->forHumans(short: true)
    //             : number_format(runTime, 2).'ms';
    //     }
}
