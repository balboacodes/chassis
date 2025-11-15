import { expect, test } from 'vitest';
import { NumberFormatter } from '../src/NumberFormatter';

test('abbreviate', () => {
    expect(NumberFormatter.abbreviate(1)).toEqual('1');
    expect(NumberFormatter.abbreviate(1, 2)).toEqual('1.00');
    expect(NumberFormatter.abbreviate(10)).toEqual('10');
    expect(NumberFormatter.abbreviate(100)).toEqual('100');
    expect(NumberFormatter.abbreviate(1000)).toEqual('1K');
    expect(NumberFormatter.abbreviate(1000, 2)).toEqual('1.00K');
    expect(NumberFormatter.abbreviate(1000, undefined, 2)).toEqual('1K');
    expect(NumberFormatter.abbreviate(1230, undefined, 0)).toEqual('1K');
    expect(NumberFormatter.abbreviate(1230, undefined, 1)).toEqual('1.2K');
    expect(NumberFormatter.abbreviate(1000000)).toEqual('1M');
    expect(NumberFormatter.abbreviate(1000000000)).toEqual('1B');
    expect(NumberFormatter.abbreviate(1000000000000)).toEqual('1T');
    expect(NumberFormatter.abbreviate(1000000000000000)).toEqual('1Q');
    expect(NumberFormatter.abbreviate(1000000000000000000)).toEqual('1KQ');

    expect(NumberFormatter.abbreviate(123)).toEqual('123');
    expect(NumberFormatter.abbreviate(1234)).toEqual('1K');
    expect(NumberFormatter.abbreviate(1234, undefined, 2)).toEqual('1.23K');
    expect(NumberFormatter.abbreviate(12345)).toEqual('12K');
    expect(NumberFormatter.abbreviate(1234567)).toEqual('1M');
    expect(NumberFormatter.abbreviate(1234567890)).toEqual('1B');
    expect(NumberFormatter.abbreviate(1234567890123)).toEqual('1T');
    expect(NumberFormatter.abbreviate(1234567890123, undefined, 2)).toEqual('1.23T');
    expect(NumberFormatter.abbreviate(1234567890123456)).toEqual('1Q');
    expect(NumberFormatter.abbreviate(1234567890123456789, undefined, 2)).toEqual('1.23KQ');
    expect(NumberFormatter.abbreviate(489939)).toEqual('490K');
    expect(NumberFormatter.abbreviate(489939, 4)).toEqual('489.9390K');
    expect(NumberFormatter.abbreviate(500000000, 5)).toEqual('500.00000M');

    expect(NumberFormatter.abbreviate(1000000000000000000000)).toEqual('1MQ');
    expect(NumberFormatter.abbreviate(1000000000000000000000000)).toEqual('1BQ');
    expect(NumberFormatter.abbreviate(1000000000000000000000000000)).toEqual('1TQ');
    expect(NumberFormatter.abbreviate(1000000000000000000000000000000)).toEqual('1QQ');
    expect(NumberFormatter.abbreviate(1000000000000000000000000000000000)).toEqual('1KQQ');

    expect(NumberFormatter.abbreviate(0)).toEqual('0');
    expect(NumberFormatter.abbreviate(0.0)).toEqual('0');
    expect(NumberFormatter.abbreviate(0, 2)).toEqual('0.00');
    expect(NumberFormatter.abbreviate(0.0, 2)).toEqual('0.00');
    expect(NumberFormatter.abbreviate(-1)).toEqual('-1');
    expect(NumberFormatter.abbreviate(-1, 2)).toEqual('-1.00');
    expect(NumberFormatter.abbreviate(-10)).toEqual('-10');
    expect(NumberFormatter.abbreviate(-100)).toEqual('-100');
    expect(NumberFormatter.abbreviate(-1000)).toEqual('-1K');
    expect(NumberFormatter.abbreviate(-1234, undefined, 2)).toEqual('-1.23K');
    expect(NumberFormatter.abbreviate(-1234, undefined, 1)).toEqual('-1.2K');
    expect(NumberFormatter.abbreviate(-1000000)).toEqual('-1M');
    expect(NumberFormatter.abbreviate(-1000000000)).toEqual('-1B');
    expect(NumberFormatter.abbreviate(-1000000000000)).toEqual('-1T');
    expect(NumberFormatter.abbreviate(-1100000000000, undefined, 1)).toEqual('-1.1T');
    expect(NumberFormatter.abbreviate(-1000000000000000)).toEqual('-1Q');
    expect(NumberFormatter.abbreviate(-1000000000000000000)).toEqual('-1KQ');
});

