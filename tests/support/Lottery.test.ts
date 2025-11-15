import { afterEach, test, expect } from 'vitest';
import { Lottery } from '../src/Lottery';

afterEach(() => {
    Lottery.determineResultNormally();
});

test('it can win', () => {
    let wins = false;

    Lottery.odds(1, 1)
        .winner(() => (wins = true))
        .choose();

    expect(wins).toEqual(true);
});

test('it can lose', () => {
    let wins = false;
    let loses = false;

    Lottery.odds(0, 1)
        .winner(() => (wins = true))
        .loser(() => (loses = true))
        .choose();

    expect(wins).toEqual(false);
    expect(loses).toEqual(true);
});

test('it can return values', () => {
    const win = Lottery.odds(1, 1)
        .winner(() => 'win')
        .choose();

    expect(win).toEqual('win');

    const lose = Lottery.odds(0, 1)
        .loser(() => 'lose')
        .choose();

    expect(lose).toEqual('lose');
});

test('it can choose several times', () => {
    let results = Lottery.odds(1, 1)
        .winner(() => 'win')
        .choose(2);

    expect(results).toEqual(['win', 'win']);

    results = Lottery.odds(0, 1)
        .loser(() => 'lose')
        .choose(2);

    expect(results).toEqual(['lose', 'lose']);
});

test('without specified closures booleans are returned', () => {
    const win = Lottery.odds(1, 1).choose();
    expect(win).toEqual(true);

    const lose = Lottery.odds(0, 1).choose();
    expect(lose).toEqual(false);
});

test('it can force winning result in tests', () => {
    let result = null;

    Lottery.alwaysWin(() => {
        result = Lottery.odds(1, 2)
            .winner(() => 'winner')
            .choose(10);
    });

    // prettier-ignore
    expect(result).toEqual([
        'winner', 'winner', 'winner', 'winner', 'winner', 'winner', 'winner', 'winner', 'winner', 'winner',
    ]);
});

test('it can force losing result in tests', () => {
    let result = null;
    Lottery.alwaysLose(() => {
        result = Lottery.odds(1, 2)
            .loser(() => 'loser')
            .choose(10);
    });

    // prettier-ignore
    expect(result).toEqual([
        'loser', 'loser', 'loser', 'loser', 'loser', 'loser', 'loser', 'loser', 'loser', 'loser',
    ]);
});

test('it can force the result via sequence', () => {
    let result = null;

    Lottery.forceResultWithSequence([true, false, true, false, true, false, true, false, true, false]);

    result = Lottery.odds(1, 100)
        .winner(() => 'winner')
        .loser(() => 'loser')
        .choose(10);

    // prettier-ignore
    expect(result).toEqual([
        'winner', 'loser', 'winner', 'loser', 'winner', 'loser', 'winner', 'loser', 'winner', 'loser',
    ]);
});

test('it can handle missing sequence items', () => {
    let result = null;

    Lottery.forceResultWithSequence(
        {
            0: true,
            1: true,
            // 2: ...
            3: true,
        },
        () => {
            throw new Error('Missing key in sequence.');
        },
    );

    result = Lottery.odds(1, 10000)
        .winner(() => 'winner')
        .loser(() => 'loser')
        .choose();

    expect(result).toEqual('winner');

    result = Lottery.odds(1, 10000)
        .winner(() => 'winner')
        .loser(() => 'loser')
        .choose();

    expect(result).toEqual('winner');

    expect(() =>
        Lottery.odds(1, 10000)
            .winner(() => 'winner')
            .loser(() => 'loser')
            .choose(),
    ).toThrow('Missing key in sequence.');
});

test('it throws for floats over one', () => {
    expect(() => new Lottery(1.1)).toThrow('Chances must not be greater than 1.');
});

test('it throws for out of less than one', () => {
    expect(() => new Lottery(1, 0)).toThrow('Lottery "out of" value must be greater than or equal to 1.');
});

test('it can win with float', () => {
    let wins = false;

    Lottery.odds(1.0)
        .winner(() => {
            wins = true;
        })
        .choose();

    expect(wins).toEqual(true);
});

test('it can lose with float', () => {
    let wins = false;
    let loses = false;

    Lottery.odds(0.0)
        .winner(() => (wins = true))
        .loser(() => (loses = true))
        .choose();

    expect(wins).toEqual(false);
    expect(loses).toEqual(true);
});
