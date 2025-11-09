import { Arr } from './Arr';
import { Collection } from './Collection';
import { dd } from './helpers';
import { NumberFormatter } from './NumberFormatter';

export class Benchmark {
    /**
     * Measure a callable or array of callables over the given number of iterations, then dump and die.
     */
    public static dd(
        benchmarkables: (() => any) | (() => any)[] | Record<string, () => any>,
        iterations: number = 1,
    ): void {
        const result = new Collection(Benchmark.measure(Arr.wrap(benchmarkables), iterations) as any)
            .map((average) => NumberFormatter.format(average as number, undefined, 3) + 'ms')
            .when(
                typeof benchmarkables === 'function',
                (c) => c.first(),
                (c) => c.all(),
            );

        dd(result);
    }

    /**
     * Measure a callable or array of callables over the given number of iterations.
     */
    public static measure(
        benchmarkables: Function | Function[] | Record<string, Function>,
        iterations: number = 1,
    ): number | number[] | Record<string, number> {
        return Collection.wrap(benchmarkables)
            .map((callback) => {
                return Collection.range(1, iterations)
                    .map(() => {
                        const start = Date.now();

                        callback();

                        return (Date.now() - start) / 1_000_000;
                    })
                    .avg();
            })
            .when(
                typeof benchmarkables === 'function',
                (c) => c.first(),
                (c) => c.all() as any,
            );
    }

    /**
     * Measure a callable once and return the result and duration in milliseconds.
     */
    public static value<TReturn>(callback: () => TReturn): [TReturn, number] {
        const start = Date.now();
        const result = callback();
        return [result, (Date.now() - start) / 1_000_000];
    }
}
