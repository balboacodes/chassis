import { intval } from '@balboacodes/php-utils';

export class Timebox {
    /**
     * Indicates if the timebox is allowed to return early.
     */
    public earlyReturn: boolean = false;

    /**
     * Invoke the given callback within the specified timebox minimum.
     *
     * @throws {Error} If exception occured when calling the callback.
     */
    public call<TCallReturnType>(callback: (instance: this) => TCallReturnType, milliseconds: number): TCallReturnType {
        let exception = null;
        let start = Date.now();
        let result;

        try {
            result = callback(this);
        } catch (caught: any) {
            exception = caught;
        }

        let remainder = intval(milliseconds - (Date.now() - start) * 1000); // 1000000

        if (!this.earlyReturn && remainder > 0) {
            this.sleep(remainder);
        }

        if (exception) {
            throw exception;
        }

        return result as TCallReturnType;
    }

    /**
     * Indicate that the timebox cannot return early.
     */
    public dontReturnEarly(): this {
        this.earlyReturn = false;

        return this;
    }

    /**
     * Indicate that the timebox can return early.
     */
    public returnEarly(): this {
        this.earlyReturn = true;

        return this;
    }

    /**
     * Sleep for the specified number of milliseconds.
     */
    protected sleep(milliseconds: number): void {
        const end = Date.now() + milliseconds;

        while (Date.now() < end) {
            // sleep
        }
    }
}
