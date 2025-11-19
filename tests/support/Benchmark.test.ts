import { expect, test } from 'vitest';
import { Arr } from '../src/Arr';
import { Benchmark } from '../src/Benchmark';

test('measure', () => {
    expect(Benchmark.measure(() => 1 + 1)).toBeTypeOf('number');
    expect(
        Arr.accessible(
            Benchmark.measure(
                {
                    first: () => 1 + 1,
                    second: () => 2 + 2,
                },
                3,
            ),
        ),
    ).toEqual(true);
});

test('value', () => {
    expect(Arr.accessible(Benchmark.value(() => 1 + 1))).toEqual(true);
});
