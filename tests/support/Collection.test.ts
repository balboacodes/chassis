import { array_keys, isset, range, SORT_NATURAL, SORT_STRING, strnatcasecmp } from '@balboacodes/php-utils';
import { expect, test } from 'vitest';
import { Arr } from '../src/Arr';
import { Collection } from '../src/Collection';
import { collect } from '../src/helpers';

enum StaffEnum {
    Taylor = 'Taylor',
    Joe = 'Joe',
    James = 'James',
}

enum TestBackedEnum {
    A = 1,
    B = 2,
}

enum TestStringBackedEnum {
    A = 'A',
    B = 'B',
}

class TestCollectionMapIntoObject {
    public value: any;

    public constructor(value: any) {
        this.value = value;
    }
}

test('constructor', () => {
    let c: Collection<any, any> = new Collection(undefined);
    expect(c.all()).toEqual([]);

    c = new Collection();
    expect(c.all()).toEqual([]);

    const firstCollection = new Collection({ foo: 'bar' });
    const secondCollection = new Collection(firstCollection);

    expect(secondCollection.all()).toEqual({ foo: 'bar' });
});

test('after', () => {
    let c: any = new Collection({ 0: 1, 1: 2, 2: 3, 3: 4, 4: 2, 5: 2, 6: 5, name: 'taylor', framework: 'laravel' });
    expect(c.after(1)).toEqual(2);
    expect(c.after(2)).toEqual(3);
    expect(c.after(3)).toEqual(4);
    expect(c.after(4)).toEqual(2);
    expect(c.after(5)).toEqual('taylor');
    expect(c.after('taylor')).toEqual('laravel');
    expect(c.after((value: any) => value > 2)).toEqual(4);
    expect(c.after((value: any) => isNaN(Number(value)))).toEqual('laravel');

    c = new Collection([false, 0, 1, [], '']);
    expect(c.after('false', true)).toEqual(null);
    expect(c.after('1', true)).toEqual(null);
    expect(c.after('', true)).toEqual(null);
    expect(c.after(false, true)).toEqual(0);
    expect(c.after(1, true)).toEqual([]);
    expect(c.after([], true)).toEqual(null);

    c = new Collection([false, 0, 1, [], '']);
    expect(c.after(6)).toEqual(null);
    expect(c.after('foo')).toEqual(null);
    expect(c.after((value: any) => value < 1 && !isNaN(Number(value)))).toEqual(0);
    expect(c.after((value: any) => value === 'nope')).toEqual(null);

    c = new Collection({ 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, foo: 'bar' });
    expect(c.after('bar')).toEqual(null);
    expect(c.after((value: any) => value > 4 && isNaN(Number(value)))).toEqual(null);

    c = new Collection({ foo: 'bar', 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 });
    expect(c.after(5)).toEqual('bar');
});

test('avg', () => {
    let c: any = new Collection([{ foo: 10 }, { foo: 20 }]);
    expect(c.avg((item: any) => item.foo)).toEqual(15);
    expect(c.avg('foo')).toEqual(15);

    c = new Collection([{ foo: 10 }, { foo: 20 }, { foo: null }]);
    expect(c.avg((item: any) => item.foo)).toEqual(15);
    expect(c.avg('foo')).toEqual(15);

    c = new Collection([{ foo: 10 }, { foo: 20 }]);
    expect(c.avg('foo')).toEqual(15);

    c = new Collection([1, 2, 3, 4, 5]);
    expect(c.avg()).toEqual(3);

    c = new Collection();
    expect(c.avg()).toEqual(null);

    c = new Collection([{ foo: '4' }, { foo: '2' }]);
    expect(c.avg('foo')).toBeTypeOf('number');
    expect(c.avg('foo')).toEqual(3);

    c = new Collection([{ foo: 1 }, { foo: 2 }]);
    expect(Number.isInteger(c.avg('foo'))).toEqual(false);
    expect(c.avg('foo')).toEqual(1.5);

    c = new Collection([{ foo: 1 }, { foo: 2 }, { foo: 6 }]);
    expect(c.avg('foo')).toEqual(3);

    c = new Collection([0]);
    expect(c.avg()).toEqual(0);
});

test('before', () => {
    let c: any = new Collection({ 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 2, 6: 5, name: 'taylor', framework: 'laravel' });
    expect(c.before(2)).toEqual(1);
    expect(c.before('2')).toEqual(1);
    expect(c.before('taylor')).toEqual(5);
    expect(c.before('laravel')).toEqual('taylor');
    expect(c.before((value: any) => value > 4)).toEqual(4);
    expect(c.before((value: any) => isNaN(Number(value)))).toEqual(5);

    c = new Collection([false, 0, 1, [], '']);
    expect(c.before('false', true)).toEqual(null);
    expect(c.before('1', true)).toEqual(null);
    expect(c.before(false, true)).toEqual(null);
    expect(c.before(0, true)).toEqual(false);
    expect(c.before(1, true)).toEqual(0);
    expect(c.before([], true)).toEqual(null);
    expect(c.before('', true)).toEqual([]);

    c = new Collection({ 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, foo: 'bar' });
    expect(c.before(6)).toEqual(null);
    expect(c.before('foo')).toEqual(null);
    expect(c.before((value: any) => value < 1 && !isNaN(Number(value)))).toEqual(null);
    expect(c.before((value: any) => value === 'nope')).toEqual(null);

    c = new Collection({ 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, foo: 'bar' });
    expect(c.before(1)).toEqual(null);
    expect(c.before((value: any) => value < 2 && !isNaN(Number(value)))).toEqual(null);

    c = new Collection({ foo: 'bar', 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 });
    expect(c.before('bar')).toEqual(5);
});

test('chunk', () => {
    let data: any = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    data = data.chunk(3);
    expect(data).toBeInstanceOf(Collection);
    expect(data.first()).toBeInstanceOf(Collection);
    expect(data.count()).toEqual(4);
    expect(data.first().toArray()).toEqual([1, 2, 3]);
    expect(data.get(3).toArray()).toEqual([10]);

    data = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(data.chunk(0).toArray()).toEqual([]);

    data = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(data.chunk(-1).toArray()).toEqual([]);

    data = new Collection({ a: 1, b: 2, c: 3, d: 4, e: 5 });
    expect(data.chunk(2).toArray()).toEqual([{ a: 1, b: 2 }, { c: 3, d: 4 }, { e: 5 }]);

    data = new Collection([1, 2, 3, 4, 5]);
    expect(data.chunk(2, false).toArray()).toEqual([[1, 2], [3, 4], [5]]);
});

test('collapse', () => {
    // Normal case: a two-dimensional array with different elements
    const object1 = {};
    const object2 = {};
    let c: Collection<any, any> = new Collection([[object1], [object2]]);
    expect(c.collapse().all()).toEqual([object1, object2]);

    // Case including numeric and string elements
    c = new Collection([[1], [2], [3], ['foo', 'bar'], new Collection(['baz', 'boom']).all()]);
    expect(c.collapse().all()).toEqual([1, 2, 3, 'foo', 'bar', 'baz', 'boom']);

    // Case with empty two-dimensional arrays
    c = new Collection([[], [], []]);
    expect(c.collapse().all()).toEqual([]);

    // Case with both empty arrays and arrays with elements
    c = new Collection([[], [1, 2], [], ['foo', 'bar']]);
    expect(c.collapse().all()).toEqual([1, 2, 'foo', 'bar']);

    // Case including collections and arrays
    const collection = new Collection(['baz', 'boom']);
    c = new Collection([[1], [2], [3], ['foo', 'bar'], collection.all()]);
    expect(c.collapse().all()).toEqual([1, 2, 3, 'foo', 'bar', 'baz', 'boom']);

    c = new Collection([new Collection([1, 2, 3]).all(), new Collection([4, 5, 6]).all()]);
    expect(c.collapse().all()).toEqual([1, 2, 3, 4, 5, 6]);
});

test('collapseWithKeys', () => {
    let c: Collection<any, any> = new Collection([{ 1: 'a' }, { 3: 'c' }, { 2: 'b' }, 'drop']);
    expect(c.collapseWithKeys().all()).toEqual({ 1: 'a', 3: 'c', 2: 'b' });

    // Case with an already flat collection
    c = new Collection(['a', 'b', 'c']);
    expect(c.collapseWithKeys().all()).toEqual([]);

    c = new Collection([new Collection({ a: '1a', b: '1b' }), new Collection({ b: '2b', c: '2c' }), 'drop']);
    expect(c.collapseWithKeys().all()).toEqual({ a: '1a', b: '2b', c: '2c' });
});

test('collect', () => {
    const data = Collection.make({ a: 1, b: 2, c: 3 }).collect();
    expect(data).toBeInstanceOf(Collection);
    expect(data.all()).toEqual({ a: 1, b: 2, c: 3 });
});

test('combine', () => {
    let c: Collection<any, any> = new Collection([1, 2, 3]);
    let actual: any = c.combine([4, 5, 6]).toArray();
    let expected: any = { 1: 4, 2: 5, 3: 6 };
    expect(actual).toEqual(expected);

    c = new Collection(['name', 'family']);
    actual = c.combine({ 1: 'taylor', 2: 'otwell' }).toArray();
    expected = {
        name: 'taylor',
        family: 'otwell',
    };
    expect(actual).toEqual(expected);

    c = new Collection({ 1: 'name', 2: 'family' });
    actual = c.combine(['taylor', 'otwell']).toArray();
    expected = {
        name: 'taylor',
        family: 'otwell',
    };
    expect(actual).toEqual(expected);

    c = new Collection({ 1: 'name', 2: 'family' });
    actual = c.combine({ 2: 'taylor', 3: 'otwell' }).toArray();
    expected = {
        name: 'taylor',
        family: 'otwell',
    };
    expect(actual).toEqual(expected);

    expected = { 1: 4, 2: 5, 3: 6 };
    const keyCollection = new Collection(array_keys(expected));
    const valueCollection = new Collection(Object.values(expected));
    actual = keyCollection.combine(valueCollection).toArray();
    expect(actual).toEqual(expected);
});

test('concat', () => {
    let expected = [4, 5, 6, 'a', 'b', 'c', 'Jonny', 'from', 'Laroe', 'Jonny', 'from', 'Laroe'];
    let data: any = new Collection([4, 5, 6]);
    data = data.concat(['a', 'b', 'c']);
    data = data.concat({ who: 'Jonny', preposition: 'from', where: 'Laroe' });
    let actual = data.concat({ who: 'Jonny', preposition: 'from', where: 'Laroe' }).toArray();
    expect(actual).toEqual(expected);

    expected = [4, 5, 6, 'a', 'b', 'c', 'Jonny', 'from', 'Laroe', 'Jonny', 'from', 'Laroe'];
    let firstCollection: any = new Collection([4, 5, 6]);
    const secondCollection = new Collection(['a', 'b', 'c']);
    const thirdCollection = new Collection({ who: 'Jonny', preposition: 'from', where: 'Laroe' });
    firstCollection = firstCollection.concat(secondCollection);
    firstCollection = firstCollection.concat(thirdCollection);
    actual = firstCollection.concat(thirdCollection).toArray();
    expect(actual).toEqual(expected);
});

test('contains', () => {
    let c: Collection<any, any> = new Collection([1, 3, 5]);
    expect(c.contains(1)).toEqual(true);
    expect(c.contains('1')).toEqual(true);
    expect(c.contains(2)).toEqual(false);
    expect(c.contains('2')).toEqual(false);

    c = new Collection(['1']);
    expect(c.contains('1')).toEqual(true);
    expect(c.contains(1)).toEqual(true);

    c = new Collection([false]);
    expect(c.contains(false)).toEqual(true);
    expect(c.contains(null)).toEqual(false);
    expect(c.contains([])).toEqual(false);
    expect(c.contains(0)).toEqual(true);
    expect(c.contains('')).toEqual(true);

    c = new Collection([0]);
    expect(c.contains(0)).toEqual(true);
    expect(c.contains('0')).toEqual(true);
    expect(c.contains(false)).toEqual(true);
    expect(c.contains(null)).toEqual(false);
    expect(c.contains((value: number) => value < 5)).toEqual(true);
    expect(c.contains((value: number) => value > 5)).toEqual(false);

    c = new Collection([{ v: 1 }, { v: 3 }, { v: 5 }]);
    expect(c.contains('v', 1)).toEqual(true);
    expect(c.contains('v', 2)).toEqual(false);

    c = new Collection(['date', 'class', { foo: 50 }]);
    expect(c.contains('date')).toEqual(true);
    expect(c.contains('class')).toEqual(true);
    expect(c.contains('foo')).toEqual(false);

    c = new Collection([null, 1, 2]);
    expect(c.contains((value: number | null) => value === null)).toEqual(true);

    c = new Collection([{ v: 1 }, { v: 3 }, { v: '4' }, { v: 5 }]);
    expect(c.contains('v', '=', 4)).toEqual(true);
    expect(c.contains('v', '==', 4)).toEqual(true);
    expect(c.contains('v', '===', 4)).toEqual(false);
    expect(c.contains('v', '>', 4)).toEqual(true);
});

test('containsOneItem', () => {
    expect(new Collection([]).containsOneItem()).toEqual(false);
    expect(new Collection([1]).containsOneItem()).toEqual(true);
    expect(new Collection([1, 2]).containsOneItem()).toEqual(false);

    expect(collect([1, 2, 2]).containsOneItem((number) => number === 2)).toEqual(false);
    expect(collect(['ant', 'bear', 'cat']).containsOneItem((word) => word.length === 4)).toEqual(true);
    expect(collect(['ant', 'bear', 'cat']).containsOneItem((word) => word.length > 4)).toEqual(false);
});

test('containsStrict', () => {
    let c: Collection<any, any> = new Collection([1, 3, 5]);
    expect(c.containsStrict(1)).toEqual(true);
    expect(c.containsStrict('1')).toEqual(false);
    expect(c.containsStrict(2)).toEqual(false);
    expect(c.containsStrict('02')).toEqual(false);
    expect(c.containsStrict(true)).toEqual(false);
    expect(c.containsStrict((value: number) => value < 5)).toEqual(true);
    expect(c.containsStrict((value: number) => value > 5)).toEqual(false);

    c = new Collection([0]);
    expect(c.containsStrict(0)).toEqual(true);
    expect(c.containsStrict('0')).toEqual(false);
    expect(c.containsStrict(false)).toEqual(false);
    expect(c.containsStrict(null)).toEqual(false);

    c = new Collection([1, null]);
    expect(c.containsStrict(null)).toEqual(true);
    expect(c.containsStrict(0)).toEqual(false);
    expect(c.containsStrict(false)).toEqual(false);

    c = new Collection([{ v: 1 }, { v: 3 }, { v: '4' }, { v: 5 }]);
    expect(c.containsStrict('v', 1)).toEqual(true);
    expect(c.containsStrict('v', 2)).toEqual(false);
    expect(c.containsStrict('v', '1')).toEqual(false);
    expect(c.containsStrict('v', 4)).toEqual(false);
    expect(c.containsStrict('v', '04')).toEqual(false);

    c = new Collection(['date', 'class', { foo: 50 }, '']);
    expect(c.containsStrict('date')).toEqual(true);
    expect(c.containsStrict('class')).toEqual(true);
    expect(c.containsStrict('foo')).toEqual(false);
    expect(c.containsStrict(null)).toEqual(false);
    expect(c.containsStrict('')).toEqual(true);
});