test('clamp', () => {
    expect(NumberFormatter.clamp(1, 2, 3)).toEqual(2);
    expect(NumberFormatter.clamp(5, 2, 3)).toEqual(3);
    expect(NumberFormatter.clamp(5, 1, 10)).toEqual(5);
    expect(NumberFormatter.clamp(4.5, 1, 10)).toEqual(4.5);
    expect(NumberFormatter.clamp(-10, 1, 5)).toEqual(1);
});

test('currency', () => {
    expect(NumberFormatter.currency(0)).toEqual('$0.00');
    expect(NumberFormatter.currency(1)).toEqual('$1.00');
    expect(NumberFormatter.currency(10)).toEqual('$10.00');

    expect(NumberFormatter.currency(0, 'EUR')).toEqual('€0.00');
    expect(NumberFormatter.currency(1, 'EUR')).toEqual('€1.00');
    expect(NumberFormatter.currency(10, 'EUR')).toEqual('€10.00');

    expect(NumberFormatter.currency(-5)).toEqual('-$5.00');
    expect(NumberFormatter.currency(5.0)).toEqual('$5.00');
    expect(NumberFormatter.currency(5.325)).toEqual('$5.33');

    expect(NumberFormatter.currency(0, undefined, undefined, 0)).toEqual('$0');
    expect(NumberFormatter.currency(5.0, undefined, undefined, 0)).toEqual('$5');
    expect(NumberFormatter.currency(10.252, undefined, undefined, 0)).toEqual('$10');

    expect(NumberFormatter.currency(1, 'EUR', 'de')).toEqual('1,00 €');
    expect(NumberFormatter.currency(1, 'USD', 'de')).toEqual('1,00 $');
    expect(NumberFormatter.currency(1, 'GBP', 'de')).toEqual('1,00 £');

    expect(NumberFormatter.currency(123456789.12345, 'USD', 'de')).toEqual('123.456.789,12 $');
    expect(NumberFormatter.currency(123456789.12345, 'EUR', 'de')).toEqual('123.456.789,12 €');
    expect(NumberFormatter.currency(1234.56, 'USD', 'fr')).toEqual('1 234,56 $US');
});

test('defaultCurrency', () => {
    expect(NumberFormatter.defaultCurrency()).toEqual('USD');
});

test('defaultLocale', () => {
    expect(NumberFormatter.defaultLocale()).toEqual('en');
});

test('fileSize', () => {
    expect(NumberFormatter.fileSize(0)).toEqual('0 B');
    expect(NumberFormatter.fileSize(0, 2)).toEqual('0.00 B');
    expect(NumberFormatter.fileSize(1)).toEqual('1 B');
    expect(NumberFormatter.fileSize(1024)).toEqual('1 KB');
    expect(NumberFormatter.fileSize(2048)).toEqual('2 KB');
    expect(NumberFormatter.fileSize(2048, 2)).toEqual('2.00 KB');
    expect(NumberFormatter.fileSize(1264, undefined, 2)).toEqual('1.23 KB');
    expect(NumberFormatter.fileSize(1264.12345, undefined, 3)).toEqual('1.234 KB');
    expect(NumberFormatter.fileSize(1264, 3)).toEqual('1.234 KB');
    expect(NumberFormatter.fileSize(1024 * 1024 * 1024 * 5)).toEqual('5 GB');
    expect(NumberFormatter.fileSize(1024 ** 4 * 10)).toEqual('10 TB');
    expect(NumberFormatter.fileSize(1024 ** 5 * 10)).toEqual('10 PB');
    expect(NumberFormatter.fileSize(1024 ** 7)).toEqual('1 ZB');
    expect(NumberFormatter.fileSize(1024 ** 8)).toEqual('1 YB');
    expect(NumberFormatter.fileSize(1024 ** 9)).toEqual('1,024 YB');
});

