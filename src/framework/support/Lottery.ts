import { random_int } from '@balboacodes/php-utils';

export class Lottery {
    /**
     * The number of expected wins.
     */
    protected chances: number;

    /**
     * The losing callback.
     */
    protected loserFn?: Function;

    /**
     * The number of potential opportunities to win.
     */
    protected outOf?: number;

    /**
     * The factory that should be used to generate results.
     */
    protected static resultFactoryFn?: Function;

    /**
     * The winning callback.
     */
    protected winnerFn?: Function;

    /**
     * Create a new Lottery instance.
     */
    public constructor(chances: number, outOf?: number) {
        if (outOf === undefined && !Number.isInteger(chances) && chances > 1) {
            throw new Error('Chances must not be greater than 1.');
        }

        if (outOf !== undefined && outOf < 1) {
            throw new Error('Lottery "out of" value must be greater than or equal to 1.');
        }

        this.chances = chances;
        this.outOf = outOf;
    }

    /**
     * Force the lottery to always result in a lose.
     */
    public static alwaysLose(callback?: Function): void {
        Lottery.setResultFactory(() => false);

        if (callback === undefined) {
            return;
        }

        callback();

        Lottery.determineResultNormally();
    }

    /**
     * Force the lottery to always result in a win.
     */
    public static alwaysWin(callback?: Function): void {
        Lottery.setResultFactory(() => true);

        if (callback === undefined) {
            return;
        }

        callback();

        Lottery.determineResultNormally();
    }

    /**
     * Run the lottery.
     */
    public choose(times?: number): any {
        if (times === undefined) {
            return this.runCallback();
        }

        const results = [];

        for (let i = 0; i < times; i++) {
            results.push(this.runCallback());
        }

        return results;
    }

    /**
     * Indicate that the lottery results should be determined normally.
     */
    public static determineResultNormally(): void {
        Lottery.resultFactoryFn = undefined;
    }

    /**
     * Indicate that the lottery results should be determined normally.
     */
    public static determineResultsNormally(): void {
        Lottery.determineResultNormally();
    }

    /**
     * Set the sequence that will be used to determine lottery results.
     */
    public static fix(sequence: any[], whenMissing?: Function): void {
        Lottery.forceResultWithSequence(sequence, whenMissing);
    }

    /**
     * Set the sequence that will be used to determine lottery results.
     */
    public static forceResultWithSequence(sequence: boolean[] | Record<string, boolean>, whenMissing?: Function): void {
        let next = 0;

        whenMissing ??= (chances: number, outOf?: number) => {
            const factoryCache = Lottery.resultFactoryFn;

            Lottery.resultFactoryFn = undefined;

            const result = Lottery.resultFactory()(chances, outOf);

            Lottery.resultFactoryFn = factoryCache;

            next++;

            return result;
        };

        Lottery.setResultFactory((chances: number, outOf?: number) => {
            if (Object.hasOwn(sequence, next)) {
                return (sequence as any)[next++];
            }

            return whenMissing(chances, outOf);
        });
    }

    /**
     * Set the loser callback.
     */
    public loser(callback: Function): this {
        this.loserFn = callback;

        return this;
    }

    /**
     * Create a new Lottery instance.
     */
    public static odds(chances: number, outOf?: number): Lottery {
        return new Lottery(chances, outOf);
    }

    /**
     * Set the factory that should be used to determine the lottery results.
     */
    public static setResultFactory(factory: Function): void {
        Lottery.resultFactoryFn = factory;
    }

    /**
     * Set the winner callback.
     */
    public winner(callback: Function): this {
        this.winnerFn = callback;

        return this;
    }

    /**
     * The factory that determines the lottery result.
     */
    protected static resultFactory(): Function {
        return (
            Lottery.resultFactoryFn ??
            ((chances: number, outOf?: number) =>
                outOf === undefined
                    ? random_int(0, Number.MAX_SAFE_INTEGER) / Number.MAX_SAFE_INTEGER <= chances
                    : random_int(1, outOf) <= chances)
        );
    }

    /**
     * Run the winner or loser callback, randomly.
     */
    protected runCallback(...args: any[]): boolean {
        return this.wins() ? (this.winnerFn ?? (() => true))(...args) : (this.loserFn ?? (() => false))(...args);
    }

    /**
     * Determine if the lottery "wins" or "loses".
     */
    protected wins(): boolean {
        return Lottery.resultFactory()(this.chances, this.outOf);
    }
}