test('crossJoin', () => {
    // Cross join with an array
    expect(new Collection([1, 2]).crossJoin(['a', 'b']).all()).toEqual([
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]);

    // Cross join with a collection
    expect(new Collection([1, 2]).crossJoin(new Collection(['a', 'b'])).all()).toEqual([
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]);

    // Cross join with 2 collections
    expect(new Collection([1, 2]).crossJoin(new Collection(['a', 'b']), new Collection(['I', 'II'])).all()).toEqual([
        [1, 'a', 'I'],
        [1, 'a', 'II'],
        [1, 'b', 'I'],
        [1, 'b', 'II'],
        [2, 'a', 'I'],
        [2, 'a', 'II'],
        [2, 'b', 'I'],
        [2, 'b', 'II'],
    ]);
});

test('diff', () => {
    const c = new Collection({ id: 1, first_word: 'Hello' });
    expect(c.diff(new Collection({ first_word: 'Hello', last_word: 'World' }) as any).all()).toEqual({ id: 1 });
});

test('diffAssoc', () => {
    const c1 = new Collection({ id: 1, first_word: 'Hello', not_affected: 'value' });
    const c2 = new Collection({ id: 123, foo_bar: 'Hello', not_affected: 'value' });
    expect(c1.diffAssoc(c2 as any).all()).toEqual({ id: 1, first_word: 'Hello' });
});

test('diffAssocUsing', () => {
    const c1 = new Collection({ a: 'green', b: 'brown', c: 'blue', 0: 'red' });
    const c2 = new Collection({ A: 'green', 0: 'yellow', 1: 'red' });

    // demonstrate that the case of the keys will affect the output when diffAssoc is used
    expect(c1.diffAssoc(c2 as any).all()).toEqual({ a: 'green', b: 'brown', c: 'blue', 0: 'red' });

    // allow for case insensitive difference
    const strcasecmp = (a: string, b: string) => {
        a = a.toLowerCase();
        b = b.toLowerCase();

        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        }

        return 0;
    };
    expect(c1.diffAssocUsing(c2 as any, strcasecmp as any).all()).toEqual({ b: 'brown', c: 'blue', 0: 'red' });
});

test('diffKeys', () => {
    const c1 = new Collection({ id: 1, first_word: 'Hello' });
    const c2 = new Collection({ id: 123, foo_bar: 'Hello' });
    expect(c1.diffKeys(c2 as any).all()).toEqual({ first_word: 'Hello' });
});

test('doesntContain', () => {
    let c: any = new Collection([1, 3, 5]);
    expect(c.doesntContain(1)).toEqual(false);
    expect(c.doesntContain('1')).toEqual(false);
    expect(c.doesntContain(2)).toEqual(true);
    expect(c.doesntContain('2')).toEqual(true);

    c = new Collection(['1']);
    expect(c.doesntContain('1')).toEqual(false);
    expect(c.doesntContain(1)).toEqual(false);

    c = new Collection([0]);
    expect(c.doesntContain(false)).toEqual(false);
    expect(c.doesntContain(null)).toEqual(true);
    expect(c.doesntContain([])).toEqual(true);
    expect(c.doesntContain(0)).toEqual(false);
    expect(c.doesntContain('')).toEqual(false);

    c = new Collection([0]);
    expect(c.doesntContain(0)).toEqual(false);
    expect(c.doesntContain('0')).toEqual(false);
    expect(c.doesntContain(false)).toEqual(false);
    expect(c.doesntContain(null)).toEqual(true);
    expect(c.doesntContain((value: number) => value < 5)).toEqual(false);
    expect(c.doesntContain((value: number) => value > 5)).toEqual(true);

    c = new Collection([{ v: 1 }, { v: 3 }, { v: 5 }]);
    expect(c.doesntContain('v', 1)).toEqual(false);
    expect(c.doesntContain('v', 2)).toEqual(true);

    c = new Collection(['date', 'class', { foo: 50 }]);
    expect(c.doesntContain('date')).toEqual(false);
    expect(c.doesntContain('class')).toEqual(false);
    expect(c.doesntContain('foo')).toEqual(true);

    c = new Collection([null, 1, 2]);
    expect(c.doesntContain((value: number | null) => value === null)).toEqual(false);
});

test('doesntContainStrict', () => {
    let c: any = new Collection([1, 3, 5, '02']);
    expect(c.doesntContainStrict(1)).toEqual(false);
    expect(c.doesntContainStrict('1')).toEqual(true);
    expect(c.doesntContainStrict(2)).toEqual(true);
    expect(c.doesntContainStrict('02')).toEqual(false);
    expect(c.doesntContainStrict('2')).toEqual(true);
    expect(c.doesntContainStrict(true)).toEqual(true);
    expect(c.doesntContainStrict((value: number) => value < 5)).toEqual(false);
    expect(c.doesntContainStrict((value: number) => value > 5)).toEqual(true);

    c = new Collection([0]);
    expect(c.doesntContainStrict(0)).toEqual(false);
    expect(c.doesntContainStrict('0')).toEqual(true);
    expect(c.doesntContainStrict(false)).toEqual(true);
    expect(c.doesntContainStrict(null)).toEqual(true);

    c = new Collection([1, null]);
    expect(c.doesntContainStrict(null)).toEqual(false);
    expect(c.doesntContainStrict(0)).toEqual(true);
    expect(c.doesntContainStrict(false)).toEqual(true);

    c = new Collection([{ v: 1 }, { v: 3 }, { v: '04' }, { v: 5 }]);
    expect(c.doesntContainStrict('v', 1)).toEqual(false);
    expect(c.doesntContainStrict('v', 2)).toEqual(true);
    expect(c.doesntContainStrict('v', '1')).toEqual(true);
    expect(c.doesntContainStrict('v', 4)).toEqual(true);
    expect(c.doesntContainStrict('v', '04')).toEqual(false);
    expect(c.doesntContainStrict('v', '4')).toEqual(true);

    c = new Collection(['date', 'class', { foo: 50 }, '']);
    expect(c.doesntContainStrict('date')).toEqual(false);
    expect(c.doesntContainStrict('class')).toEqual(false);
    expect(c.doesntContainStrict('foo')).toEqual(true);
    expect(c.doesntContainStrict(null)).toEqual(true);
    expect(c.doesntContainStrict('')).toEqual(false);
});

test('dot', () => {
    let data: any = Collection.make({ name: 'Taylor', meta: { foo: 'bar', baz: 'boom', bam: { boom: 'bip' } } }).dot();
    expect(data.all()).toEqual({ name: 'Taylor', 'meta.foo': 'bar', 'meta.baz': 'boom', 'meta.bam.boom': 'bip' });

    data = Collection.make({ foo: { 0: 'bar', 1: 'baz', baz: 'boom' } }).dot();
    expect(data.all()).toEqual({ 'foo.0': 'bar', 'foo.1': 'baz', 'foo.baz': 'boom' });
});

test('duplicates', () => {
    let duplicates: any = Collection.make([1, 2, 1, 'laravel', null, 'laravel', 'php', null]).duplicates().all();
    expect(duplicates).toEqual([1, 'laravel', null]);

    // does loose comparison
    duplicates = Collection.make([2, '2', [], null]).duplicates().all();
    expect(duplicates).toEqual(['2']);

    // works with mix of primitives
    duplicates = Collection.make([1, '2', ['laravel'], ['laravel'], null, '2'])
        .duplicates()
        .all();
    expect(duplicates).toEqual([['laravel'], '2']);

    // works with mix of objects and primitives **except numbers**.
    const expected = new Collection(['laravel']);
    duplicates = Collection.make([new Collection(['laravel']), expected, expected, [], '2', '2'])
        .duplicates()
        .all();
    expect(duplicates).toEqual([expected, expected, '2']);

    let items: any = [{ framework: 'vue' }, { framework: 'laravel' }, { framework: 'laravel' }];
    duplicates = Collection.make(items).duplicates('framework').all();
    expect(duplicates).toEqual(['laravel']);

    // works with key and strict
    items = [{ Framework: 'vue' }, { framework: 'vue' }, { Framework: 'vue' }];
    duplicates = Collection.make(items).duplicates('Framework', true).all();
    expect(duplicates).toEqual(['vue']);

    items = [{ framework: 'vue' }, { framework: 'laravel' }, { framework: 'laravel' }];
    duplicates = Collection.make(items)
        // @ts-ignore
        .duplicates((item) => item['framework'])
        .all();
    expect(duplicates).toEqual(['laravel']);
});

test('duplicatesStrict', () => {
    let duplicates: any = Collection.make([1, 2, 1, 'laravel', null, 'laravel', 'php', null]).duplicatesStrict().all();
    expect(duplicates).toEqual([1, 'laravel', null]);

    // does strict comparison
    duplicates = Collection.make([2, '2', [], null]).duplicatesStrict().all();
    expect(duplicates).toEqual([]);

    // works with mix of primitives
    duplicates = Collection.make([1, '2', ['laravel'], ['laravel'], null, '2'])
        .duplicatesStrict()
        .all();
    expect(duplicates).toEqual(['2']);

    // works with mix of primitives, objects, and numbers
    const expected = new Collection(['laravel']);
    duplicates = Collection.make([new Collection(['laravel']), expected, expected, [], '2', '2'])
        .duplicatesStrict()
        .all();
    expect(duplicates).toEqual([expected, '2']);
});

test('each', () => {
    const original = { 0: 1, 1: 2, foo: 'bar', bam: 'baz' };
    const c = new Collection(original);
    let result = {};
    c.each((item, key) => (result[key] = item));
    expect(result).toEqual(original);

    result = {};
    c.each((item, key) => {
        result[key] = item;

        if (isNaN(Number(key))) {
            return false;
        }
    });
    expect(result).toEqual({ 0: 1, 1: 2, foo: 'bar' });
});

test('eachSpread', () => {
    let c: any = new Collection([
        [1, 'a'],
        [2, 'b'],
    ]);
    let result: any[] = [];
    c.eachSpread((number: any, character: any) => result.push([number, character]));
    expect(result).toEqual(c.all());

    result = [];
    c.eachSpread((number: any, character: any) => {
        result.push([number, character]);

        return false;
    });
    expect(result).toEqual([[1, 'a']]);

    result = [];
    c.eachSpread((number: any, character: any, key: any) => result.push([number, character, key]));
    expect(result).toEqual([
        [1, 'a', '0'],
        [2, 'b', '1'],
    ]);

    c = new Collection([new Collection([1, 'a']), new Collection([2, 'b'])]);
    result = [];
    c.eachSpread((number: any, character: any, key: any) => result.push([number, character, key]));
    expect(result).toEqual([
        [1, 'a', '0'],
        [2, 'b', '1'],
    ]);
});

test('ensure', () => {
    let data: any = Collection.make([1, 2, 3]);
    data.ensure('number');

    data = Collection.make([1, 2, 3, 'foo']);
    expect(() => data.ensure('number')).toThrow(
        "Collection should only include [number] items, but 'string' found at position 3.",
    );

    data = Collection.make([{}, {}, {}]);
    data.ensure('object');

    data = Collection.make([{}, {}, {}, Collection]);
    expect(() => data.ensure('object')).toThrow(
        "Collection should only include [object] items, but 'Collection' found at position 3.",
    );

    data = Collection.make([new Error(), new Error()]);
    data.ensure(Error);

    const wrongType = new Collection();
    data = Collection.make([new Error(), new Error(), wrongType]);
    expect(() => data.ensure(Error)).toThrow(
        "Collection should only include [Error] items, but 'object' found at position 2.",
    );

    data = Collection.make([new Error(), 123]);
    data.ensure([Error, 'number']);

    data = Collection.make([new Error(), new Error(), wrongType]);
    expect(() => data.ensure([Error, 'number'])).toThrow(
        "Collection should only include [Error,number] items, but 'object' found at position 2.",
    );
});

test('every', () => {
    let c: any = new Collection([]);
    expect(c.every('key', 'value')).toEqual(true);
    expect(c.every(() => false)).toEqual(true);

    c = new Collection([{ age: 18 }, { age: 20 }, { age: 20 }]);
    expect(c.every('age', 18)).toEqual(false);
    expect(c.every('age', '>=', 18)).toEqual(true);
    expect(c.every((item: any) => item['age'] >= 18)).toEqual(true);
    expect(c.every((item: any) => item['age'] >= 20)).toEqual(false);

    c = new Collection([null, null]);
    expect(c.every((item: any) => item === null)).toEqual(true);

    c = new Collection([{ active: true }, { active: true }]);
    expect(c.every('active')).toEqual(true);
    expect(c.concat([{ active: false }]).every('active', true)).toEqual(false);
});

test('except', () => {
    let c: Collection<any, any> = new Collection({ first: 'Taylor', last: 'Otwell', email: 'taylorotwell@gmail.com' });

    expect(c.except(['last', 'email', 'missing'] as any).all()).toEqual({ first: 'Taylor' });
    expect(c.except(collect(['last', 'email', 'missing']) as any).all()).toEqual({ first: 'Taylor' });
    expect(c.except(['last']).all()).toEqual({ first: 'Taylor', email: 'taylorotwell@gmail.com' });
    expect(c.except('last').all()).toEqual({ first: 'Taylor', email: 'taylorotwell@gmail.com' });
    expect(c.except(collect(['last']) as any).all()).toEqual({ first: 'Taylor', email: 'taylorotwell@gmail.com' });

    c = new Collection({ first: 'Taylor', last: 'Otwell' });
    expect(c.except(c as any).all()).toEqual({ first: 'Taylor', last: 'Otwell' });
});