test('forHumans', () => {
    expect(NumberFormatter.forHumans(1)).toEqual('1');
    expect(NumberFormatter.forHumans(1, 2)).toEqual('1.00');
    expect(NumberFormatter.forHumans(10)).toEqual('10');
    expect(NumberFormatter.forHumans(100)).toEqual('100');
    expect(NumberFormatter.forHumans(1000)).toEqual('1 thousand');
    expect(NumberFormatter.forHumans(1000, 2)).toEqual('1.00 thousand');
    expect(NumberFormatter.forHumans(1000, undefined, 2)).toEqual('1 thousand');
    expect(NumberFormatter.forHumans(1230)).toEqual('1 thousand');
    expect(NumberFormatter.forHumans(1230, undefined, 1)).toEqual('1.2 thousand');
    expect(NumberFormatter.forHumans(1000000)).toEqual('1 million');
    expect(NumberFormatter.forHumans(1000000000)).toEqual('1 billion');
    expect(NumberFormatter.forHumans(1000000000000)).toEqual('1 trillion');
    expect(NumberFormatter.forHumans(1000000000000000)).toEqual('1 quadrillion');
    expect(NumberFormatter.forHumans(1000000000000000000)).toEqual('1 thousand quadrillion');
    expect(NumberFormatter.forHumans(123)).toEqual('123');
    expect(NumberFormatter.forHumans(1234)).toEqual('1 thousand');
    expect(NumberFormatter.forHumans(1234, undefined, 2)).toEqual('1.23 thousand');
    expect(NumberFormatter.forHumans(12345)).toEqual('12 thousand');
    expect(NumberFormatter.forHumans(1234567)).toEqual('1 million');
    expect(NumberFormatter.forHumans(1234567890)).toEqual('1 billion');
    expect(NumberFormatter.forHumans(1234567890123)).toEqual('1 trillion');
    expect(NumberFormatter.forHumans(1234567890123, undefined, 2)).toEqual('1.23 trillion');
    expect(NumberFormatter.forHumans(1234567890123456)).toEqual('1 quadrillion');
    expect(NumberFormatter.forHumans(1234567890123456789, undefined, 2)).toEqual('1.23 thousand quadrillion');
    expect(NumberFormatter.forHumans(489939)).toEqual('490 thousand');
    expect(NumberFormatter.forHumans(489939, 4)).toEqual('489.9390 thousand');
    expect(NumberFormatter.forHumans(500000000, 5)).toEqual('500.00000 million');
    expect(NumberFormatter.forHumans(1000000000000000000000)).toEqual('1 million quadrillion');
    expect(NumberFormatter.forHumans(1000000000000000000000000)).toEqual('1 billion quadrillion');
    expect(NumberFormatter.forHumans(1000000000000000000000000000)).toEqual('1 trillion quadrillion');
    expect(NumberFormatter.forHumans(1000000000000000000000000000000)).toEqual('1 quadrillion quadrillion');
    expect(NumberFormatter.forHumans(1000000000000000000000000000000000)).toEqual('1 thousand quadrillion quadrillion');
    expect(NumberFormatter.forHumans(0)).toEqual('0');
    expect(NumberFormatter.forHumans(0.0)).toEqual('0');
    expect(NumberFormatter.forHumans(0, 2)).toEqual('0.00');
    expect(NumberFormatter.forHumans(0.0, 2)).toEqual('0.00');
    expect(NumberFormatter.forHumans(-1)).toEqual('-1');
    expect(NumberFormatter.forHumans(-1, 2)).toEqual('-1.00');
    expect(NumberFormatter.forHumans(-10)).toEqual('-10');
    expect(NumberFormatter.forHumans(-100)).toEqual('-100');
    expect(NumberFormatter.forHumans(-1000)).toEqual('-1 thousand');
    expect(NumberFormatter.forHumans(-1234, undefined, 2)).toEqual('-1.23 thousand');
    expect(NumberFormatter.forHumans(-1234, undefined, 1)).toEqual('-1.2 thousand');
    expect(NumberFormatter.forHumans(-1000000)).toEqual('-1 million');
    expect(NumberFormatter.forHumans(-1000000000)).toEqual('-1 billion');
    expect(NumberFormatter.forHumans(-1000000000000)).toEqual('-1 trillion');
    expect(NumberFormatter.forHumans(-1100000000000, undefined, 1)).toEqual('-1.1 trillion');
    expect(NumberFormatter.forHumans(-1000000000000000)).toEqual('-1 quadrillion');
    expect(NumberFormatter.forHumans(-1000000000000000000)).toEqual('-1 thousand quadrillion');
});

