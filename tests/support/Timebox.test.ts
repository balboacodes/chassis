import { expect, test, vi } from 'vitest';
import { Timebox } from '../src/Timebox';

test('executes callback', () => {
    const callback = () => expect(true);

    new Timebox().call(callback, 0);
});

test('waits for milliseconds', () => {
    const tb = new Timebox();
    // @ts-ignore
    const mock = vi.spyOn(tb, 'sleep');

    tb.call(() => {}, 10);

    expect(mock).toHaveBeenCalledOnce();
});

test('should not sleep when early return has been flagged', () => {
    const tb = new Timebox();
    // @ts-ignore
    const mock = vi.spyOn(tb, 'sleep');

    tb.call((timebox) => timebox.returnEarly(), 10);

    expect(mock).not.toHaveBeenCalled();
});

test('should sleep when dontEarlyReturn has been flagged', () => {
    const tb = new Timebox();
    // @ts-ignore
    const mock = vi.spyOn(tb, 'sleep');

    tb.call((timebox) => {
        timebox.returnEarly();
        timebox.dontReturnEarly();
    }, 10);

    expect(mock).toHaveBeenCalledOnce();
});

test('waits for milliseconds when exception is thrown', () => {
    const tb = new Timebox();
    // @ts-ignore
    const mock = vi.spyOn(tb, 'sleep');

    expect(() => {
        try {
            tb.call(() => {
                throw new Error('Exception within Timebox callback.');
            }, 10);
        } finally {
            expect(mock).toHaveBeenCalledOnce();
        }
    }).toThrow('Exception within Timebox callback.');
});

test('should not sleep when early return has been flagged and exception is thrown', () => {
    const tb = new Timebox();
    // @ts-ignore
    const mock = vi.spyOn(tb, 'sleep');

    expect(() => {
        try {
            tb.call((timebox) => {
                timebox.returnEarly();

                throw new Error('Exception within Timebox callback.');
            }, 10);
        } finally {
            expect(mock).not.toHaveBeenCalled();
        }
    }).toThrow('Exception within Timebox callback.');
});