test('filter', () => {
    let c: Collection<any, any> = new Collection([
        { id: 1, name: 'Hello' },
        { id: 2, name: 'World' },
    ]);
    expect(c.filter((item: any) => item['id'] === 2).all()).toEqual([{ id: 2, name: 'World' }]);

    c = new Collection(['', 'Hello', '', 'World']);
    expect(c.filter().values().toArray()).toEqual(['Hello', 'World']);

    c = new Collection({ id: 1, first: 'Hello', second: 'World' });
    expect(c.filter((_: any, key: any) => key !== 'id').all()).toEqual({ first: 'Hello', second: 'World' });

    c = new Collection([1, 2, 3, null, false, '', 0, []]);
    expect(c.filter().all()).toEqual([1, 2, 3, []]);
});

test('first', () => {
    let c: Collection<any, any> = new Collection(['foo', 'bar']);
    expect(c.first()).toEqual('foo');

    c = new Collection(['foo', 'bar', 'baz']);
    let r = c.first((value) => value === 'bar');
    expect(r).toEqual('bar');

    c = new Collection(['foo', 'bar']);
    r = c.first((value) => value === 'baz', 'default');
    expect(r).toEqual('default');

    c = new Collection();
    r = c.first(undefined, 'default');
    expect(r).toEqual('default');

    c = new Collection(['foo', 'bar']);
    r = c.first(undefined, 'default');
    expect(r).toEqual('foo');
});

test('firstOrFail', () => {
    let collection = new Collection([{ name: 'foo' }, { name: 'bar' }]);
    expect(collection.where('name', 'foo').firstOrFail()).toEqual({ name: 'foo' });
    expect(collection.firstOrFail('name', '=', 'foo')).toEqual({ name: 'foo' });
    expect(collection.firstOrFail('name', 'foo')).toEqual({ name: 'foo' });
    expect(() => collection.where('name', 'INVALID').firstOrFail()).toThrow('Item not found.');

    collection = new Collection([{ name: 'foo' }, { name: 'foo' }, { name: 'bar' }]);
    expect(collection.where('name', 'foo').firstOrFail()).toEqual({ name: 'foo' });

    let data: any = new Collection(['foo', 'bar', 'baz']);
    let result = data.firstOrFail((value: any) => value === 'bar');
    expect(result).toEqual('bar');
    expect(() => data.firstOrFail((value: any) => value === 'invalid')).toThrow('Item not found.');

    data = new Collection(['foo', 'bar', 'bar']);
    expect(data.firstOrFail((value: any) => value === 'bar')).toEqual('bar');

    data = new Collection([
        () => false,
        () => true,
        () => {
            throw new Error();
        },
    ]);
    expect(data.firstOrFail((callback: any) => callback())).not.toEqual(null);
});

test('firstWhere', () => {
    let data: any = new Collection([
        { material: 'paper', type: 'book' },
        { material: 'rubber', type: 'gasket' },
    ]);
    expect(data.firstWhere('material', 'paper')?.['type']).toEqual('book');
    expect(data.firstWhere('material', 'rubber')?.['type']).toEqual('gasket');
    expect(data.firstWhere('material', 'nonexistent')).toEqual(undefined);
    expect(data.firstWhere('nonexistent', 'key')).toEqual(undefined);
    expect(data.firstWhere((value: any) => value['material'] === 'paper')?.['type']).toEqual('book');
    expect(data.firstWhere((value: any) => value['material'] === 'rubber')?.['type']).toEqual('gasket');
    expect(data.firstWhere((value: any) => value['material'] === 'nonexistent')).toEqual(undefined);
    expect(data.firstWhere((value: any) => (value['nonexistent'] ?? null) === 'key')).toEqual(undefined);

    data = new Collection([
        { id: 1, name: StaffEnum.Taylor },
        { id: 2, name: StaffEnum.Joe },
        { id: 3, name: StaffEnum.James },
    ]);
    expect(data.firstWhere('name', 'Taylor')?.['id']).toEqual(1);
    expect(data.firstWhere('name', StaffEnum.Joe)?.['id']).toEqual(2);
    expect(data.firstWhere('name', StaffEnum.James)?.['id']).toEqual(3);
});

test('flatMap', () => {
    let data: any = new Collection([
        { name: 'taylor', hobbies: ['programming', 'basketball'] },
        { name: 'adam', hobbies: ['music', 'powerlifting'] },
    ]);
    data = data.flatMap((person: any) => person['hobbies']);
    expect(data.all()).toEqual(['programming', 'basketball', 'music', 'powerlifting']);
});

test('flatten', () => {
    // Flat arrays are unaffected
    let c: Collection<any, any> = new Collection(['#foo', '#bar', '#baz']);
    expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

    // Nested arrays are flattened with existing flat items
    c = new Collection([['#foo', '#bar'], '#baz']);
    expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

    // Sets of nested arrays are flattened
    c = new Collection([['#foo', '#bar'], ['#baz']]);
    expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

    // Deeply nested arrays are flattened
    c = new Collection([['#foo', ['#bar']], ['#baz']]);
    expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

    // Nested collections are flattened alongside arrays
    c = new Collection([new Collection(['#foo', '#bar']), ['#baz']]);
    expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

    // Nested collections containing plain arrays are flattened
    c = new Collection([new Collection(['#foo', ['#bar']]), ['#baz']]);
    expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

    // Nested arrays containing collections are flattened
    c = new Collection([['#foo', new Collection(['#bar'])], ['#baz']]);
    expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz']);

    // Nested arrays containing collections containing arrays are flattened
    c = new Collection([['#foo', new Collection(['#bar', ['#zap']])], ['#baz']]);
    expect(c.flatten().all()).toEqual(['#foo', '#bar', '#zap', '#baz']);

    // No depth flattens recursively
    c = new Collection([['#foo', ['#bar', ['#baz']]], '#zap']);
    expect(c.flatten().all()).toEqual(['#foo', '#bar', '#baz', '#zap']);

    // Specifying a depth only flattens to that depth
    c = new Collection([['#foo', ['#bar', ['#baz']]], '#zap']);
    expect(c.flatten(1).all()).toEqual(['#foo', ['#bar', ['#baz']], '#zap']);

    c = new Collection([['#foo', ['#bar', ['#baz']]], '#zap']);
    expect(c.flatten(2).all()).toEqual(['#foo', '#bar', ['#baz'], '#zap']);

    // No depth ignores keys
    c = new Collection({ 0: '#foo', 1: { key: '#bar' }, 2: { key: '#baz' }, key: '#zap' });
    expect(c.flatten().all()).toEqual({ 0: '#foo', 1: '#bar', 2: '#baz', 3: '#zap' });
});

test('flip', () => {
    const data = new Collection({ name: 'taylor', framework: 'laravel' });
    expect(data.flip().toArray()).toEqual({ taylor: 'name', laravel: 'framework' });
});

test('forget', () => {
    let c: any = new Collection(['foo', 'bar']);
    c = c.forget(0).all() as any[];
    expect(isset(c['foo'])).toEqual(false);
    expect(isset(c[0])).toEqual(false);
    expect(isset(c[1])).toEqual(true);

    c = new Collection({ foo: 'bar', baz: 'qux' });
    c = c.forget('foo').all();
    expect(isset(c['foo'])).toEqual(false);
    expect(isset(c['baz'])).toEqual(true);

    c = new Collection(['foo', 'bar', 'baz']);
    c = c.forget([0, 2]).all();
    expect(isset(c[0])).toEqual(false);
    expect(isset(c[2])).toEqual(false);
    expect(isset(c[1])).toEqual(true);

    c = new Collection({ name: 'taylor', foo: 'bar', baz: 'qux' });
    c = c.forget(['foo', 'baz']).all();
    expect(isset(c['foo'])).toEqual(false);
    expect(isset(c['baz'])).toEqual(false);
    expect(isset(c['name'])).toEqual(true);

    c = new Collection(['foo', 'bar', 'baz']);
    c = c.forget(collect([0, 2])).all();
    expect(isset(c[0])).toEqual(false);
    expect(isset(c[2])).toEqual(false);
    expect(isset(c[1])).toEqual(true);

    c = new Collection({ name: 'taylor', foo: 'bar', baz: 'qux' });
    c = c.forget(collect(['foo', 'baz'])).all();
    expect(isset(c['foo'])).toEqual(false);
    expect(isset(c['baz'])).toEqual(false);
    expect(isset(c['name'])).toEqual(true);
});

test('forPage', () => {
    const c = new Collection(['one', 'two', 'three', 'four']);
    expect(c.forPage(0, 2).all()).toEqual(['one', 'two']);
    expect(c.forPage(1, 2).all()).toEqual(['one', 'two']);
    expect(c.forPage(2, 2).all()).toEqual(['three', 'four']);
    expect(c.forPage(3, 2).all()).toEqual([]);
});

test('fromJson', () => {
    let array: any = { foo: 'bar', baz: 'quz' };
    let json = JSON.stringify(array);
    let instance = Collection.fromJson(json);
    expect(instance.toArray()).toEqual(array);

    array = { foo: { baz: ['quz'] }, bar: 'baz' };
    json = JSON.stringify(array);
    instance = Collection.fromJson(json);
    expect(instance.toArray()).toEqual(array);

    instance = Collection.fromJson('{"int":999999999999999}');
    expect(instance.toArray()).toEqual({ int: 999999999999999 });
});

test('get', () => {
    let c: Collection<any, any> = new Collection([1, 2, 3]);
    expect(c.get(undefined)).toEqual(undefined);

    c = new Collection({ name: 'taylor', framework: 'laravel' });
    expect(c.get('age', 34)).toEqual(34);

    const data = new Collection({ name: 'taylor', framework: 'laravel' });
    // @ts-ignore
    const result = data.get('email', () => 'taylor@example.com');
    expect(result).toEqual('taylor@example.com');
});

test('groupBy', () => {
    let data: any = new Collection([
        { rating: 1, url: '1' },
        { rating: 1, url: '1' },
        { rating: 2, url: '2' },
    ]);
    let result = data.groupBy('rating');
    expect(result.toArray()).toEqual({
        1: [
            { rating: 1, url: '1' },
            { rating: 1, url: '1' },
        ],
        2: [{ rating: 2, url: '2' }],
    });

    result = data.groupBy('url');
    expect(result.toArray()).toEqual({
        1: [
            { rating: 1, url: '1' },
            { rating: 1, url: '1' },
        ],
        2: [{ rating: 2, url: '2' }],
    });

    let payload: any = [
        { name: 'Laravel', url: '1' },
        { name: 'Framework', url: '2' },
    ];
    data = new Collection(payload);
    result = data.groupBy('name');
    expect(result.toArray()).toEqual({ Laravel: [payload[0]], Framework: [payload[1]] });

    result = data.groupBy('url');
    expect(result.toArray()).toEqual({ 1: [payload[0]], 2: [payload[1]] });

    payload = [
        { name: TestStringBackedEnum.A, url: '1' },
        { name: TestBackedEnum.A, url: '1' },
        { name: TestStringBackedEnum.A, url: '2' },
    ];
    data = new Collection(payload);
    result = data.groupBy('name');
    expect(result.toArray()).toEqual({ A: [payload[0], payload[2]], 1: [payload[1]] });

    result = data.groupBy('url');
    expect(result.toArray()).toEqual({ 1: [payload[0], payload[1]], 2: [payload[2]] });

    data = new Collection([
        { rating: TestBackedEnum.A, url: '1' },
        { rating: TestBackedEnum.B, url: '1' },
    ]);
    result = data.groupBy('rating');
    expect(result.toArray()).toEqual({
        [TestBackedEnum.A]: [{ rating: TestBackedEnum.A, url: '1' }],
        [TestBackedEnum.B]: [{ rating: TestBackedEnum.B, url: '1' }],
    });

    data = new Collection({ 10: { rating: 1, url: '1' }, 20: { rating: 1, url: '1' }, 30: { rating: 2, url: '2' } });
    result = data.groupBy('rating', true);
    let expected_result: any = {
        1: {
            10: { rating: 1, url: '1' },
            20: { rating: 1, url: '1' },
        },
        2: { 30: { rating: 2, url: '2' } },
    };
    expect(result.toArray()).toEqual(expected_result);

    data = new Collection([
        { rating: 1, url: '1' },
        { rating: 1, url: '1' },
        { rating: 2, url: '2' },
    ]);
    result = data.groupBy((item: any) => item['rating']);
    expect(result.toArray()).toEqual({
        1: [
            { rating: 1, url: '1' },
            { rating: 1, url: '1' },
        ],
        2: [{ rating: 2, url: '2' }],
    });

    data = new Collection({ 10: { rating: 1, url: '1' }, 20: { rating: 1, url: '1' }, 30: { rating: 2, url: '2' } });
    result = data.groupBy((item: any) => item['rating'], true);
    expected_result = {
        1: {
            10: { rating: 1, url: '1' },
            20: { rating: 1, url: '1' },
        },
        2: {
            30: { rating: 2, url: '2' },
        },
    };
    expect(result.toArray()).toEqual(expected_result);

    data = new Collection([
        { user: 1, roles: ['Role_1', 'Role_3'] },
        { user: 2, roles: ['Role_1', 'Role_2'] },
        { user: 3, roles: ['Role_1'] },
    ]);
    result = data.groupBy((item: any) => item['roles']);
    expected_result = {
        Role_1: [
            { user: 1, roles: ['Role_1', 'Role_3'] },
            { user: 2, roles: ['Role_1', 'Role_2'] },
            { user: 3, roles: ['Role_1'] },
        ],
        Role_2: [{ user: 2, roles: ['Role_1', 'Role_2'] }],
        Role_3: [{ user: 1, roles: ['Role_1', 'Role_3'] }],
    };
    expect(result.toArray()).toEqual(expected_result);

    data = new Collection({
        10: { user: 1, roles: ['Role_1', 'Role_3'] },
        20: { user: 2, roles: ['Role_1', 'Role_2'] },
        30: { user: 3, roles: ['Role_1'] },
    });
    result = data.groupBy((item: any) => item['roles'], true);
    expected_result = {
        Role_1: {
            10: { user: 1, roles: ['Role_1', 'Role_3'] },
            20: { user: 2, roles: ['Role_1', 'Role_2'] },
            30: { user: 3, roles: ['Role_1'] },
        },
        Role_2: { 20: { user: 2, roles: ['Role_1', 'Role_2'] } },
        Role_3: { 10: { user: 1, roles: ['Role_1', 'Role_3'] } },
    };
    expect(result.toArray()).toEqual(expected_result);

    data = new Collection({
        10: { user: 1, skilllevel: 1, roles: ['Role_1', 'Role_3'] },
        20: { user: 2, skilllevel: 1, roles: ['Role_1', 'Role_2'] },
        30: { user: 3, skilllevel: 2, roles: ['Role_1'] },
        40: { user: 4, skilllevel: 2, roles: ['Role_2'] },
    });
    result = data.groupBy(['skilllevel', (item: any) => item['roles']], true);
    expected_result = {
        1: {
            Role_1: {
                10: { user: 1, skilllevel: 1, roles: ['Role_1', 'Role_3'] },
                20: { user: 2, skilllevel: 1, roles: ['Role_1', 'Role_2'] },
            },
            Role_3: {
                10: { user: 1, skilllevel: 1, roles: ['Role_1', 'Role_3'] },
            },
            Role_2: {
                20: { user: 2, skilllevel: 1, roles: ['Role_1', 'Role_2'] },
            },
        },
        2: {
            Role_1: {
                30: { user: 3, skilllevel: 2, roles: ['Role_1'] },
            },
            Role_2: {
                40: { user: 4, skilllevel: 2, roles: ['Role_2'] },
            },
        },
    };
    expect(result.toArray()).toEqual(expected_result);
});