test('format', () => {
    expect(NumberFormatter.format(0)).toEqual('0');
    expect(NumberFormatter.format(0.0)).toEqual('0');
    expect(NumberFormatter.format(0.0)).toEqual('0');
    expect(NumberFormatter.format(1)).toEqual('1');
    expect(NumberFormatter.format(10)).toEqual('10');
    expect(NumberFormatter.format(25)).toEqual('25');
    expect(NumberFormatter.format(100)).toEqual('100');
    expect(NumberFormatter.format(100000)).toEqual('100,000');
    expect(NumberFormatter.format(100000, 2)).toEqual('100,000.00');
    expect(NumberFormatter.format(100000.123, 2)).toEqual('100,000.123');
    expect(NumberFormatter.format(100000.1234, undefined, 3)).toEqual('100,000.123');
    expect(NumberFormatter.format(100000.1236, undefined, 3)).toEqual('100,000.124');
    expect(NumberFormatter.format(123456789)).toEqual('123,456,789');
    expect(NumberFormatter.format(-1)).toEqual('-1');
    expect(NumberFormatter.format(-10)).toEqual('-10');
    expect(NumberFormatter.format(-25)).toEqual('-25');
    expect(NumberFormatter.format(0.2)).toEqual('0.2');
    expect(NumberFormatter.format(0.2, 2)).toEqual('0.20');
    expect(NumberFormatter.format(0.1234, undefined, 3)).toEqual('0.123');
    expect(NumberFormatter.format(1.23)).toEqual('1.23');
    expect(NumberFormatter.format(-1.23)).toEqual('-1.23');
    expect(NumberFormatter.format(123.456)).toEqual('123.456');
    expect(NumberFormatter.format(Number.POSITIVE_INFINITY)).toEqual('∞');
    expect(NumberFormatter.format(NaN)).toEqual('NaN');
    expect(NumberFormatter.format(123456789, undefined, undefined, 'en')).toEqual('123,456,789');
    expect(NumberFormatter.format(123456789, undefined, undefined, 'de')).toEqual('123.456.789');
    expect(NumberFormatter.format(123456789, undefined, undefined, 'fr')).toEqual('123 456 789');
    expect(NumberFormatter.format(123456789, undefined, undefined, 'ru')).toEqual('123 456 789');
    expect(NumberFormatter.format(123456789, undefined, undefined, 'sv')).toEqual('123 456 789');
    expect(NumberFormatter.format(123456789)).toEqual('123,456,789');

    NumberFormatter.useLocale('de');
    expect(NumberFormatter.format(123456789)).toEqual('123.456.789');
    NumberFormatter.useLocale('en');
});

test('pairs', () => {
    expect(NumberFormatter.pairs(25, 10, 0, 0)).toEqual([
        [0, 10],
        [10, 20],
        [20, 25],
    ]);
    expect(NumberFormatter.pairs(25, 10, 0, 1)).toEqual([
        [0, 9],
        [10, 19],
        [20, 25],
    ]);
    expect(NumberFormatter.pairs(25, 10, 1, 0)).toEqual([
        [1, 11],
        [11, 21],
        [21, 25],
    ]);
    expect(NumberFormatter.pairs(25, 10, 1, 1)).toEqual([
        [1, 10],
        [11, 20],
        [21, 25],
    ]);
    expect(NumberFormatter.pairs(2500, 1000, 0, 0)).toEqual([
        [0, 1000],
        [1000, 2000],
        [2000, 2500],
    ]);
    expect(NumberFormatter.pairs(2500, 1000, 0, 1)).toEqual([
        [0, 999],
        [1000, 1999],
        [2000, 2500],
    ]);
    expect(NumberFormatter.pairs(2500, 1000, 1, 0)).toEqual([
        [1, 1001],
        [1001, 2001],
        [2001, 2500],
    ]);
    expect(NumberFormatter.pairs(2500, 1000, 1, 1)).toEqual([
        [1, 1000],
        [1001, 2000],
        [2001, 2500],
    ]);
    expect(NumberFormatter.pairs(10, 2.5, 0, 0)).toEqual([
        [0, 2.5],
        [2.5, 5.0],
        [5.0, 7.5],
        [7.5, 10.0],
    ]);
    expect(NumberFormatter.pairs(10, 2.5, 0, 0.5)).toEqual([
        [0, 2.0],
        [2.5, 4.5],
        [5.0, 7.0],
        [7.5, 9.5],
    ]);
    expect(NumberFormatter.pairs(10, 2.5, 0.5, 0)).toEqual([
        [0.5, 3.0],
        [3.0, 5.5],
        [5.5, 8.0],
        [8.0, 10],
    ]);
    expect(NumberFormatter.pairs(10, 2.5, 0.5, 0.5)).toEqual([
        [0.5, 2.5],
        [3.0, 5.0],
        [5.5, 7.5],
        [8.0, 10.0],
    ]);
});

test('parse', () => {
    expect(NumberFormatter.parse('1,234')).toEqual(1234.0);
    expect(NumberFormatter.parse('1,234.5')).toEqual(1234.5);
    expect(NumberFormatter.parse('1,234.56')).toEqual(1234.56);
    expect(NumberFormatter.parse('-1,234.56')).toEqual(-1234.56);
    expect(NumberFormatter.parse('1.234,56', undefined, 'de')).toEqual(1234.56);
    expect(NumberFormatter.parse('1 234,56', undefined, 'fr')).toEqual(1234.56);
});

test('parseFloat', () => {
    expect(NumberFormatter.parseFloat('1,234')).toEqual(1234.0);
    expect(NumberFormatter.parseFloat('1,234.5')).toEqual(1234.5);
    expect(NumberFormatter.parseFloat('1,234.56')).toEqual(1234.56);
    expect(NumberFormatter.parseFloat('-1,234.56')).toEqual(-1234.56);

    expect(NumberFormatter.parseFloat('1.234,56', 'de')).toEqual(1234.56);
    expect(NumberFormatter.parseFloat('1 234,56', 'fr')).toEqual(1234.56);
});

test('parseInt', () => {
    expect(NumberFormatter.parseInt('1,234')).toEqual(1234);
    expect(NumberFormatter.parseInt('1,234.5')).toEqual(1234);
    expect(NumberFormatter.parseInt('-1,234.56')).toEqual(-1234);

    expect(NumberFormatter.parseInt('1.234', 'de')).toEqual(1234);
    expect(NumberFormatter.parseInt('1 234', 'fr')).toEqual(1234);
});

test('percentage', () => {
    expect(NumberFormatter.percentage(0)).toEqual('0%');
    expect(NumberFormatter.percentage(0)).toEqual('0%');
    expect(NumberFormatter.percentage(1)).toEqual('1%');
    expect(NumberFormatter.percentage(10, 2)).toEqual('10.00%');
    expect(NumberFormatter.percentage(100)).toEqual('100%');
    expect(NumberFormatter.percentage(100, 2)).toEqual('100.00%');
    expect(NumberFormatter.percentage(100.1234, undefined, 3)).toEqual('100.123%');

    expect(NumberFormatter.percentage(300)).toEqual('300%');
    expect(NumberFormatter.percentage(1000)).toEqual('1,000%');

    expect(NumberFormatter.percentage(1.75)).toEqual('2%');
    expect(NumberFormatter.percentage(1.75, 2)).toEqual('1.75%');
    expect(NumberFormatter.percentage(1.75, 3)).toEqual('1.750%');
    expect(NumberFormatter.percentage(0.12345)).toEqual('0%');
    expect(NumberFormatter.percentage(0, 2)).toEqual('0.00%');
    expect(NumberFormatter.percentage(0.12345, 2)).toEqual('0.12%');
    expect(NumberFormatter.percentage(0.12345, 4)).toEqual('0.1235%');
});

// prettier-ignore
test('trim', () => {
    expect(NumberFormatter.trim(12)).toEqual(12);
    expect(NumberFormatter.trim(120)).toEqual(120);
    expect(NumberFormatter.trim(12.0)).toEqual(12);
    expect(NumberFormatter.trim(12.3)).toEqual(12.3);
    expect(NumberFormatter.trim(12.30)).toEqual(12.3);
    expect(NumberFormatter.trim(12.3456789)).toEqual(12.3456789);
    expect(NumberFormatter.trim(12.34567890000)).toEqual(12.3456789);
});