test('has', () => {
    let data: any = new Collection({ id: 1, first: 'Hello', second: 'World' });
    expect(data.has('first')).toEqual(true);
    expect(data.has('third' as any)).toEqual(false);
    expect(data.has(['first', 'second'])).toEqual(true);
    expect(data.has(['third', 'first'] as any)).toEqual(false);

    data = new Collection({ foo: 'one', bar: 'two', 1: 'three' });
    expect(data.has('foo')).toEqual(true);
    expect(data.has('foo', 'bar', 1)).toEqual(true);
    expect(data.has('foo', 'bar', 1, 'baz')).toEqual(false);
    expect(data.has('baz')).toEqual(false);
});

test('hasAny', () => {
    const data = new Collection({ id: 1, first: 'Hello', second: 'World' });
    expect(data.hasAny('first')).toEqual(true);
    expect(data.hasAny('third' as any)).toEqual(false);
    expect(data.hasAny(['first', 'second'])).toEqual(true);
    expect(data.hasAny(['first', 'fourth'] as any)).toEqual(true);
    expect(data.hasAny(['third', 'fourth'] as any)).toEqual(false);
    expect(data.hasAny([])).toEqual(false);
});

test('implode', () => {
    let data: any = new Collection([
        { name: 'taylor', email: 'foo' },
        { name: 'dayle', email: 'bar' },
    ]);
    expect(data.implode('email')).toEqual('foobar');
    expect(data.implode('email', ',')).toEqual('foo,bar');

    data = new Collection(['taylor', 'dayle']);
    expect(data.implode('')).toEqual('taylordayle');
    expect(data.implode(',')).toEqual('taylor,dayle');

    data = new Collection([
        { name: 'taylor', email: 'foo' },
        { name: 'dayle', email: 'bar' },
    ]);
    expect(data.implode((user: any) => user['name'] + '-' + user['email'])).toEqual('taylor-foodayle-bar');
    expect(data.implode((user: any) => user['name'] + '-' + user['email'], ',')).toEqual('taylor-foo,dayle-bar');
});

test('intersect', () => {
    const c = new Collection({ id: 1, first_word: 'Hello' });
    expect(c.intersect(new Collection({ first_world: 'Hello', last_word: 'World' }) as any).all()).toEqual({
        first_word: 'Hello',
    });
});

test('intersectAssoc', () => {
    const array1 = new Collection({ a: 'green', b: 'brown', c: 'blue', 0: 'red' });
    const array2 = new Collection({ a: 'green', b: 'yellow', 0: 'blue', 1: 'red' });
    expect(array1.intersectAssoc(array2 as any).all()).toEqual({ a: 'green' });
});

test('intersectAssocUsing', () => {
    const array1 = new Collection({ a: 'green', b: 'brown', c: 'blue', 0: 'red' });
    const array2 = new Collection({ a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red' });
    expect(
        array1.intersectAssocUsing(array2 as any, (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).all(),
    ).toEqual({ b: 'brown' });
});

test('intersectByKeys', () => {
    let c: Collection<any, any> = new Collection({ name: 'Mateus', age: 18 });
    expect(c.intersectByKeys(new Collection({ name: 'Mateus', surname: 'Guimaraes' })).all()).toEqual({
        name: 'Mateus',
    });

    c = new Collection({ name: 'taylor', family: 'otwell', age: 26 });
    expect(c.intersectByKeys(new Collection({ height: 180, name: 'amir', family: 'moharami' })).all()).toEqual({
        name: 'taylor',
        family: 'otwell',
    });
});

test('intersectUsing', () => {
    const collect = new Collection(['green', 'brown', 'blue']);
    expect(
        collect
            .intersectUsing(new Collection(['GREEN', 'brown', 'yellow']), (a, b) =>
                a.toLowerCase().localeCompare(b.toLowerCase()),
            )
            .all(),
    ).toEqual(['green', 'brown']);
});

test('isEmpty', () => {
    let c: Collection<any, any> = new Collection();
    expect(c.isEmpty()).toEqual(true);

    c = new Collection(['foo', 'bar']);
    expect(c.isEmpty()).toEqual(false);
    expect(c.isNotEmpty()).toEqual(true);
});

test('join', () => {
    expect(new Collection(['a', 'b', 'c']).join(', ')).toEqual('a, b, c');
    expect(new Collection(['a', 'b', 'c']).join(', ', ' and ')).toEqual('a, b and c');
    expect(new Collection(['a', 'b']).join(', ', ' and ')).toEqual('a and b');
    expect(new Collection(['a']).join(', ', ' and ')).toEqual('a');
    expect(new Collection([]).join(', ', ' and ')).toEqual('');
});

test('keyBy', () => {
    let data: any = new Collection([
        { rating: 1, name: '1' },
        { rating: 2, name: '2' },
        { rating: 3, name: '3' },
    ]);

    let result = data.keyBy('rating');
    expect(result.all()).toEqual({
        1: { rating: 1, name: '1' },
        2: { rating: 2, name: '2' },
        3: { rating: 3, name: '3' },
    });

    result = data.keyBy((item: any) => item['rating'] * 2);
    expect(result.all()).toEqual({
        2: { rating: 1, name: '1' },
        4: { rating: 2, name: '2' },
        6: { rating: 3, name: '3' },
    });

    data = new Collection([
        { firstname: 'Taylor', lastname: 'Otwell', locale: 'US' },
        { firstname: 'Lucas', lastname: 'Michot', locale: 'FR' },
    ]);
    result = data.keyBy((item: any, key: any) => (key + '-' + item['firstname'] + item['lastname']).toLowerCase());
    expect(result.all()).toEqual({
        '0-taylorotwell': { firstname: 'Taylor', lastname: 'Otwell', locale: 'US' },
        '1-lucasmichot': { firstname: 'Lucas', lastname: 'Michot', locale: 'FR' },
    });

    result = data.keyBy((item: any, key: any) => new Collection([key, item['firstname'], item['lastname']]).join(','));
    expect(result.all()).toEqual({
        '0,Taylor,Otwell': { firstname: 'Taylor', lastname: 'Otwell', locale: 'US' },
        '1,Lucas,Michot': { firstname: 'Lucas', lastname: 'Michot', locale: 'FR' },
    });
});

test('keys', () => {
    let c: Collection<any, any> = new Collection({ name: 'taylor', framework: 'laravel' });
    expect(c.keys().all()).toEqual(['name', 'framework']);

    c = new Collection(['taylor', 'laravel']);
    expect(c.keys().all()).toEqual([0, 1]);
});

test('last', () => {
    let c: Collection<any, any> = new Collection(['foo', 'bar']);
    expect(c.last()).toEqual('bar');

    // @ts-ignore
    c = new Collection([]);
    expect(c.last()).toBe(undefined);

    c = new Collection([100, 200, 300]);
    let result = c.last((value) => value < 250);
    expect(result).toEqual(200);

    result = c.last((_, key) => Number(key) < 2);
    expect(result).toEqual(300);

    result = c.last((value) => value > 300);
    expect(result).toEqual(undefined);

    c = new Collection(['foo', 'bar']);
    result = c.last((value) => value === 'baz', 'default');
    expect(result).toEqual('default');

    c = new Collection(['foo', 'bar', 'Bar']);
    result = c.last((value) => value === 'bar', 'default');
    expect(result).toEqual('bar');

    c = new Collection();
    result = c.last(undefined, 'default');
    expect(result).toEqual('default');
});

test('make', () => {
    const object = { foo: 'bar' };
    let data: any = Collection.make(object);
    expect(data.all()).toEqual({ foo: 'bar' });

    const secondCollection = Collection.make(data);
    expect(secondCollection.all()).toEqual({ foo: 'bar' });

    // @ts-ignore
    data = Collection.make('foo');
    expect(data.all()).toEqual(['foo']);

    data = Collection.make(undefined);
    expect(data.all()).toEqual([]);

    data = Collection.make();
    expect(data.all()).toEqual([]);
});

test('map', () => {
    let data: Collection<any, any> = new Collection([1, 2, 3]);
    const mapped = data.map((item) => item * 2);
    expect(mapped.all()).toEqual([2, 4, 6]);
    expect(data.all()).toEqual([1, 2, 3]);

    data = new Collection({ first: 'taylor', last: 'otwell' });
    data = data.map((item, key) => key + '-' + item.split('').reverse().join(''));
    expect(data.all()).toEqual({ first: 'first-rolyat', last: 'last-llewto' });
});

test('mapInto', () => {
    let data: any = new Collection(['first', 'second']);
    data = data.mapInto(Collection);
    expect(data.get(0).all()).toEqual(['first']);
    expect(data.get(1).all()).toEqual(['second']);
});

test('mapSpread', () => {
    let c: any = new Collection([
        [1, 'a'],
        [2, 'b'],
    ]);
    let result = c.mapSpread((number: any, character: any) => `${number}-${character}`);
    expect(result.all()).toEqual(['1-a', '2-b']);

    result = c.mapSpread((number: any, character: any, key: any) => `${number}-${character}-${key}`);
    expect(result.all()).toEqual(['1-a-0', '2-b-1']);

    c = new Collection([new Collection([1, 'a']), new Collection([2, 'b'])]);
    result = c.mapSpread((number: any, character: any, key: any) => `${number}-${character}-${key}`);
    expect(result.all()).toEqual(['1-a-0', '2-b-1']);
});

test('mapToDictionary', () => {
    let data: any = new Collection([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
        { id: 4, name: 'B' },
    ]);
    let groups: any = data.mapToDictionary((item: any) => ({ [item['name']]: item['id'] }));
    expect(groups).toBeInstanceOf(Collection);
    expect(groups.toArray()).toEqual({ A: [1], B: [2, 4], C: [3] });
    expect(Array.isArray(groups.get('A'))).toEqual(true);

    data = new Collection([1, 2, 3, 2, 1]);
    groups = data.mapToDictionary((item: any, key: any) => ({ [item]: Number(key) }));
    expect(groups.toArray()).toEqual({ 1: [0, 4], 2: [1, 3], 3: [2] });
});

test('mapToGroups', () => {
    let data: any = new Collection([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
        { id: 4, name: 'B' },
    ]);
    let groups = data.mapToGroups((item: any) => ({ [item['name']]: item['id'] }));
    expect(groups).toBeInstanceOf(Collection);
    expect(groups.toArray()).toEqual({ A: [1], B: [2, 4], C: [3] });
    expect(groups.get('A')).toBeInstanceOf(Collection);

    data = new Collection([1, 2, 3, 2, 1]);
    groups = data.mapToDictionary((item: any, key: any) => ({ [item]: Number(key) }));
    expect(groups.toArray()).toEqual({ 1: [0, 4], 2: [1, 3], 3: [2] });
    expect(data.all()).toEqual([1, 2, 3, 2, 1]);
});

test('mapWithKeys', () => {
    let data: Collection<any, any> = new Collection([
        { name: 'Blastoise', type: 'Water', idx: 9 },
        { name: 'Charmander', type: 'Fire', idx: 4 },
        { name: 'Dragonair', type: 'Dragon', idx: 148 },
    ]);
    const mapped = data.mapWithKeys((pokemon) => ({ [pokemon['name']]: pokemon['type'] }));
    expect(mapped.all()).toEqual({ Blastoise: 'Water', Charmander: 'Fire', Dragonair: 'Dragon' });

    data = new Collection([
        { id: 1, name: 'A' },
        { id: 3, name: 'B' },
        { id: 2, name: 'C' },
    ]);
    const mapped2 = data.mapWithKeys((item) => ({ [item['id']]: item }));
    expect(mapped2.keys().all()).toEqual(['1', '2', '3']);

    data = new Collection([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
    ]);
    const mapped3 = data.mapWithKeys((item) => ({ [item['id']]: item['name'], [item['name']]: item['id'] }));
    expect(mapped3.all()).toEqual({ 1: 'A', A: 1, 2: 'B', B: 2, 3: 'C', C: 3 });

    data = new Collection({
        3: { id: 1, name: 'A' },
        5: { id: 3, name: 'B' },
        4: { id: 2, name: 'C' },
    });
    const mapped4 = data.mapWithKeys((item, key) => ({ [key]: item['id'] }));
    expect(mapped4.keys().all()).toEqual(['3', '4', '5']);

    data = new Collection([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 1, name: 'C' },
    ]);
    data = data.mapWithKeys((item) => ({ [item['id']]: item['name'] }));
    expect(data.all()).toEqual({ 1: 'C', 2: 'B' });
});

test('max', () => {
    let c: any = new Collection([{ foo: 10 }, { foo: 20 }]);
    expect(c.max((item: any) => item.foo)).toEqual(20);
    expect(c.max('foo')).toEqual(20);

    c = new Collection([1, 2, 3, 4, 5]);
    expect(c.max()).toEqual(5);

    c = new Collection();
    expect(c.max()).toEqual(undefined);
});

test('median', () => {
    let data: any = new Collection([1, 2, 2, 4]);
    expect(data.median()).toEqual(2);

    data = new Collection([{ foo: 1 }, { foo: 2 }, { foo: 2 }, { foo: 4 }]);
    expect(data.median('foo')).toEqual(2);

    data = new Collection([{ foo: 1 }, { foo: 2 }, { foo: 4 }, { foo: null }]);
    expect(data.median('foo')).toEqual(2);

    data = new Collection([{ foo: 0 }, { foo: 3 }]);
    expect(data.median('foo')).toEqual(1.5);

    data = new Collection([{ foo: 0 }, { foo: 5 }, { foo: 3 }]);
    expect(data.median('foo')).toEqual(3);

    data = new Collection();
    expect(data.median()).toEqual(null);
});

test('merge', () => {
    let c = new Collection({ name: 'Hello' });
    expect(c.merge({ id: 1 }).all()).toEqual({ name: 'Hello', id: 1 });

    c = new Collection({ name: 'Hello' });
    expect(c.merge(new Collection({ name: 'World', id: 1 })).all()).toEqual({ name: 'World', id: 1 });
});

test('mergeRecursive', () => {
    let c: Collection<any, any> = new Collection({ name: 'Hello', id: 1 });
    expect(c.mergeRecursive({ id: 2 }).all()).toEqual({ name: 'Hello', id: [1, 2] });

    c = new Collection({ name: 'Hello', id: 1, meta: { tags: ['a', 'b'], roles: 'admin' } });
    expect(c.mergeRecursive(new Collection({ meta: { tags: ['c'], roles: 'editor' } }) as any).all()).toEqual({
        name: 'Hello',
        id: 1,
        meta: { tags: ['a', 'b', 'c'], roles: ['admin', 'editor'] },
    });
});

test('min', () => {
    let c: any = new Collection([{ foo: 10 }, { foo: 20 }]);
    expect(c.min((item: any) => item.foo)).toEqual(10);
    expect(c.min('foo')).toEqual(10);

    c = new Collection([{ foo: 10 }, { foo: 20 }, { foo: null }]);
    expect(c.min('foo')).toEqual(10);

    c = new Collection([1, 2, 3, 4, 5]);
    expect(c.min()).toEqual(1);

    c = new Collection([1, null, 3, 4, 5]);
    expect(c.min()).toEqual(1);

    c = new Collection([0, 1, 2, 3, 4]);
    expect(c.min()).toEqual(0);

    c = new Collection();
    expect(c.min()).toEqual(undefined);
});

test('mode', () => {
    let data: any = new Collection();
    expect(data.mode()).toEqual(null);

    data = new Collection([1, 2, 3, 4, 4, 5]);
    expect(Array.isArray(data.mode())).toEqual(true);
    expect(data.mode()).toEqual([4]);

    data = new Collection([{ foo: 1 }, { foo: 1 }, { foo: 2 }, { foo: 4 }]);
    const data2 = new Collection([{ foo: 1 }, { foo: 1 }, { foo: 2 }, { foo: 4 }]);
    expect(data.mode('foo')).toEqual([1]);
    expect(data.mode('foo')).toEqual(data2.mode('foo'));

    data = new Collection([1, 2, 2, 1]);
    expect(data.mode()).toEqual([1, 2]);
});

test('multiply', () => {
    let c = new Collection(['Hello', 1, { tags: ['a', 'b'], 0: 'admin' }]);
    expect(c.multiply(-1).all()).toEqual([]);
    expect(c.multiply(0).all()).toEqual([]);
    expect(c.multiply(1).all()).toEqual(['Hello', 1, { tags: ['a', 'b'], 0: 'admin' }]);
    expect(c.multiply(3).all()).toEqual([
        'Hello',
        1,
        { tags: ['a', 'b'], 0: 'admin' },
        'Hello',
        1,
        { tags: ['a', 'b'], 0: 'admin' },
        'Hello',
        1,
        { tags: ['a', 'b'], 0: 'admin' },
    ]);
});

test('nth', () => {
    let data = new Collection(['a', 'b', 'c', 'd', 'e', 'f']);
    expect(data.nth(4).all()).toEqual(['a', 'e']);
    expect(data.nth(4, 1).all()).toEqual(['b', 'f']);
    expect(data.nth(4, 2).all()).toEqual(['c']);
    expect(data.nth(4, 3).all()).toEqual(['d']);
    expect(data.nth(2, 2).all()).toEqual(['c', 'e']);
    expect(data.nth(1, 2).all()).toEqual(['c', 'd', 'e', 'f']);
    expect(data.nth(1, 2).all()).toEqual(['c', 'd', 'e', 'f']);
    expect(data.nth(1, -2).all()).toEqual(['e', 'f']);
    expect(data.nth(2, -4).all()).toEqual(['c', 'e']);
    expect(data.nth(4, -2).all()).toEqual(['e']);
    expect(data.nth(2, -2).all()).toEqual(['e']);
});

test('offsetSet', () => {
    const c = new Collection(['foo', 'foo']);
    c.offsetSet(1, 'bar');
    expect(c.get(1)).toEqual('bar');

    c.offsetSet(undefined, 'qux');
    expect(c.get(2)).toEqual('qux');
});

test('offsetUnset', () => {
    const c = new Collection(['foo', 'bar']);
    c.offsetUnset(1);
    expect(isset(c[1])).toEqual(false);
});

test('only', () => {
    const data: any = new Collection({ first: 'Taylor', last: 'Otwell', email: 'taylorotwell@gmail.com' });
    expect(data.only(['first', 'missing']).all()).toEqual({ first: 'Taylor' });
    expect(data.only(collect(['first', 'missing']) as any).all()).toEqual({ first: 'Taylor' });
    expect(data.only(['first', 'email']).all()).toEqual({ first: 'Taylor', email: 'taylorotwell@gmail.com' });
    expect(data.only(collect(['first', 'email']) as any).all()).toEqual({
        first: 'Taylor',
        email: 'taylorotwell@gmail.com',
    });
});

test('pad', () => {
    let c: any = new Collection([1, 2, 3]);
    c = c.pad(4, 0);
    expect(c.all()).toEqual([1, 2, 3, 0]);

    c = new Collection([1, 2, 3, 4, 5]);
    c = c.pad(4, 0);
    expect(c.all()).toEqual([1, 2, 3, 4, 5]);

    c = new Collection([1, 2, 3]);
    c = c.pad(-4, 0);
    expect(c.all()).toEqual([0, 1, 2, 3]);

    c = new Collection([1, 2, 3, 4, 5]);
    c = c.pad(-4, 0);
    expect(c.all()).toEqual([1, 2, 3, 4, 5]);
});

test('partition', () => {
    let data: any = new Collection(range(1, 10));
    const [firstPartition, secondPartition] = data.partition((i: any) => i <= 5).all();
    expect(firstPartition.values().toArray()).toEqual([1, 2, 3, 4, 5]);
    expect(secondPartition.values().toArray()).toEqual([6, 7, 8, 9, 10]);

    data = new Collection(['zero', 'one', 'two', 'three']);
    const [even, odd] = data.partition((_: any, index: any) => index % 2 === 0).all();
    expect(even.values().toArray()).toEqual(['zero', 'two']);
    expect(odd.values().toArray()).toEqual(['one', 'three']);

    let courses: any = new Collection([
        { free: true, title: 'Basic' },
        { free: false, title: 'Premium' },
    ]);
    let [free, premium] = courses.partition('free').all();
    expect(free.values().toArray()).toEqual([{ free: true, title: 'Basic' }]);
    expect(premium.values().toArray()).toEqual([{ free: false, title: 'Premium' }]);

    data = new Collection([
        { name: 'Tim', age: 17 },
        { name: 'Agatha', age: 62 },
        { name: 'Kristina', age: 33 },
        { name: 'Tim', age: 41 },
    ]);
    const [tims, others] = data.partition('name', 'Tim').all();
    expect(tims.values().all()).toEqual([
        { name: 'Tim', age: 17 },
        { name: 'Tim', age: 41 },
    ]);
    expect(others.values().all()).toEqual([
        { name: 'Agatha', age: 62 },
        { name: 'Kristina', age: 33 },
    ]);

    const [adults, minors] = data.partition('age', '>=', 18).all();
    expect(adults.values().all()).toEqual([
        { name: 'Agatha', age: 62 },
        { name: 'Kristina', age: 33 },
        { name: 'Tim', age: 41 },
    ]);
    expect(minors.values().all()).toEqual([{ name: 'Tim', age: 17 }]);

    courses = new Collection({
        a: { free: true },
        b: { free: false },
        c: { free: true },
    });
    [free, premium] = courses.partition('free').all();
    expect(free.toArray()).toEqual({ a: { free: true }, c: { free: true } });
    expect(premium.toArray()).toEqual({ b: { free: false } });

    data = new Collection();
    expect(data.partition(() => true).count()).toEqual(2);
});

test('percentage', () => {
    let collection: any = new Collection([1, 1, 2, 2, 2, 3]);
    expect(collection.percentage((value: any) => value === 1)).toEqual(33.33);
    expect(collection.percentage((value: any) => value === 2)).toEqual(50.0);
    expect(collection.percentage((value: any) => value === 3)).toEqual(16.67);
    expect(collection.percentage((value: any) => value === 5)).toEqual(0.0);

    collection = new Collection([
        { name: 'Taylor', foo: 'foo' },
        { name: 'Nuno', foo: 'bar' },
        { name: 'Dries', foo: 'bar' },
        { name: 'Jess', foo: 'baz' },
    ]);
    expect(collection.percentage((value: any) => value['foo'] === 'foo')).toEqual(25.0);
    expect(collection.percentage((value: any) => value['foo'] === 'bar')).toEqual(50.0);
    expect(collection.percentage((value: any) => value['foo'] === 'baz')).toEqual(25.0);
    expect(collection.percentage((value: any) => value['foo'] === 'test')).toEqual(0.0);

    collection = new Collection([]);
    expect(collection.percentage((value: any) => value === 1)).toEqual(null);
});

test('pipe', () => {
    const data = new Collection([1, 2, 3]);
    expect(data.pipe((data) => data.sum())).toEqual(6);
});

test('pipeInto', () => {
    const data = new Collection(['first', 'second']);
    const instance = data.pipeInto(TestCollectionMapIntoObject);
    expect(instance.value).toEqual(data);
});

test('pipeThrough', () => {
    const data = new Collection([1, 2, 3]);
    const result = data.pipeThrough([(data) => data.merge([4, 5]), (data) => data.sum()]);
    expect(result).toEqual(15);
});

test('pluck', () => {
    let data: Collection<any, any> = new Collection([
        { name: 'taylor', email: 'foo' },
        { name: 'dayle', email: 'bar' },
    ]);
    expect(data.pluck('email', 'name').all()).toEqual({ taylor: 'foo', dayle: 'bar' });
    expect(data.pluck('email').all()).toEqual(['foo', 'bar']);

    data = new Collection([
        { name: 'amir', skill: { backend: ['php', 'python'] } },
        { name: 'taylor', skill: { backend: ['php', 'asp', 'java'] } },
    ]);
    expect(data.pluck('skill.backend').all()).toEqual([
        ['php', 'python'],
        ['php', 'asp', 'java'],
    ]);
    expect(data.pluck((row) => `${row['name']} (verified)`).all()).toEqual(['amir (verified)', 'taylor (verified)']);
    expect(data.pluck('name', (row) => row['skill']['backend'].join('/')).all()).toEqual({
        'php/python': 'amir',
        'php/asp/java': 'taylor',
    });

    data = new Collection([
        { brand: 'Tesla', color: 'red' },
        { brand: 'Pagani', color: 'white' },
        { brand: 'Tesla', color: 'black' },
        { brand: 'Pagani', color: 'orange' },
    ]);
    expect(data.pluck('color', 'brand').all()).toEqual({ Tesla: 'black', Pagani: 'orange' });
});

test('pop', () => {
    let c = new Collection(['foo', 'bar']);
    expect(c.pop()).toEqual('bar');
    expect(c.first()).toEqual('foo');

    c = new Collection(['foo', 'bar', 'baz']);
    expect(c.pop(2)).toEqual(new Collection(['baz', 'bar']));
    expect(c.first()).toEqual('foo');

    expect(new Collection(['foo', 'bar', 'baz']).pop(6)).toEqual(new Collection(['baz', 'bar', 'foo']));
});

test('prepend', () => {
    let c: Collection<any, any> = new Collection(['one', 'two', 'three', 'four']);
    expect(c.prepend('zero').all()).toEqual(['zero', 'one', 'two', 'three', 'four']);

    c = new Collection({ one: 1, two: 2 });
    expect(c.prepend(0, 'zero').all()).toEqual({ zero: 0, one: 1, two: 2 });

    c = new Collection({ one: 1, two: 2 });
    expect(c.prepend(0, undefined).all()).toEqual({ 0: 0, one: 1, two: 2 });
});

test('pull', () => {
    let c: any = new Collection(['foo', 'bar']);
    expect(c.pull(0)).toEqual('foo');
    expect(c.pull(1)).toEqual('bar');

    c = new Collection(['foo', 'bar']);
    expect(c.pull(-1)).toEqual(undefined);
    expect(c.pull(2)).toEqual(undefined);

    c = new Collection(['foo', 'bar']);
    c.pull(0);
    expect(c.all()).toEqual([undefined, 'bar']);

    c.pull(1);
    expect(c.all()).toEqual([undefined, undefined]);

    let nestedCollection = new Collection([
        new Collection(['value', new Collection({ bar: 'baz', test: 'value' }).all()]).all(),
        'bar',
    ]);
    nestedCollection.pull('0.1.test');
    const actualArray = nestedCollection.toArray();
    const expectedArray = [['value', { bar: 'baz' }], 'bar'];
    expect(actualArray).toEqual(expectedArray);

    c = new Collection([]);
    const value = c.pull(0, 'foo');
    expect(value).toEqual('foo');
});

test('push', () => {
    let data: any = new Collection([4, 5, 6]);
    data.push(['a', 'b', 'c']);
    data.push({ who: 'Jonny', preposition: 'from', where: 'Laroe' });
    let actual = data.push('Jonny from Laroe').toArray();
    let expected: any = [
        4,
        5,
        6,
        ['a', 'b', 'c'],
        { who: 'Jonny', preposition: 'from', where: 'Laroe' },
        'Jonny from Laroe',
    ];
    expect(actual).toEqual(expected);

    data = new Collection([4, 5, 6]);
    data.push('Jonny', 'from', 'Laroe');
    data.push({ 11: 'Jonny', 12: 'from', 13: 'Laroe' });
    data.push(...(collect(['a', 'b', 'c']).toArray() as any));
    actual = data.push(...[]).toArray();
    expected = [4, 5, 6, 'Jonny', 'from', 'Laroe', { 11: 'Jonny', 12: 'from', 13: 'Laroe' }, 'a', 'b', 'c'];
    expect(actual).toEqual(expected);
});

test('put', () => {
    let data: any = new Collection({ name: 'taylor', email: 'foo' });
    data = data.put('name', 'dayle');
    expect(data.all()).toEqual({ name: 'dayle', email: 'foo' });

    data = new Collection(['taylor', 'shawn']);
    data = data.put(undefined, 'dayle');
    expect(data.all()).toEqual(['taylor', 'shawn', 'dayle']);

    data = new Collection({});
    expect(data.toArray()).toEqual({});

    data.put('foo', 1);
    expect(data.toArray()).toEqual({ foo: 1 });

    data.put('bar', { nested: 'two' });
    expect(data.toArray()).toEqual({ foo: 1, bar: { nested: 'two' } });

    data.put('foo', 3);
    expect(data.toArray()).toEqual({ foo: 3, bar: { nested: 'two' } });
});

test('range', () => {
    expect(Collection.range(1, 5).all()).toEqual([1, 2, 3, 4, 5]);
    expect(Collection.range(-2, 2).all()).toEqual([-2, -1, 0, 1, 2]);
    expect(Collection.range(-4, -2).all()).toEqual([-4, -3, -2]);
    expect(Collection.range(5, 1).all()).toEqual([5, 4, 3, 2, 1]);
    expect(Collection.range(2, -2).all()).toEqual([2, 1, 0, -1, -2]);
    expect(Collection.range(-2, -4).all()).toEqual([-2, -3, -4]);
});

test('reduce', () => {
    let data: any = new Collection([1, 2, 3]);
    expect(data.reduce((carry: any, element: any) => (carry += element), 0)).toEqual(6);

    data = new Collection({ foo: 'bar', baz: 'qux' });
    expect(data.reduce((carry: any, element: any, key: any) => (carry += key + element), '')).toEqual('foobarbazqux');
});

test('reduceSpread', () => {
    let data = new Collection([-1, 0, 1, 2, 3, 4, 5]);
    const [sum, max, min] = data.reduceSpread(
        (sum, max, min, value) => {
            sum += value;
            max = Math.max(max, value);
            min = Math.min(min, value);

            return [sum, max, min];
        },
        0,
        Number.MIN_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
    );
    expect(sum).toEqual(14);
    expect(max).toEqual(5);
    expect(min).toEqual(-1);

    data = new Collection([1]);
    // @ts-ignore
    expect(() => data.reduceSpread(() => false, null)).toThrow(
        "Collection.reduceSpread expects reducer to return an array, but got a 'boolean' instead.",
    );
});

test('reject', () => {
    let c: any = new Collection(['foo', 'bar']);
    expect(c.reject('bar').values().all()).toEqual(['foo']);

    c = new Collection(['foo', 'bar']);
    expect(
        c
            .reject((v: any) => v === 'bar')
            .values()
            .all(),
    ).toEqual(['foo']);

    c = new Collection(['foo', 'bar']);
    expect(c.reject('baz').values().all()).toEqual(['foo', 'bar']);

    c = new Collection(['foo', 'bar']);
    expect(
        c
            .reject((v: any) => v === 'baz')
            .values()
            .all(),
    ).toEqual(['foo', 'bar']);

    c = new Collection({ id: 1, primary: 'foo', secondary: 'bar' });
    expect(c.reject((_: any, key: any) => key === 'id').all()).toEqual({ primary: 'foo', secondary: 'bar' });

    const data1 = new Collection([false, true, new Collection().all(), 0]);
    expect(data1.reject().all()).toEqual([false, [], 0]);

    const data2 = new Collection({ a: true, b: true, c: true });
    expect(data2.reject().isEmpty()).toEqual(true);
});

test('replace', () => {
    let c: any = new Collection(['a', 'b', 'c']);
    expect(c.replace({ 1: 'd', 2: 'e' }).all()).toEqual(['a', 'd', 'e']);

    c = new Collection(['a', 'b', 'c']);
    expect(c.replace({ 1: 'd', 2: 'e', 3: 'f', 4: 'g' }).all()).toEqual(['a', 'd', 'e', 'f', 'g']);

    c = new Collection({ name: 'amir', family: 'otwell' });
    expect(c.replace({ name: 'taylor', age: 26 }).all()).toEqual({ name: 'taylor', family: 'otwell', age: 26 });

    c = new Collection(['a', 'b', 'c']);
    expect(c.replace(new Collection({ 1: 'd', 2: 'e' })).all()).toEqual(['a', 'd', 'e']);

    c = new Collection(['a', 'b', 'c']);
    expect(c.replace(new Collection({ 1: 'd', 2: 'e', 3: 'f', 4: 'g' })).all()).toEqual(['a', 'd', 'e', 'f', 'g']);

    c = new Collection({ name: 'amir', family: 'otwell' });
    expect(c.replace(new Collection({ name: 'taylor', age: 26 })).all()).toEqual({
        name: 'taylor',
        family: 'otwell',
        age: 26,
    });
});

test('replaceRecursive', () => {
    let c = new Collection(['a', 'b', ['c', 'd']]);
    expect(c.replaceRecursive({ 0: 'z', 2: { 1: 'e' } }).all()).toEqual({ 0: 'z', 1: 'b', 2: { 0: 'c', 1: 'e' } });

    c = new Collection(['a', 'b', ['c', 'd']]);
    expect(c.replaceRecursive({ 0: 'z', 2: { 1: 'e' }, 1: 'f' }).all()).toEqual({
        0: 'z',
        2: { 0: 'c', 1: 'e' },
        1: 'f',
    });

    c = new Collection(['a', 'b', ['c', 'd']]);
    expect(c.replaceRecursive(new Collection({ 0: 'z', 2: { 1: 'e' } })).all()).toEqual({
        0: 'z',
        1: 'b',
        2: { 0: 'c', 1: 'e' },
    });
});

test('reverse', () => {
    let data: any = new Collection(['zaeed', 'alan']);
    let reversed = data.reverse();
    expect(reversed.all()).toEqual(['alan', 'zaeed']);

    data = new Collection({ name: 'taylor', framework: 'laravel' });
    reversed = data.reverse();
    expect(reversed.all()).toEqual({ framework: 'laravel', name: 'taylor' });
});

test('search', () => {
    let c: any = new Collection({ 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 2, 6: 5, foo: 'bar' });
    expect(c.search(2)).toEqual('1');
    expect(c.search('2')).toEqual('1');
    expect(c.search('bar')).toEqual('foo');
    expect(c.search((value: any) => value > 4)).toEqual('4');
    expect(c.search((value: any) => isNaN(Number(value)))).toEqual('foo');

    c = new Collection([false, 0, 1, [], '']);
    expect(c.search('false', true)).toEqual(false);
    expect(c.search('1', true)).toEqual(false);
    expect(c.search(false, true)).toEqual(0);
    expect(c.search(0, true)).toEqual(1);
    expect(c.search(1, true)).toEqual(2);
    expect(c.search([], true)).toEqual(false);
    expect(c.search('', true)).toEqual(4);

    c = new Collection({ 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, foo: 'bar' });
    expect(c.search(6)).toEqual(false);
    expect(c.search('foo')).toEqual(false);
    expect(c.search((value: any) => value < 1 && !isNaN(Number(value)))).toEqual(false);
    expect(c.search((value: any) => value === 'nope')).toEqual(false);
});

test('select', () => {
    const data = new Collection([
        { first: 'Taylor', last: 'Otwell', email: 'taylorotwell@gmail.com' },
        { first: 'Jess', last: 'Archer', email: 'jessarcher@gmail.com' },
    ]);
    expect(data.select(['first', 'missing']).all()).toEqual([{ first: 'Taylor' }, { first: 'Jess' }]);
    expect(data.select(collect(['first', 'missing']) as any).all()).toEqual([{ first: 'Taylor' }, { first: 'Jess' }]);
    expect(data.select(['first', 'email']).all()).toEqual([
        { first: 'Taylor', email: 'taylorotwell@gmail.com' },
        { first: 'Jess', email: 'jessarcher@gmail.com' },
    ]);
    expect(data.select(collect(['first', 'email']) as any).all()).toEqual([
        { first: 'Taylor', email: 'taylorotwell@gmail.com' },
        { first: 'Jess', email: 'jessarcher@gmail.com' },
    ]);
});

test('shift', () => {
    let data: any = new Collection(['Taylor', 'Otwell']);
    expect(data.shift()).toEqual('Taylor');
    expect(data.first()).toEqual('Otwell');
    expect(data.shift()).toEqual('Otwell');
    expect(data.first()).toEqual(undefined);

    data = new Collection(['foo', 'bar', 'baz']);
    expect(data.shift(2)).toEqual(new Collection(['foo', 'bar']));
    expect(data.first()).toEqual('baz');

    expect(new Collection(['foo', 'bar', 'baz']).shift(6)).toEqual(new Collection(['foo', 'bar', 'baz']));

    data = new Collection(['foo', 'bar', 'baz']);
    expect(data.shift(0)).toEqual(new Collection([]));
    expect(data).toEqual(collect(['foo', 'bar', 'baz']));

    expect(() => new Collection(['foo', 'bar', 'baz']).shift(-1)).toThrow(
        'Number of shifted items may not be less than zero.',
    );
    expect(() => new Collection(['foo', 'bar', 'baz']).shift(-2)).toThrow(
        'Number of shifted items may not be less than zero.',
    );

    const items: any = collect([{ text: 'f' }, { text: 'x' }]);
    expect(items.shift()?.text).toEqual('f');
    expect(items.shift()?.text).toEqual('x');
    expect(items.shift()).toEqual(null);
});

test('skip', () => {
    const data = new Collection([1, 2, 3, 4, 5, 6]);

    // Total items to skip is smaller than collection length.
    expect(data.skip(4).values().all()).toEqual([5, 6]);

    // Total items to skip is more than collection length.
    expect(data.skip(10).values().all()).toEqual([]);
});

test('slice', () => {
    let data = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(data.slice(3).values().toArray()).toEqual([4, 5, 6, 7, 8]);

    data = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(data.slice(-3).values().toArray()).toEqual([6, 7, 8]);

    data = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(data.slice(3, 3).values().toArray()).toEqual([4, 5, 6]);

    data = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(data.slice(3, -1).values().toArray()).toEqual([4, 5, 6, 7]);

    data = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(data.slice(-5, 3).values().toArray()).toEqual([4, 5, 6]);

    data = new Collection([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(data.slice(-6, -2).values().toArray()).toEqual([3, 4, 5, 6]);
});

test('sliding', () => {
    // Default parameters: size = 2, step = 1
    expect(Collection.times(0).sliding().toArray()).toEqual([]);
    expect(Collection.times(1).sliding().toArray()).toEqual([]);
    expect(Collection.times(2).sliding().toArray()).toEqual([[1, 2]]);
    expect(
        Collection.times(3)
            .sliding()
            .map((value) => value.values())
            .toArray(),
    ).toEqual([
        [1, 2],
        [2, 3],
    ]);

    // Custom step: size = 2, step = 3
    expect(Collection.times(1).sliding(2, 3).toArray()).toEqual([]);
    expect(Collection.times(2).sliding(2, 3).toArray()).toEqual([[1, 2]]);
    expect(Collection.times(3).sliding(2, 3).toArray()).toEqual([[1, 2]]);
    expect(Collection.times(4).sliding(2, 3).toArray()).toEqual([[1, 2]]);
    expect(
        Collection.times(5)
            .sliding(2, 3)
            .map((value) => value.values())
            .toArray(),
    ).toEqual([
        [1, 2],
        [4, 5],
    ]);

    // Custom size: size = 3, step = 1
    expect(Collection.times(2).sliding(3).toArray()).toEqual([]);
    expect(Collection.times(3).sliding(3).toArray()).toEqual([[1, 2, 3]]);
    expect(
        Collection.times(4)
            .sliding(3)
            .map((value) => value.values())
            .toArray(),
    ).toEqual([
        [1, 2, 3],
        [2, 3, 4],
    ]);
    expect(
        Collection.times(4)
            .sliding(3)
            .map((value) => value.values())
            .toArray(),
    ).toEqual([
        [1, 2, 3],
        [2, 3, 4],
    ]);

    // Custom size and custom step: size = 3, step = 2
    expect(Collection.times(2).sliding(3, 2).toArray()).toEqual([]);
    expect(Collection.times(3).sliding(3, 2).toArray()).toEqual([[1, 2, 3]]);
    expect(Collection.times(4).sliding(3, 2).toArray()).toEqual([[1, 2, 3]]);
    expect(
        Collection.times(5)
            .sliding(3, 2)
            .map((value) => value.values())
            .toArray(),
    ).toEqual([
        [1, 2, 3],
        [3, 4, 5],
    ]);
    expect(
        Collection.times(6)
            .sliding(3, 2)
            .map((value) => value.values())
            .toArray(),
    ).toEqual([
        [1, 2, 3],
        [3, 4, 5],
    ]);

    // Ensure keys are preserved, and inner chunks are also collections
    const chunks = Collection.times(3).sliding();
    expect(chunks.toArray()).toEqual([
        [1, 2],
        [2, 3],
    ]);
    expect(chunks).toBeInstanceOf(Collection);
    expect(chunks.first()).toBeInstanceOf(Collection);
    expect(chunks.skip(1).first()).toBeInstanceOf(Collection);
});

test('sole', () => {
    let collection = new Collection([{ name: 'foo' }, { name: 'bar' }]);
    expect(collection.where('name', 'foo').sole()).toEqual({ name: 'foo' });
    expect(collection.sole('name', '=', 'foo')).toEqual({ name: 'foo' });
    expect(collection.sole('name', 'foo')).toEqual({ name: 'foo' });
    expect(() => collection.where('name', 'INVALID').sole()).toThrow('Item not found.');

    collection = new Collection([{ name: 'foo' }, { name: 'foo' }, { name: 'bar' }]);
    expect(() => collection.where('name', 'foo').sole()).toThrow('2 items were found.');

    let data = new Collection(['foo', 'bar', 'baz']);
    const result = data.sole((value) => value === 'bar');
    expect(result).toEqual('bar');

    expect(() => data.sole((value) => value === 'invalid')).toThrow('Item not found.');

    data = new Collection(['foo', 'bar', 'bar']);
    expect(() => data.sole((value) => value === 'bar')).toThrow('2 items were found.');
});

test('sort', () => {
    let data: any = new Collection([5, 3, 1, 2, 4]).sort();
    expect(data.values().all()).toEqual([1, 2, 3, 4, 5]);

    data = new Collection([-1, -3, -2, -4, -5, 0, 5, 3, 1, 2, 4]).sort();
    expect(data.values().all()).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);

    data = new Collection(['foo', 'bar-10', 'bar-1']).sort();
    expect(data.values().all()).toEqual(['bar-1', 'bar-10', 'foo']);

    data = new Collection(['T2', 'T1', 'T10']).sort();
    expect(data.values().all()).toEqual(['T1', 'T10', 'T2']);

    data = new Collection(['T2', 'T1', 'T10']).sort(SORT_NATURAL);
    expect(data.values().all()).toEqual(['T1', 'T2', 'T10']);

    data = new Collection([5, 3, 1, 2, 4]).sort((a, b) => {
        if (a === b) {
            return 0;
        }

        return a < b ? -1 : 1;
    });
    expect(Object.values(data.all())).toEqual(range(1, 5));
});

test('sortBy', () => {
    let data: any = new Collection(['taylor', 'dayle']);
    data = data.sortBy((x: any) => x);
    expect(Object.values(data.all())).toEqual(['dayle', 'taylor']);

    data = new Collection(['dayle', 'taylor']);
    data = data.sortByDesc((x: any) => x);
    expect(Object.values(data.all())).toEqual(['taylor', 'dayle']);

    data = new Collection([{ name: 'taylor' }, { name: 'dayle' }]);
    data = data.sortBy('name', SORT_STRING);
    expect(Object.values(data.all())).toEqual([{ name: 'dayle' }, { name: 'taylor' }]);

    data = new Collection([{ name: 'taylor' }, { name: 'dayle' }]);
    data = data.sortBy('name', SORT_STRING, true);
    expect(Object.values(data.all())).toEqual([{ name: 'taylor' }, { name: 'dayle' }]);

    data = new Collection([{ sort: 2 }, { sort: 1 }]);
    data = data.sortBy([['sort', 'asc']]);
    expect(Object.values(data.all())).toEqual([{ sort: 1 }, { sort: 2 }]);

    const itemFoo = { first: 'f', second: null };
    const itemBar = { first: 'f', second: 's' };
    data = new Collection([itemFoo, itemBar]);
    data = data.sortBy(
        [
            ['first', 'desc'],
            ['second', 'desc'],
        ],
        SORT_NATURAL,
    );
    expect(data.first()).toEqual(itemBar);
    expect(data.skip(1).first()).toEqual(itemFoo);

    data = new Collection({ a: 'taylor', b: 'dayle' });
    data = data.sortBy((x: any) => x);
    expect(data.all()).toEqual({ b: 'dayle', a: 'taylor' });

    data = new Collection({ a: { sort: 2 }, b: { sort: 1 } });
    data = data.sortBy([['sort', 'asc']]);
    expect(data.all()).toEqual({ b: { sort: 1 }, a: { sort: 2 } });
});

test('sortByDesc', () => {
    let data = new Collection([
        { id: 1, name: 'foo' },
        { id: 2, name: 'bar' },
    ]);
    data = data.sortByDesc(['id']);
    expect(Object.values(data.all())).toEqual([
        { id: 2, name: 'bar' },
        { id: 1, name: 'foo' },
    ]);

    data = new Collection([
        { id: 1, name: 'foo' },
        { id: 2, name: 'bar' },
        { id: 2, name: 'baz' },
    ]);
    data = data.sortByDesc(['id']);
    expect(Object.values(data.all())).toEqual([
        { id: 2, name: 'bar' },
        { id: 2, name: 'baz' },
        { id: 1, name: 'foo' },
    ]);

    data = data.sortByDesc(['id', 'name']);
    expect(Object.values(data.all())).toEqual([
        { id: 2, name: 'baz' },
        { id: 2, name: 'bar' },
        { id: 1, name: 'foo' },
    ]);
});

test('sortDesc', () => {
    let data: any = new Collection([5, 3, 1, 2, 4]).sortDesc();
    expect(data.values().all()).toEqual([5, 4, 3, 2, 1]);

    data = new Collection([-1, -3, -2, -4, -5, 0, 5, 3, 1, 2, 4]).sortDesc();
    expect(data.values().all()).toEqual([5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5]);

    data = new Collection(['bar-1', 'foo', 'bar-10']).sortDesc();
    expect(data.values().all()).toEqual(['foo', 'bar-10', 'bar-1']);

    data = new Collection(['T2', 'T1', 'T10']).sortDesc();
    expect(data.values().all()).toEqual(['T2', 'T10', 'T1']);

    data = new Collection(['T2', 'T1', 'T10']).sortDesc(SORT_NATURAL);
    expect(data.values().all()).toEqual(['T10', 'T2', 'T1']);
});

test('sortKeys', () => {
    const data = new Collection({ b: 'dayle', a: 'taylor' });
    expect(data.sortKeys().all()).toEqual({ a: 'taylor', b: 'dayle' });
});

test('sortKeysDesc', () => {
    const data = new Collection({ a: 'taylor', b: 'dayle' });
    expect(data.sortKeysDesc().all()).toEqual({ b: 'dayle', a: 'taylor' });
});

test('sortKeysUsing', () => {
    const data = new Collection({ B: 'dayle', a: 'taylor' });
    expect(data.sortKeysUsing(strnatcasecmp).all()).toEqual({ a: 'taylor', B: 'dayle' });
});

test('splice', () => {
    let data = new Collection(['foo', 'baz']);
    data.splice(1);
    expect(data.all()).toEqual(['foo']);

    data = new Collection(['foo', 'baz']);
    data.splice(1, 0, ['bar']);
    expect(data.all()).toEqual(['foo', 'bar', 'baz']);

    data = new Collection(['foo', 'baz']);
    data.splice(1, 1);
    expect(data.all()).toEqual(['foo']);

    data = new Collection(['foo', 'baz']);
    const cut = data.splice(1, 1, ['bar']);
    expect(data.all()).toEqual(['foo', 'bar']);
    expect(cut.all()).toEqual(['baz']);

    data = new Collection(['foo', 'baz']);
    data.splice(1, 0, ['bar']);
    expect(data.all()).toEqual(['foo', 'bar', 'baz']);

    data = new Collection(['foo', 'baz']);
    data.splice(1, 0, new Collection(['bar']).toArray() as any);
    expect(data.all()).toEqual(['foo', 'bar', 'baz']);
});

test('split', () => {
    let data: any = new Collection(['a', 'b', 'c', 'd']);
    let split = data.split(2);
    expect(split.get(0).all()).toEqual(['a', 'b']);
    expect(split.get(1).all()).toEqual(['c', 'd']);
    expect(split).toBeInstanceOf(Collection);
    expect(
        data
            .split(2)
            .map((chunk: any) => chunk.values().toArray())
            .toArray(),
    ).toEqual([
        ['a', 'b'],
        ['c', 'd'],
    ]);

    data = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    split = data.split(2);
    expect(split.get(0).all()).toEqual([1, 2, 3, 4, 5]);
    expect(split.get(1).all()).toEqual([6, 7, 8, 9, 10]);
    expect(
        data
            .split(2)
            .map((chunk: any) => chunk.values().toArray())
            .toArray(),
    ).toEqual([
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
    ]);

    data = new Collection(['a', 'b', 'c']);
    split = data.split(2);
    expect(split.get(0).all()).toEqual(['a', 'b']);
    expect(split.get(1).all()).toEqual(['c']);
    expect(
        data
            .split(2)
            .map((chunk: any) => chunk.values().toArray())
            .toArray(),
    ).toEqual([['a', 'b'], ['c']]);

    data = new Collection(['a']);
    split = data.split(2);
    expect(split.get(0).all()).toEqual(['a']);
    expect(split.get(1)).toEqual(undefined);
    expect(
        data
            .split(2)
            .map((chunk: any) => chunk.values().toArray())
            .toArray(),
    ).toEqual([['a']]);

    data = new Collection(['a', 'b', 'c', 'd']);
    split = data.split(3);
    expect(split.get(0).all()).toEqual(['a', 'b']);
    expect(split.get(1).all()).toEqual(['c']);
    expect(split.get(2).all()).toEqual(['d']);
    expect(
        data
            .split(3)
            .map((chunk: any) => chunk.values().toArray())
            .toArray(),
    ).toEqual([['a', 'b'], ['c'], ['d']]);

    data = new Collection(['a', 'b', 'c', 'd', 'e']);
    split = data.split(3);
    expect(split.get(0).all()).toEqual(['a', 'b']);
    expect(split.get(1).all()).toEqual(['c', 'd']);
    expect(split.get(2).all()).toEqual(['e']);
    expect(
        data
            .split(3)
            .map((chunk: any) => chunk.values().toArray())
            .toArray(),
    ).toEqual([['a', 'b'], ['c', 'd'], ['e']]);

    data = new Collection(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    split = data.split(6);
    expect(split.get(0).all()).toEqual(['a', 'b']);
    expect(split.get(1).all()).toEqual(['c', 'd']);
    expect(split.get(2).all()).toEqual(['e', 'f']);
    expect(split.get(3).all()).toEqual(['g', 'h']);
    expect(split.get(4).all()).toEqual(['i']);
    expect(split.get(5).all()).toEqual(['j']);
    expect(
        data
            .split(6)
            .map((chunk: any) => chunk.values().toArray())
            .toArray(),
    ).toEqual([['a', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i'], ['j']]);

    data = new Collection();
    split = data.split(2);
    expect(split.get(0)).toEqual(undefined);
    expect(split.get(1)).toEqual(undefined);
    expect(
        data
            .split(2)
            .map((chunk: any) => chunk.values().toArray())
            .toArray(),
    ).toEqual([]);
});

test('splitIn', () => {
    let data: any = new Collection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    data = data.splitIn(3);
    expect(data).toBeInstanceOf(Collection);
    expect(data.first()).toBeInstanceOf(Collection);
    expect(data.count()).toEqual(3);
    expect(data.get(0).values().toArray()).toEqual([1, 2, 3, 4]);
    expect(data.get(1).values().toArray()).toEqual([5, 6, 7, 8]);
    expect(data.get(2).values().toArray()).toEqual([9, 10]);
});

test('sum', () => {
    let c: any = new Collection([{ foo: 50 }, { foo: 50 }]);
    expect(c.sum('foo')).toEqual(100);
    expect(c.sum((i: any) => i.foo)).toEqual(100);

    c = new Collection([1, 2, 3, 4, 5]);
    expect(c.sum()).toEqual(15);

    c = new Collection();
    expect(c.sum('foo')).toEqual(0);
});

test('take', () => {
    let data = new Collection(['taylor', 'dayle', 'shawn']);
    data = data.take(2);
    expect(data.all()).toEqual(['taylor', 'dayle']);

    data = new Collection(['taylor', 'dayle', 'shawn']);
    data = data.take(-2);
    expect(data.all()).toEqual(['dayle', 'shawn']);
});

test('tap', () => {
    let data = new Collection([1, 2, 3]);
    let fromTap: any = [];
    let tappedInstance: any = null;

    data = data.tap((data) => {
        fromTap = data.slice(0, 1).toArray();
        tappedInstance = data;
    });

    expect(tappedInstance).toEqual(data);
    expect(fromTap).toEqual([1]);
    expect(data.toArray()).toEqual([1, 2, 3]);
});

test('times', () => {
    const two = Collection.times(2, (number) => 'slug-' + number);
    expect(two.all()).toEqual(['slug-1', 'slug-2']);

    const zero = Collection.times(0, (number) => 'slug-' + number);
    expect(zero.isEmpty()).toEqual(true);

    const negative = Collection.times(-4, (number) => 'slug-' + number);
    expect(negative.isEmpty()).toEqual(true);

    const ranged = Collection.times(5);
    expect(ranged.all()).toEqual(range(1, 5));
});

test('toArray', () => {
    const c = new Collection(['foo.array', 'bar.array']);
    expect(c.toArray()).toEqual(['foo.array', 'bar.array']);
});

test('toJson', () => {
    const c = new Collection({ foo: 'bar', bar: 'baz' });
    expect(c.toJson()).toEqual(JSON.stringify({ foo: 'bar', bar: 'baz' }));
});

test('transform', () => {
    let data = new Collection({ first: 'taylor', last: 'otwell' });
    data.transform((item, key) => key + '-' + item.split('').reverse().join(''));
    expect(data.all()).toEqual({ first: 'first-rolyat', last: 'last-llewto' });
});

test('undot', () => {
    let data = Collection.make({
        name: 'Taylor',
        'meta.foo': 'bar',
        'meta.baz': 'boom',
        'meta.bam.boom': 'bip',
    }).undot();
    expect(data.all()).toEqual({ name: 'Taylor', meta: { foo: 'bar', baz: 'boom', bam: { boom: 'bip' } } });

    data = Collection.make({ 'foo.0': 'bar', 'foo.1': 'baz', 'foo.baz': 'boom' }).undot();
    expect(data.all()).toEqual({ foo: { 0: 'bar', 1: 'baz', baz: 'boom' } });
});

test('union', () => {
    let c = new Collection({ name: 'Hello' });
    expect(c.union({ id: 1 }).all()).toEqual({ name: 'Hello', id: 1 });

    c = new Collection({ name: 'Hello' });
    expect(c.union(new Collection({ name: 'World', id: 1 })).all()).toEqual({ name: 'Hello', id: 1 });
});

test('unique', () => {
    let c: any = new Collection(['Hello', 'World', 'World']);
    expect(c.unique().all()).toEqual(['Hello', 'World']);

    c = new Collection([
        [1, 2],
        [1, 2],
        [2, 3],
        [3, 4],
        [2, 3],
    ]);
    expect(c.unique().values().all()).toEqual([
        [1, 2],
        [2, 3],
        [3, 4],
    ]);

    c = new Collection({
        1: { id: 1, first: 'Taylor', last: 'Otwell' },
        2: { id: 2, first: 'Taylor', last: 'Otwell' },
        3: { id: 3, first: 'Abigail', last: 'Otwell' },
        4: { id: 4, first: 'Abigail', last: 'Otwell' },
        5: { id: 5, first: 'Taylor', last: 'Swift' },
        6: { id: 6, first: 'Taylor', last: 'Swift' },
    });
    expect(c.unique('first').all()).toEqual({
        1: { id: 1, first: 'Taylor', last: 'Otwell' },
        3: { id: 3, first: 'Abigail', last: 'Otwell' },
    });
    expect(c.unique((item: any) => item['first'] + item['last']).all()).toEqual({
        1: { id: 1, first: 'Taylor', last: 'Otwell' },
        3: { id: 3, first: 'Abigail', last: 'Otwell' },
        5: { id: 5, first: 'Taylor', last: 'Swift' },
    });
    expect(c.unique((_: any, key: any) => key % 2).all()).toEqual({
        1: { id: 1, first: 'Taylor', last: 'Otwell' },
        2: { id: 2, first: 'Taylor', last: 'Otwell' },
    });

    c = new Collection([
        { id: '0', name: 'zero' },
        { id: '00', name: 'double zero' },
        { id: '0', name: 'again zero' },
    ]);
    expect(c.uniqueStrict('id').all()).toEqual([
        { id: '0', name: 'zero' },
        { id: '00', name: 'double zero' },
    ]);
});

test('unless', () => {
    let data = new Collection(['michael', 'tom']);
    data = data.unless(false, (data) => data.concat(['caleb']));
    expect(data.toArray()).toEqual(['michael', 'tom', 'caleb']);

    data = new Collection(['michael', 'tom']);
    data = data.unless(true, (data) => data.concat(['caleb']));
    expect(data.toArray()).toEqual(['michael', 'tom']);

    data = new Collection(['michael', 'tom']);
    data = data.unless(
        true,
        (data) => data.concat(['caleb']),
        (data) => data.concat(['taylor']),
    );
    expect(data.toArray()).toEqual(['michael', 'tom', 'taylor']);
});

test('unlessEmpty', () => {
    let data = new Collection(['michael', 'tom']);
    data = data.unlessEmpty((data) => data.concat(['adam']));
    expect(data.toArray()).toEqual(['michael', 'tom', 'adam']);

    data = new Collection();
    data = data.unlessEmpty((data) => data.concat(['adam']));
    expect(data.toArray()).toEqual([]);

    data = new Collection(['michael', 'tom']);
    data = data.unlessEmpty(
        (data) => data.concat(['adam']),
        (data) => data.concat(['taylor']),
    );
    expect(data.toArray()).toEqual(['michael', 'tom', 'adam']);
});

test('unlessNotEmpty', () => {
    let data = new Collection(['michael', 'tom']);
    data = data.unlessNotEmpty((data) => data.concat(['adam']));
    expect(data.toArray()).toEqual(['michael', 'tom']);

    data = new Collection();
    data = data.unlessNotEmpty((data) => data.concat(['adam']));
    expect(data.toArray()).toEqual(['adam']);

    data = new Collection(['michael', 'tom']);
    data = data.unlessNotEmpty(
        (data) => data.concat(['adam']),
        (data) => data.concat(['taylor']),
    );
    expect(data.toArray()).toEqual(['michael', 'tom', 'taylor']);
});

test('unwrap', () => {
    const data = new Collection(['foo']);
    expect(Collection.unwrap(data)).toEqual(['foo']);
    expect(Collection.unwrap(['foo'])).toEqual(['foo']);
});

test('when', () => {
    let data = new Collection(['michael', 'tom']);
    data = data.when('adam', (data, newName) => data.concat([newName]));
    expect(data.toArray()).toEqual(['michael', 'tom', 'adam']);

    data = new Collection(['michael', 'tom']);
    data = data.when(false, (data) => data.concat(['adam']));
    expect(data.toArray()).toEqual(['michael', 'tom']);

    data = new Collection(['michael', 'tom']);
    data = data.when(
        false,
        (data) => data.concat(['adam']),
        (data) => data.concat(['taylor']),
    );
    expect(data.toArray()).toEqual(['michael', 'tom', 'taylor']);
});

test('whenEmpty', () => {
    let data = new Collection(['michael', 'tom']);
    data = data.whenEmpty(() => {
        throw new Error('whenEmpty() should not trigger on a collection with items');
    });
    expect(data.toArray()).toEqual(['michael', 'tom']);

    data = new Collection();
    data = data.whenEmpty((data) => data.concat(['adam']));
    expect(data.toArray()).toEqual(['adam']);

    data = new Collection(['michael', 'tom']);
    data = data.whenEmpty(
        (data) => data.concat(['adam']),
        (data) => data.concat(['taylor']),
    );
    expect(data.toArray()).toEqual(['michael', 'tom', 'taylor']);
});

test('whenNotEmpty', () => {
    let data = new Collection(['michael', 'tom']);
    data = data.whenNotEmpty((data) => data.concat(['adam']));
    expect(data.toArray()).toEqual(['michael', 'tom', 'adam']);

    data = new Collection();
    data = data.whenNotEmpty((data) => data.concat(['adam']));
    expect(data.toArray()).toEqual([]);

    data = new Collection(['michael', 'tom']);
    data = data.whenNotEmpty(
        (data) => data.concat(['adam']),
        (data) => data.concat(['taylor']),
    );
    expect(data.toArray()).toEqual(['michael', 'tom', 'adam']);
});

test('where', () => {
    let c: any = new Collection([{ v: 1 }, { v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.where('v', 3).values().all()).toEqual([{ v: 3 }, { v: '3' }]);
    expect(c.where('v', '=', 3).values().all()).toEqual([{ v: 3 }, { v: '3' }]);
    expect(c.where('v', '==', 3).values().all()).toEqual([{ v: 3 }, { v: '3' }]);
    expect(c.where('v', 'garbage', 3).values().all()).toEqual([{ v: 3 }, { v: '3' }]);
    expect(c.where('v', '===', 3).values().all()).toEqual([{ v: 3 }]);
    expect(c.where('v', '<>', 3).values().all()).toEqual([{ v: 1 }, { v: 2 }, { v: 4 }]);
    expect(c.where('v', '!=', 3).values().all()).toEqual([{ v: 1 }, { v: 2 }, { v: 4 }]);
    expect(c.where('v', '!==', 3).values().all()).toEqual([{ v: 1 }, { v: 2 }, { v: '3' }, { v: 4 }]);
    expect(c.where('v', '<=', 3).values().all()).toEqual([{ v: 1 }, { v: 2 }, { v: 3 }, { v: '3' }]);
    expect(c.where('v', '>=', 3).values().all()).toEqual([{ v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.where('v', '<', 3).values().all()).toEqual([{ v: 1 }, { v: 2 }]);
    expect(c.where('v', '>', 3).values().all()).toEqual([{ v: 4 }]);

    const object = { foo: 'bar' };
    expect(c.where('v', object).values().all()).toEqual([]);
    expect(c.where('v', '<>', object).values().all()).toEqual([{ v: 1 }, { v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.where('v', '!=', object).values().all()).toEqual([{ v: 1 }, { v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.where('v', '!==', object).values().all()).toEqual([{ v: 1 }, { v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.where('v', '>', object).values().all()).toEqual([]);
    expect(
        c
            .where((value: any) => value['v'] == 3)
            .values()
            .all(),
    ).toEqual([{ v: 3 }, { v: '3' }]);
    expect(
        c
            .where((value: any) => value['v'] === 3)
            .values()
            .all(),
    ).toEqual([{ v: 3 }]);

    c = new Collection([{ v: 1 }, { v: object }]);
    expect(c.where('v', object).values().all()).toEqual([{ v: object }]);
    expect(c.where('v', '<>', null).values().all()).toEqual([{ v: 1 }, { v: object }]);
    expect(c.where('v', '<', null).values().all()).toEqual([]);

    c = new Collection([{ v: 1 }, { v: 'hello' }]);
    expect(c.where('v', 'hello').values().all()).toEqual([{ v: 'hello' }]);

    c = new Collection([{ v: 1 }, { v: 2 }, { v: null }]);
    expect(c.where('v').values().all()).toEqual([{ v: 1 }]);

    c = new Collection([
        { v: 1, g: 3 },
        { v: 2, g: 2 },
        { v: 2, g: 3 },
        { v: 2, g: null },
    ]);
    expect(c.where('v', 2).where('g', 3).values().all()).toEqual([{ v: 2, g: 3 }]);
    expect(c.where('v', 2).where('g', '>', 2).values().all()).toEqual([{ v: 2, g: 3 }]);
    expect(c.where('v', 2).where('g', 4).values().all()).toEqual([]);
    expect(c.where('v', 2).whereNull('g').values().all()).toEqual([{ v: 2, g: null }]);
});

test('whereBetween', () => {
    const c = new Collection([{ v: 1 }, { v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.whereBetween('v', [2, 4]).values().all()).toEqual([{ v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.whereBetween('v', [-1, 1]).all()).toEqual([{ v: 1 }]);
    expect(c.whereBetween('v', [3, 3]).values().all()).toEqual([{ v: 3 }, { v: '3' }]);
});

test('whereIn', () => {
    const c = new Collection([{ v: 1 }, { v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.whereIn('v', [1, 3]).values().all()).toEqual([{ v: 1 }, { v: 3 }, { v: '3' }]);
    expect(c.whereIn('v', [2]).whereIn('v', [1, 3]).values().all()).toEqual([]);
    expect(c.whereIn('v', [1]).whereIn('v', [1, 3]).values().all()).toEqual([{ v: 1 }]);
});

test('whereInStrict', () => {
    const c = new Collection([{ v: 1 }, { v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.whereInStrict('v', [1, 3]).values().all()).toEqual([{ v: 1 }, { v: 3 }]);
});

test('whereInstanceOf', () => {
    const c = new Collection([1, 'foo', new Collection(), 2, new Arr()]);
    expect(c.whereInstanceOf(Collection).count()).toEqual(1);
    expect(c.whereInstanceOf([Collection, Arr]).count()).toEqual(2);
});

test('WhereNotBetween', () => {
    const c = new Collection([{ v: 1 }, { v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.whereNotBetween('v', [2, 4]).values().all()).toEqual([{ v: 1 }]);
    expect(c.whereNotBetween('v', [-1, 1]).values().all()).toEqual([{ v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.whereNotBetween('v', [3, 3]).values().all()).toEqual([{ v: 1 }, { v: 2 }, { v: 4 }]);
});

test('whereNotIn', () => {
    const c = new Collection([{ v: 1 }, { v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.whereNotIn('v', [1, 3]).values().all()).toEqual([{ v: 2 }, { v: 4 }]);
    expect(c.whereNotIn('v', [2]).whereNotIn('v', [1, 3]).values().all()).toEqual([{ v: 4 }]);
});

test('whereNotInStrict', () => {
    const c = new Collection([{ v: 1 }, { v: 2 }, { v: 3 }, { v: '3' }, { v: 4 }]);
    expect(c.whereNotInStrict('v', [1, 3]).values().all()).toEqual([{ v: 2 }, { v: '3' }, { v: 4 }]);
});

test('whereNotNull', () => {
    const originalData = [{ name: 'Taylor' }, { name: null }, { name: 'Bert' }, { name: false }, { name: '' }];
    let data: any = new Collection(originalData);
    expect(data.whereNotNull('name').all()).toEqual([
        { name: 'Taylor' },
        { name: 'Bert' },
        { name: false },
        { name: '' },
    ]);
    expect(data.whereNotNull().all()).toEqual(originalData);

    data = new Collection([1, null, 3, 'null', false, true]);
    expect(data.whereNotNull().all()).toEqual([1, 3, 'null', false, true]);
});

test('whereNull', () => {
    const data = new Collection([{ name: 'Taylor' }, { name: null }, { name: 'Bert' }, { name: false }, { name: '' }]);
    expect(data.whereNull('name').all()).toEqual([{ name: null }]);

    const collection = new Collection({ 0: 1, 1: null, 2: 3, 3: 'null', 4: false, 5: true });
    expect(collection.whereNull().all()).toEqual({ 1: null });
});

test('whereStrict', () => {
    const c = new Collection([{ v: 3 }, { v: '3' }]);
    expect(c.whereStrict('v', 3).values().all()).toEqual([{ v: 3 }]);
});

test('wrap', () => {
    let data = Collection.wrap('foo');
    expect(data.all()).toEqual(['foo']);

    data = Collection.wrap(['foo']);
    expect(data.all()).toEqual(['foo']);

    data = Collection.wrap(Collection.make(['foo']));
    expect(data.all()).toEqual(['foo']);
});

test('value', () => {
    let c: any = new Collection([
        { id: 1, name: 'Hello' },
        { id: 2, name: 'World' },
    ]);
    expect(c.value('name')).toEqual('Hello');
    expect(c.where('id', 2).value('name')).toEqual('World');

    c = new Collection([
        { id: 1, pivot: { value: 'foo' } },
        { id: 2, pivot: { value: 'bar' } },
    ]);
    expect(c.value('pivot')).toEqual({ value: 'foo' });
    expect(c.value('pivot.value')).toEqual('foo');
    expect(c.where('id', 2).value('pivot.value')).toEqual('bar');

    c = new Collection([
        { id: 1, name: StaffEnum.Taylor },
        { id: 2, name: StaffEnum.Joe },
    ]);
    expect(c.value('name')).toEqual(StaffEnum.Taylor);
    expect(c.where('id', 2).value('name')).toEqual(StaffEnum.Joe);
});

test('values', () => {
    const data = new Collection({ 1: 'a', 2: 'b', 3: 'c' });
    expect(data.values().all()).toEqual({ 0: 'a', 1: 'b', 2: 'c' });

    const c = new Collection([
        { id: 1, name: 'Hello' },
        { id: 2, name: 'World' },
    ]);
    expect(
        c
            .filter((item) => item['id'] == 2)
            .values()
            .all(),
    ).toEqual([{ id: 2, name: 'World' }]);
});

test('zip', () => {
    let c: Collection<any, any> = new Collection([1, 2, 3]);
    c = c.zip(new Collection([4, 5, 6]) as any);
    expect(c).toBeInstanceOf(Collection);
    expect(c.get(0)).toBeInstanceOf(Collection);
    expect(c.get(1)).toBeInstanceOf(Collection);
    expect(c.get(2)).toBeInstanceOf(Collection);
    expect(c.toArray().length).toEqual(3);
    expect(c.get(0).all()).toEqual([1, 4]);
    expect(c.get(1).all()).toEqual([2, 5]);
    expect(c.get(2).all()).toEqual([3, 6]);

    c = new Collection([1, 2, 3]);
    c = c.zip([4, 5, 6], [7, 8, 9]);
    expect(c.toArray().length).toEqual(3);
    expect(c.get(0).all()).toEqual([1, 4, 7]);
    expect(c.get(1).all()).toEqual([2, 5, 8]);
    expect(c.get(2).all()).toEqual([3, 6, 9]);

    c = new Collection([1, 2, 3]);
    c = c.zip([4, 5, 6], [7]);
    expect(c.toArray().length).toEqual(3);
    expect(c.get(0).all()).toEqual([1, 4, 7]);
    expect(c.get(1).all()).toEqual([2, 5, undefined]);
    expect(c.get(2).all()).toEqual([3, 6, undefined]);
});

test('collectionFromBackedEnum', () => {
    const data = new Collection(TestBackedEnum.A);
    expect(data.toArray()).toEqual([TestBackedEnum.A]);
});

test('valueRetrieverAcceptsDotNotation', () => {
    let c = new Collection([
        { id: 1, foo: { bar: 'B' } },
        { id: 2, foo: { bar: 'A' } },
    ]);
    c = c.sortBy('foo.bar');
    expect(c.pluck('id').all()).toEqual([2, 1]);
});
