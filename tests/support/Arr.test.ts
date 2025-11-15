import { expect, test } from 'vitest';
import { Arr } from '../src/Arr';

test('accessible', () => {
    expect(Arr.accessible([])).toEqual(true);
    expect(Arr.accessible([1, 2])).toEqual(true);
    expect(Arr.accessible({ a: 1, b: 2 })).toEqual(true);
    expect(Arr.accessible(null)).toEqual(false);
    expect(Arr.accessible('abc')).toEqual(false);
    expect(Arr.accessible({})).toEqual(true);
    expect(Arr.accessible({ a: 1, b: 2 })).toEqual(true);
    expect(Arr.accessible(123)).toEqual(false);
    expect(Arr.accessible(12.34)).toEqual(false);
    expect(Arr.accessible(true)).toEqual(false);
    expect(Arr.accessible(new Date())).toEqual(true);
    expect(Arr.accessible(() => null)).toEqual(false);
});

test('add', () => {
    const array = Arr.add({ name: 'Desk' }, 'price', 100);

    expect(array).toEqual({ name: 'Desk', price: 100 });
    expect(Arr.add({}, 'surname', 'Mövsümov')).toEqual({ surname: 'Mövsümov' });
    expect(Arr.add({}, 'developer.name', 'Ferid')).toEqual({ developer: { name: 'Ferid' } });
    expect(Arr.add([], 1, 'hAz')).toEqual([undefined, 'hAz']);
    expect(Arr.add([], '1.1', 'hAz')).toEqual([undefined, [undefined, 'hAz']]);

    // Case where the key already exists
    expect(Arr.add({ type: 'Table' }, 'type', 'Chair')).toEqual({ type: 'Table' });
    expect(Arr.add({ category: { type: 'Table' } }, 'category.type', 'Chair')).toEqual({ category: { type: 'Table' } });
});

test('array', () => {
    const testArray = { string: 'foo bar', array: ['foo', 'bar'] };

    // Test array values are returned as arrays
    expect(Arr.array(testArray, 'array')).toEqual(['foo', 'bar']);

    // Test that default array values are returned for missing keys
    expect(Arr.array(testArray, 'missing_key', [1, 'two'])).toEqual([1, 'two']);

    // Test that an exception is raised if the value is not an array
    expect(() => Arr.array(testArray, 'string')).toThrow(
        'Array value for key [string] must be an array, string found.',
    );
});

test('boolean', () => {
    const testArray = { string: 'foo bar', boolean: true };

    // Test boolean values are returned as booleans
    expect(Arr.boolean(testArray, 'boolean')).toEqual(true);

    // Test that default boolean values are returned for missing keys
    expect(Arr.boolean(testArray, 'missing_key', true)).toEqual(true);

    // Test that an exception is raised if the value is not a boolean
    expect(() => Arr.boolean(testArray, 'string')).toThrow(
        'Array value for key [string] must be a boolean, string found.',
    );
});

test('collapse', () => {
    // Normal case: a two-dimensional array with different elements
    let data = [['foo', 'bar'], ['baz']];
    expect(Arr.collapse(data)).toEqual(['foo', 'bar', 'baz']);

    // Case including numeric and string elements
    let array = [[1], [2], [3], ['foo', 'bar']];
    expect(Arr.collapse(array)).toEqual([1, 2, 3, 'foo', 'bar']);

    // Case with empty two-dimensional arrays
    let emptyArray = [[], [], []];
    expect(Arr.collapse(emptyArray)).toEqual([]);

    // Case with both empty arrays and arrays with elements
    let mixedArray = [[], [1, 2], [], ['foo', 'bar']];
    expect(Arr.collapse(mixedArray)).toEqual([1, 2, 'foo', 'bar']);
});

test('crossJoin', () => {
    // Single dimension
    expect(Arr.crossJoin([1], ['a', 'b', 'c'])).toEqual([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
    ]);

    // Square matrix
    expect(Arr.crossJoin([1, 2], ['a', 'b'])).toEqual([
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
    ]);

    // Rectangular matrix
    expect(Arr.crossJoin([1, 2], ['a', 'b', 'c'])).toEqual([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
        [2, 'a'],
        [2, 'b'],
        [2, 'c'],
    ]);

    // 3D matrix
    expect(Arr.crossJoin([1, 2], ['a', 'b'], ['I', 'II', 'III'])).toEqual([
        [1, 'a', 'I'],
        [1, 'a', 'II'],
        [1, 'a', 'III'],
        [1, 'b', 'I'],
        [1, 'b', 'II'],
        [1, 'b', 'III'],
        [2, 'a', 'I'],
        [2, 'a', 'II'],
        [2, 'a', 'III'],
        [2, 'b', 'I'],
        [2, 'b', 'II'],
        [2, 'b', 'III'],
    ]);

    // With 1 empty dimension
    expect(Arr.crossJoin([], ['a', 'b'], ['I', 'II', 'III'])).toEqual([]);
    expect(Arr.crossJoin([1, 2], [], ['I', 'II', 'III'])).toEqual([]);
    expect(Arr.crossJoin([1, 2], ['a', 'b'], [])).toEqual([]);

    // With empty arrays
    expect(Arr.crossJoin([], [], [])).toEqual([]);
    expect(Arr.crossJoin([], [])).toEqual([]);
    expect(Arr.crossJoin([])).toEqual([]);

    // Not really a proper usage, still, test for preserving BC
    expect(Arr.crossJoin()).toEqual([[]]);
});

test('divide', () => {
    // Test dividing an empty array
    let [keys, values]: any = Arr.divide([]);
    expect(keys).toEqual([]);
    expect(values).toEqual([]);

    // Test dividing an array with a single key-value pair
    [keys, values] = Arr.divide({ name: 'Desk' });
    expect(keys).toEqual(['name']);
    expect(values).toEqual(['Desk']);

    // Test dividing an array with multiple key-value pairs
    [keys, values] = Arr.divide({ name: 'Desk', price: 100, available: true });
    expect(keys).toEqual(['name', 'price', 'available']);
    expect(values).toEqual(['Desk', 100, true]);

    // Test dividing an array with numeric keys
    [keys, values] = Arr.divide(['first', 'second']);
    expect(keys).toEqual([0, 1]);
    expect(values).toEqual(['first', 'second']);

    // Test dividing an array with null key
    [keys, values] = Arr.divide({ null: 'Null', 1: 'one' });
    expect(keys).toEqual(['1', 'null']);
    expect(values).toEqual(['one', 'Null']);

    // Test dividing an array where the keys are arrays
    [keys, values] = Arr.divide([{ one: 1, 2: 'second' }, 'one']);
    expect(keys).toEqual([0, 1]);
    expect(values).toEqual([{ one: 1, 2: 'second' }, 'one']);

    // Test dividing an array where the values are arrays
    [keys, values] = Arr.divide({ null: { one: 1, 2: 'second' }, 1: 'one' });
    expect(keys).toEqual(['1', 'null']);
    expect(values).toEqual(['one', { one: 1, 2: 'second' }]);
});

test('dot', () => {
    let array = Arr.dot({ foo: { bar: 'baz' } });
    expect(array).toEqual({ 'foo.bar': 'baz' });

    array = Arr.dot({ 10: 100 });
    expect(array).toEqual({ 10: 100 });

    array = Arr.dot({ foo: { 10: 100 } });
    expect(array).toEqual({ 'foo.10': 100 });

    array = Arr.dot({ foo: {} });
    expect(array).toEqual({ foo: {} });

    array = Arr.dot({ foo: { bar: {} } });
    expect(array).toEqual({ 'foo.bar': {} });

    array = Arr.dot({ name: 'taylor', languages: { php: true } });
    expect(array).toEqual({ name: 'taylor', 'languages.php': true });

    array = Arr.dot({ user: { name: 'Taylor', age: 25, languages: ['PHP', 'C#'] } });
    expect(array).toEqual({
        'user.name': 'Taylor',
        'user.age': 25,
        'user.languages.0': 'PHP',
        'user.languages.1': 'C#',
    });

    array = Arr.dot({ 0: 'foo', 1: { foo: { bar: 'baz', baz: { a: 'b' } } } });
    expect(array).toEqual({ 0: 'foo', '1.foo.bar': 'baz', '1.foo.baz.a': 'b' });

    array = Arr.dot({ foo: 'bar', empty_array: [], user: { name: 'Taylor' }, key: 'value' });
    expect(array).toEqual({ foo: 'bar', empty_array: [], 'user.name': 'Taylor', key: 'value' });
});

test('every', () => {
    expect(Arr.every([1, 2], (value) => typeof value === 'string')).toEqual(false);
    expect(Arr.every(['foo', 2], (value) => typeof value === 'string')).toEqual(false);
    expect(Arr.every(['foo', 'bar'], (value) => typeof value === 'string')).toEqual(true);
});

test('except', () => {
    let array: any = { name: 'taylor', age: 26 };
    expect(Arr.except(array, ['name'])).toEqual({ age: 26 });
    expect(Arr.except(array, 'name')).toEqual({ age: 26 });

    array = { name: 'taylor', framework: { language: 'PHP', name: 'Laravel' } };
    expect(Arr.except(array, 'framework')).toEqual({ name: 'taylor' });
    expect(Arr.except(array, 'framework.language')).toEqual({ name: 'taylor', framework: { name: 'Laravel' } });
    expect(Arr.except(array, ['name', 'framework.name'])).toEqual({ framework: { language: 'PHP' } });

    array = { 1: 'hAz', 2: { 5: 'foo', 12: 'baz' } };
    expect(Arr.except(array, 2)).toEqual({ 1: 'hAz' });
    expect(Arr.except(array, '2.5')).toEqual({ 1: 'hAz', 2: { 12: 'baz' } });
});

test('exists', () => {
    expect(Arr.exists([1], 0)).toEqual(true);
    expect(Arr.exists([null], 0)).toEqual(true);
    expect(Arr.exists({ a: 1 }, 'a')).toEqual(true);
    expect(Arr.exists({ a: null }, 'a')).toEqual(true);
    expect(Arr.exists([1], 1)).toEqual(false);
    expect(Arr.exists([null], 1)).toEqual(false);
    expect(Arr.exists({ a: 1 }, 0)).toEqual(false);
});

test('first', () => {
    const array = [100, 200, 300];

    // Callback is undefined and array is empty
    expect(Arr.first([], undefined)).toEqual(undefined);
    expect(Arr.first([], undefined, 'foo')).toEqual('foo');
    expect(Arr.first([], undefined, () => 'bar')).toEqual('bar');

    // Callback is undefined and array is not empty
    expect(Arr.first(array)).toEqual(100);

    // Callback is not undefined and array is not empty
    const value = Arr.first(array, (value) => value >= 150);
    expect(value).toEqual(200);

    // Callback is not undefined, array is not empty but no satisfied item
    const value2 = Arr.first(array, (value) => value > 300);
    expect(value2).toEqual(undefined);

    const value3 = Arr.first(array, (value) => value > 300, 'bar');
    expect(value3).toEqual('bar');

    const value4 = Arr.first(
        array,
        (value) => value > 300,
        () => 'baz',
    );
    expect(value4).toEqual('baz');

    const value5 = Arr.first(array, (_, key) => Number(key) < 2);
    expect(value5).toEqual(100);
});

test('flatten', () => {
    // Flat arrays are unaffected
    let array: any = ['#foo', '#bar', '#baz'];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

    // Nested arrays are flattened with existing flat items
    array = [['#foo', '#bar'], '#baz'];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

    // Flattened array includes "null" items
    array = [['#foo', null], '#baz', null];
    expect(Arr.flatten(array)).toEqual(['#foo', null, '#baz', null]);

    // Sets of nested arrays are flattened
    array = [['#foo', '#bar'], ['#baz']];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

    // Deeply nested arrays are flattened
    array = [['#foo', ['#bar']], ['#baz']];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz']);

    // No depth flattens recursively
    array = [['#foo', ['#bar', ['#baz']]], '#zap'];
    expect(Arr.flatten(array)).toEqual(['#foo', '#bar', '#baz', '#zap']);

    // Specifying a depth only flattens to that depth
    array = [['#foo', ['#bar', ['#baz']]], '#zap'];
    expect(Arr.flatten(array, 1)).toEqual(['#foo', ['#bar', ['#baz']], '#zap']);

    array = [['#foo', ['#bar', ['#baz']]], '#zap'];
    expect(Arr.flatten(array, 2)).toEqual(['#foo', '#bar', ['#baz'], '#zap']);
});

test('float', () => {
    const testArray = { string: 'foo bar', float: 12.34 };

    // Test float values are returned as floats
    expect(Arr.float(testArray, 'float')).toEqual(12.34);

    // Test that default float values are returned for missing keys
    expect(Arr.float(testArray, 'missing_key', 56.78)).toEqual(56.78);

    // Test that an exception is raised if the value is not a float
    expect(() => Arr.float(testArray, 'string')).toThrow('Array value for key [string] must be a float, string found.');
});

test('forget', () => {
    let array: any = { products: { desk: { price: 100 } } };
    Arr.forget(array, []);
    expect(array).toEqual({ products: { desk: { price: 100 } } });

    array = { products: { desk: { price: 100 } } };
    Arr.forget(array, 'products.desk');
    expect(array).toEqual({ products: {} });

    array = { products: { desk: { price: 100 } } };
    Arr.forget(array, 'products.desk.price');
    expect(array).toEqual({ products: { desk: {} } });

    array = { products: { desk: { price: 100 } } };
    Arr.forget(array, 'products.final.price');
    expect(array).toEqual({ products: { desk: { price: 100 } } });

    array = { shop: { cart: { 150: 0 } } };
    Arr.forget(array, 'shop.final.cart');
    expect(array).toEqual({ shop: { cart: { 150: 0 } } });

    array = { products: { desk: { price: { original: 50, taxes: 60 } } } };
    Arr.forget(array, 'products.desk.price.taxes');
    expect(array).toEqual({ products: { desk: { price: { original: 50 } } } });

    array = { products: { desk: { price: { original: 50, taxes: 60 } } } };
    Arr.forget(array, 'products.desk.final.taxes');
    expect(array).toEqual({ products: { desk: { price: { original: 50, taxes: 60 } } } });

    array = { products: { desk: { price: 50 }, null: 'something' } };
    Arr.forget(array, ['products.amount.all', 'products.desk.price']);
    expect(array).toEqual({ products: { desk: {}, null: 'something' } });

    // Only works on first level keys
    array = { 'joe@example.com': 'Joe', 'jane@example.com': 'Jane' };
    Arr.forget(array, 'joe@example.com');
    expect(array).toEqual({ 'jane@example.com': 'Jane' });

    // Does not work for nested keys
    array = { emails: { 'joe@example.com': { name: 'Joe' }, 'jane@localhost': { name: 'Jane' } } };
    Arr.forget(array, ['emails.joe@example.com', 'emails.jane@localhost']);
    expect(array).toEqual({ emails: { 'joe@example.com': { name: 'Joe' } } });

    array = { name: 'hAz', 1: 'test', 2: 'bAz' };
    Arr.forget(array, 1);
    expect(array).toEqual({ name: 'hAz', 2: 'bAz' });

    array = { 2: { 1: 'products', 3: 'users' } };
    Arr.forget(array, 2.3);
    expect(array).toEqual({ 2: { 1: 'products' } });
});

test('from', () => {
    expect(Arr.from(['bar'])).toEqual(['bar']);
    expect(Arr.from({ foo: 'bar' })).toEqual({ foo: 'bar' });
    expect(Arr.from('foo')).toEqual(['f', 'o', 'o']);
    expect(Arr.from(123)).toEqual([]);
    expect(Arr.from(true)).toEqual([]);
    expect(() => Arr.from(undefined)).toThrow('Items cannot be represented by a scalar value.');
});

test('get', () => {
    let array: any = { 'products.desk': { price: 100 } };
    expect(Arr.get(array, 'products.desk')).toEqual({ price: 100 });

    array = { products: { desk: { price: 100 } } };
    expect(Arr.get(array, 'products.desk')).toEqual({ price: 100 });

    // Test null array values
    array = { foo: null, bar: { baz: null } };
    expect(Arr.get(array, 'foo', 'default')).toEqual(null);
    expect(Arr.get(array, 'bar.baz', 'default')).toEqual(null);

    // Test null key returns the whole array
    array = ['foo', 'bar'];
    expect(Arr.get(array, undefined)).toEqual(array);

    // Test array is empty and key is undefined
    expect(Arr.get([], undefined)).toEqual([]);
    expect(Arr.get([], undefined, 'default')).toEqual([]);

    // Test numeric keys
    array = { products: [{ name: 'desk' }, { name: 'chair' }] };
    expect(Arr.get(array, 'products.0.name')).toEqual('desk');
    expect(Arr.get(array, 'products.1.name')).toEqual('chair');

    // Test return default value for non-existing key.
    array = { names: { developer: 'taylor' } };
    expect(Arr.get(array, 'names.otherDeveloper', 'dayle')).toEqual('dayle');
    expect(Arr.get(array, 'names.otherDeveloper', () => 'dayle')).toEqual('dayle');

    // Test array has a null key
    expect(Arr.get({ '': 'bar' }, '')).toEqual('bar');
    expect(Arr.get({ '': { '': 'bar' } }, '.')).toEqual('bar');
});

test('has', () => {
    let array: any = { 'products.desk': { price: 100 } };
    expect(Arr.has(array, 'products.desk')).toEqual(true);

    array = { products: { desk: { price: 100 } } };
    expect(Arr.has(array, 'products.desk')).toEqual(true);
    expect(Arr.has(array, 'products.desk.price')).toEqual(true);
    expect(Arr.has(array, 'products.foo')).toEqual(false);
    expect(Arr.has(array, 'products.desk.foo')).toEqual(false);

    array = { foo: null, bar: { baz: null } };
    expect(Arr.has(array, 'foo')).toEqual(true);
    expect(Arr.has(array, 'bar.baz')).toEqual(true);

    array = { products: { desk: { price: 100 } } };
    expect(Arr.has(array, ['products.desk'])).toEqual(true);
    expect(Arr.has(array, ['products.desk', 'products.desk.price'])).toEqual(true);
    expect(Arr.has(array, ['products', 'products'])).toEqual(true);
    expect(Arr.has(array, ['foo'])).toEqual(false);
    expect(Arr.has(array, [])).toEqual(false);
    expect(Arr.has(array, ['products.desk', 'products.price'])).toEqual(false);

    array = { products: [{ name: 'desk' }] };
    expect(Arr.has(array, 'products.0.name')).toEqual(true);
    expect(Arr.has(array, 'products.0.price')).toEqual(false);

    expect(Arr.has({ '': 'some' }, '')).toEqual(true);
    expect(Arr.has({ '': 'some' }, [''])).toEqual(true);
    expect(Arr.has([''], '')).toEqual(false);
    expect(Arr.has([], '')).toEqual(false);
    expect(Arr.has([], [''])).toEqual(false);
});

test('hasAll', () => {
    let array: any = { name: 'Taylor', age: '', city: null };
    expect(Arr.hasAll(array, 'name')).toEqual(true);
    expect(Arr.hasAll(array, 'age')).toEqual(true);
    expect(Arr.hasAll(array, ['age', 'car'])).toEqual(false);
    expect(Arr.hasAll(array, 'city')).toEqual(true);
    expect(Arr.hasAll(array, ['city', 'some'])).toEqual(false);
    expect(Arr.hasAll(array, ['name', 'age', 'city'])).toEqual(true);
    expect(Arr.hasAll(array, ['name', 'age', 'city', 'country'])).toEqual(false);

    array = { user: { name: 'Taylor' } };
    expect(Arr.hasAll(array, 'user.name')).toEqual(true);
    expect(Arr.hasAll(array, 'user.age')).toEqual(false);

    array = { name: 'Taylor', age: '', city: null };
    expect(Arr.hasAll(array, 'foo')).toEqual(false);
    expect(Arr.hasAll(array, 'bar')).toEqual(false);
    expect(Arr.hasAll(array, 'baz')).toEqual(false);
    expect(Arr.hasAll(array, 'bah')).toEqual(false);
    expect(Arr.hasAll(array, ['foo', 'bar', 'baz', 'bar'])).toEqual(false);
});

test('hasAny', () => {
    let array: any = { name: 'Taylor', age: '', city: null };
    expect(Arr.hasAny(array, 'name')).toEqual(true);
    expect(Arr.hasAny(array, 'age')).toEqual(true);
    expect(Arr.hasAny(array, 'city')).toEqual(true);
    expect(Arr.hasAny(array, 'foo')).toEqual(false);
    expect(Arr.hasAny(array, ['name', 'email'])).toEqual(true);

    array = { name: 'Taylor', email: 'foo' };
    expect(Arr.hasAny(array, ['surname', 'password'])).toEqual(false);

    array = { foo: { bar: null, baz: '' } };
    expect(Arr.hasAny(array, 'foo.bar')).toEqual(true);
    expect(Arr.hasAny(array, 'foo.baz')).toEqual(true);
    expect(Arr.hasAny(array, 'foo.bax')).toEqual(false);
    expect(Arr.hasAny(array, ['foo.bax', 'foo.baz'])).toEqual(true);
});

test('integer', () => {
    const testArray = { string: 'foo bar', integer: 1234 };

    // Test integer values are returned as integers
    expect(Arr.integer(testArray, 'integer')).toEqual(1234);

    // Test that default integer values are returned for missing keys
    expect(Arr.integer(testArray, 'missing_key', 999)).toEqual(999);

    // Test that an exception is raised if the value is not an integer
    expect(() => Arr.integer(testArray, 'string')).toThrow(
        'Array value for key [string] must be an integer, string found.',
    );
});

test('isAssoc', () => {
    expect(Arr.isAssoc({ a: 'a', 0: 'b' })).toEqual(true);
    expect(Arr.isAssoc({ 1: 'a', 0: 'b' })).toEqual(false);
    expect(Arr.isAssoc({ 1: 'a', 2: 'b' })).toEqual(true);
    expect(Arr.isAssoc({ 0: 'a', 1: 'b' })).toEqual(false);
    expect(Arr.isAssoc(['a', 'b'])).toEqual(false);

    expect(Arr.isAssoc([])).toEqual(false);
    expect(Arr.isAssoc([1, 2, 3])).toEqual(false);
    expect(Arr.isAssoc(['foo', 2, 3])).toEqual(false);
    expect(Arr.isAssoc({ 0: 'foo', 1: 'bar' })).toEqual(false);

    expect(Arr.isAssoc({ 1: 'foo', 0: 'bar' })).toEqual(false);
    expect(Arr.isAssoc({ 0: 'foo', bar: 'baz' })).toEqual(true);
    expect(Arr.isAssoc({ 0: 'foo', 2: 'bar' })).toEqual(true);
    expect(Arr.isAssoc({ foo: 'bar', baz: 'qux' })).toEqual(true);
});

test('isList', () => {
    expect(Arr.isList([])).toEqual(true);
    expect(Arr.isList([1, 2, 3])).toEqual(true);
    expect(Arr.isList(['foo', 2, 3])).toEqual(true);
    expect(Arr.isList(['foo', 'bar'])).toEqual(true);
    expect(Arr.isList({ 0: 'foo', 1: 'bar' })).toEqual(true);

    expect(Arr.isList({ '-1': 1 })).toEqual(false);
    expect(Arr.isList({ '-1': 1, 0: 2 })).toEqual(false);
    expect(Arr.isList({ 0: 'foo', 2: 'bar' })).toEqual(false);
    expect(Arr.isList({ foo: 'bar', baz: 'qux' })).toEqual(false);
    expect(Arr.isList({ 1: 'foo', 0: 'bar' })).toEqual(true);
});

test('join', () => {
    expect(Arr.join(['a', 'b', 'c'], ', ')).toEqual('a, b, c');
    expect(Arr.join(['a', 'b', 'c'], ', ', ' and ')).toEqual('a, b and c');
    expect(Arr.join(['a', 'b'], ', ', ' and ')).toEqual('a and b');
    expect(Arr.join(['a'], ', ', ' and ')).toEqual('a');
    expect(Arr.join([], ', ', ' and ')).toEqual('');
});

test('last', () => {
    const array = [100, 200, 300];

    // Callback is undefined and array is empty
    expect(Arr.last([], undefined)).toEqual(undefined);
    expect(Arr.last([], undefined, 'foo')).toEqual('foo');
    expect(Arr.last([], undefined, () => 'bar')).toEqual('bar');

    // // Callback is undefined and array is not empty
    expect(Arr.last(array)).toEqual(300);

    // // Callback is not undefined and array is not empty
    const value = Arr.last(array, (value) => value < 250);
    expect(value).toEqual(200);

    // Callback is not undefined, array is not empty but no satisfied item
    const value2 = Arr.last(array, (value) => value > 300);
    expect(value2).toEqual(undefined);

    const value3 = Arr.last(array, (value) => value > 300, 'bar');
    expect(value3).toEqual('bar');

    const value4 = Arr.last(
        array,
        (value) => value > 300,
        () => 'baz',
    );
    expect(value4).toEqual('baz');

    const value5 = Arr.last(array, (_, key) => Number(key) < 2);
    expect(value5).toEqual(300);
});

test('map', () => {
    let data: any = { first: 'taylor', last: 'otwell' };
    let mapped = Arr.map(data, (value: string, key) => key + '-' + value.split('').reverse().join(''));
    expect(mapped).toEqual({ first: 'first-rolyat', last: 'last-llewto' });
    expect(data).toEqual({ first: 'taylor', last: 'otwell' });

    mapped = Arr.map([], (value, key) => key + '-' + value);
    expect(mapped).toEqual([]);

    data = { first: 'taylor', last: undefined };
    mapped = Arr.map(data, (value, key) => key + '-' + (value ?? ''));
    expect(mapped).toEqual({ first: 'first-taylor', last: 'last-' });
});

test('mapSpread', () => {
    const c = [
        [1, 'a'],
        [2, 'b'],
    ];

    let result = Arr.mapSpread(c, (number, character) => `${number}-${character}`);
    expect(result).toEqual(['1-a', '2-b']);

    result = Arr.mapSpread(c, (number, character, key) => `${number}-${character}-${key}`);
    expect(result).toEqual(['1-a-0', '2-b-1']);
});

test('mapWithKeys', () => {
    const data = [
        { name: 'Blastoise', type: 'Water', idx: 9 },
        { name: 'Charmander', type: 'Fire', idx: 4 },
        { name: 'Dragonair', type: 'Dragon', idx: 148 },
    ];
    expect(Arr.mapWithKeys(data, (pokemon) => ({ [pokemon['name']]: pokemon['type'] }))).toEqual({
        Blastoise: 'Water',
        Charmander: 'Fire',
        Dragonair: 'Dragon',
    });
});

test('only', () => {
    const array: any = { name: 'Desk', price: 100, orders: 10 };
    expect(Arr.only(array, ['name', 'price'])).toEqual({ name: 'Desk', price: 100 });
    expect(Arr.only(array, ['nonExistingKey'])).toEqual({});

    // Test with array having numeric keys
    expect(Arr.only(['foo', 'bar', 'baz'], 0)).toEqual(['foo']);
    expect(Arr.only(['foo', 'bar', 'baz'], [1, 2])).toEqual(['bar', 'baz']);
    expect(Arr.only(['foo', 'bar', 'baz'], [3])).toEqual([]);

    // Test with array having numeric key and string key
    expect(Arr.only({ 0: 'foo', bar: 'baz' }, 0)).toEqual({ 0: 'foo' });
    expect(Arr.only({ 0: 'foo', bar: 'baz' }, 'bar')).toEqual({ bar: 'baz' });
});

test('partition', () => {
    const array = ['John', 'Jane', 'Greg'];
    expect(Arr.partition(array, (value: string) => value.includes('J'))).toEqual([['John', 'Jane'], ['Greg']]);
});

test('pluck', () => {
    const data = { 'post-1': { comments: { tags: ['#foo', '#bar'] } }, 'post-2': { comments: { tags: ['#baz'] } } };
    expect(Arr.pluck(data, 'comments')).toEqual([{ tags: ['#foo', '#bar'] }, { tags: ['#baz'] }]);
    expect(Arr.pluck(data, 'comments.tags')).toEqual([['#foo', '#bar'], ['#baz']]);
    expect(Arr.pluck(data, 'foo')).toEqual([undefined, undefined]);
    expect(Arr.pluck(data, 'foo.bar')).toEqual([undefined, undefined]);

    let array: any = [{ developer: { name: 'Taylor' } }, { developer: { name: 'Abigail' } }];
    expect(Arr.pluck(array, 'developer.name')).toEqual(['Taylor', 'Abigail']);

    array = [{ developer: { name: 'Taylor' } }, { developer: { name: 'Abigail' } }];
    expect(Arr.pluck(array, ['developer', 'name'])).toEqual(['Taylor', 'Abigail']);

    array = [
        { name: 'Taylor', role: 'developer' },
        { name: 'Abigail', role: 'developer' },
    ];

    expect(Arr.pluck(array, 'role', 'name')).toEqual({
        Taylor: 'developer',
        Abigail: 'developer',
    });
    expect(Arr.pluck(array, undefined, 'name')).toEqual({
        Taylor: { name: 'Taylor', role: 'developer' },
        Abigail: { name: 'Abigail', role: 'developer' },
    });

    array = [
        { start: new Date('2017-07-25 00:00:00').toDateString(), end: new Date('2017-07-30 00:00:00').toDateString() },
    ];
    expect(Arr.pluck(array, 'end', 'start')).toEqual({ 'Tue Jul 25 2017': 'Sun Jul 30 2017' });

    array = [
        { name: 'taylor', email: 'foo' },
        { name: 'dayle', email: 'bar' },
    ];
    expect(Arr.pluck(array, 'name')).toEqual(['taylor', 'dayle']);
    expect(Arr.pluck(array, 'email', 'name')).toEqual({ taylor: 'foo', dayle: 'bar' });

    array = [{ user: ['taylor', 'otwell'] }, { user: ['dayle', 'rees'] }];
    expect(Arr.pluck(array, 'user.0')).toEqual(['taylor', 'dayle']);
    expect(Arr.pluck(array, ['user', 0])).toEqual(['taylor', 'dayle']);
    expect(Arr.pluck(array, 'user.1', 'user.0')).toEqual({ taylor: 'otwell', dayle: 'rees' });
    expect(Arr.pluck(array, ['user', 1], ['user', 0])).toEqual({ taylor: 'otwell', dayle: 'rees' });

    array = [
        { account: 'a', users: [{ first: 'taylor', last: 'otwell', email: 'taylorotwell@gmail.com' }] },
        {
            account: 'b',
            users: [
                { first: 'abigail', last: 'otwell' },
                { first: 'dayle', last: 'rees' },
            ],
        },
    ];
    expect(Arr.pluck(array, 'users.*.first')).toEqual([['taylor'], ['abigail', 'dayle']]);
    expect(Arr.pluck(array, 'users.*.first', 'account')).toEqual({ a: ['taylor'], b: ['abigail', 'dayle'] });
    expect(Arr.pluck(array, 'users.*.email')).toEqual([['taylorotwell@gmail.com'], [undefined, undefined]]);
});

test('prepend', () => {
    let array: any = Arr.prepend(['one', 'two', 'three', 'four'], 'zero');
    expect(array).toEqual(['zero', 'one', 'two', 'three', 'four']);

    array = Arr.prepend({ one: 1, two: 2 }, 0, 'zero');
    expect(array).toEqual({ zero: 0, one: 1, two: 2 });

    array = Arr.prepend({ one: 1, two: 2 }, 0, undefined);
    expect(array).toEqual({ 0: 0, one: 1, two: 2 });

    array = Arr.prepend(['one', 'two'], null, undefined);
    expect(array).toEqual([null, 'one', 'two']);

    array = Arr.prepend([], 'zero');
    expect(array).toEqual(['zero']);

    array = Arr.prepend([''], 'zero');
    expect(array).toEqual(['zero', '']);

    array = Arr.prepend(['one', 'two'], ['zero']);
    expect(array).toEqual([['zero'], 'one', 'two']);
});

test('prependKeysWith', () => {
    const array = { id: '123', data: '456', list: [1, 2, 3], meta: { key: 1 } };
    expect(Arr.prependKeysWith(array, 'test.')).toEqual({
        'test.id': '123',
        'test.data': '456',
        'test.list': [1, 2, 3],
        'test.meta': { key: 1 },
    });
});

test('pull', () => {
    let array: any = { name: 'Desk', price: 100 };
    expect(Arr.pull(array, 'name')).toEqual('Desk');
    expect(array).toEqual({ price: 100 });

    // Only works on first level keys
    array = { 'joe@example.com': 'Joe', 'jane@localhost': 'Jane' };
    expect(Arr.pull(array, 'joe@example.com')).toEqual('Joe');
    expect(array).toEqual({ 'jane@localhost': 'Jane' });

    // Does not work for nested keys
    array = { emails: { 'joe@example.com': 'Joe', 'jane@localhost': 'Jane' } };
    expect(Arr.pull(array, 'emails.joe@example.com')).toEqual(undefined);
    expect(array).toEqual({ emails: { 'joe@example.com': 'Joe', 'jane@localhost': 'Jane' } });

    // Works with int keys
    array = ['First', 'Second'];
    expect(Arr.pull(array, 0)).toEqual('First');
    expect(array).toEqual([undefined, 'Second']);
});

test('push', () => {
    let array = {};

    Arr.push(array, 'office.furniture', 'Desk');
    expect(array['office']['furniture']).toEqual(['Desk']);

    Arr.push(array, 'office.furniture', 'Chair', 'Lamp');
    expect(array['office']['furniture']).toEqual(['Desk', 'Chair', 'Lamp']);

    array = [];

    Arr.push(array, undefined, 'Chris', 'Nuno');
    expect(array).toEqual(['Chris', 'Nuno']);

    Arr.push(array, undefined, 'Taylor');
    expect(array).toEqual(['Chris', 'Nuno', 'Taylor']);

    array = { foo: { bar: false } };
    expect(() => Arr.push(array, 'foo.bar', 'baz')).toThrow(
        'Array value for key [foo.bar] must be an array, boolean found.',
    );
});

test('query', () => {
    expect(Arr.query([])).toEqual('');
    expect(Arr.query({ foo: 'bar' })).toEqual('foo=bar');
    expect(Arr.query({ foo: 'bar', bar: 'baz' })).toEqual('foo=bar&bar=baz');
    expect(Arr.query({ foo: 'bar', bar: true })).toEqual('foo=bar&bar=1');
    expect(Arr.query({ foo: 'bar', bar: null })).toEqual('foo=bar');
    expect(Arr.query({ foo: 'bar', bar: '' })).toEqual('foo=bar&bar=');
});

test('reject', () => {
    // Test rejection behavior (removing even numbers)
    const array = [1, 2, 3, 4, 5, 6];
    expect(Arr.reject(array, (value) => value % 2 === 0)).toEqual([1, 3, 5]);

    // Test key preservation with associative array
    const assocArray = { a: 1, b: 2, c: 3, d: 4 };
    expect(Arr.reject(assocArray, (value) => value > 2)).toEqual({ a: 1, b: 2 });
});

test('select', () => {
    const array = [
        { name: 'Taylor', role: 'Developer', age: 1 },
        { name: 'Abigail', role: 'Infrastructure', age: 2 },
    ];
    expect(Arr.select(array, ['name', 'age'])).toEqual([
        { name: 'Taylor', age: 1 },
        { name: 'Abigail', age: 2 },
    ]);
    expect(Arr.select(array, 'name')).toEqual([{ name: 'Taylor' }, { name: 'Abigail' }]);
    expect(Arr.select(array, 'nonExistingKey')).toEqual([{}, {}]);
});

test('set', () => {
    let array: any = { products: { desk: { price: 100 } } };
    Arr.set(array, 'products.desk.price', 200);
    expect(array).toEqual({ products: { desk: { price: 200 } } });

    // No key is given
    array = { products: { desk: { price: 100 } } };
    Arr.set(array, undefined, { price: 300 });
    expect(array).toEqual({ 0: { price: 300 } });

    // The key doesn't exist at the depth
    array = { products: 'desk' };
    Arr.set(array, 'products.desk.price', 200);
    expect(array).toEqual({ products: { desk: { price: 200 } } });

    // No corresponding key exists
    array = { products: { desk: { price: 100 } } };
    Arr.set(array, 'table', 500);
    expect(array).toEqual({ products: { desk: { price: 100 } }, table: 500 });

    array = { products: { desk: { price: 100 } } };
    Arr.set(array, 'table.price', 350);
    expect(array).toEqual({ products: { desk: { price: 100 } }, table: { price: 350 } });

    // Override
    array = { products: 'table' };
    Arr.set(array, 'products.desk.price', 300);
    expect(array).toEqual({ products: { desk: { price: 300 } } });

    array = { 1: 'test' };
    expect(Arr.set(array, 1, 'hAz')).toEqual({ 1: 'hAz' });
});

test('some', () => {
    expect(Arr.some([1, 2], (value) => typeof value === 'string')).toEqual(false);
    expect(Arr.some(['foo', 2], (value) => typeof value === 'string')).toEqual(true);
    expect(Arr.some(['foo', 'bar'], (value) => typeof value === 'string')).toEqual(true);
});

test('sole', () => {
    expect(Arr.sole(['foo'])).toEqual('foo');

    const array = [{ name: 'foo' }, { name: 'bar' }];
    expect(Arr.sole(array, (value) => value['name'] === 'foo')).toEqual({ name: 'foo' });

    expect(() => Arr.sole(['foo'], (value) => value === 'baz')).toThrow('Item not found');
    expect(() => Arr.sole(['baz', 'foo', 'baz'], (value) => value === 'baz')).toThrow('Array has more than one item');
});

test('sortRecursive', () => {
    const array = {
        users: [
            {
                // should sort associative arrays by keys
                name: 'joe',
                mail: 'joe@example.com',
                // should sort deeply nested arrays
                numbers: [2, 1, 0],
            },
            { name: 'jane', age: 25 },
        ],
        repositories: [
            // should use weird `sort()` behavior on arrays of arrays
            { id: 1 },
            { id: 0 },
        ],
        // should sort non-associative arrays by value
        20: [2, 1, 0],
        30: { 2: 'a', 1: 'b', 0: 'c' },
    };

    const expected = {
        20: [0, 1, 2],
        30: { 0: 'a', 1: 'b', 2: 'c' },
        repositories: [{ id: 1 }, { id: 0 }],
        users: [
            { mail: 'joe@example.com', name: 'joe', numbers: [0, 1, 2] },
            { age: 25, name: 'jane' },
        ],
    };

    expect(Arr.sortRecursive(array)).toEqual(expected);
});

test('sortRecursiveDesc', () => {
    const array = {
        empty: [],
        nested: { level1: { level2: { level3: [2, 3, 1] }, values: [4, 5, 6] } },
        mixed: { a: 1, 2: 'b', c: 3, 1: 'd' },
        numbered_index: { 1: 'e', 3: 'c', 4: 'b', 5: 'a', 2: 'd' },
    };

    const expected = {
        empty: [],
        mixed: { c: 3, a: 1, 2: 'b', 1: 'd' },
        nested: { level1: { values: [6, 5, 4], level2: { level3: [3, 2, 1] } } },
        numbered_index: { 5: 'a', 4: 'b', 3: 'c', 2: 'd', 1: 'e' },
    };

    expect(Arr.sortRecursiveDesc(array)).toEqual(expected);
});

test('string', () => {
    const testArray = { string: 'foo bar', integer: 1234 };

    // Test string values are returned as strings
    expect(Arr.string(testArray, 'string')).toEqual('foo bar');

    // Test that default string values are returned for missing keys
    expect(Arr.string(testArray, 'missing_key', 'default')).toEqual('default');

    // Test that an exception is raised if the value is not a string
    expect(() => Arr.string(testArray, 'integer')).toThrow(
        'Array value for key [integer] must be a string, number found.',
    );
});

test('toCssClasses', () => {
    let classes = Arr.toCssClasses(['font-bold', 'mt-4']);
    expect(classes).toEqual('font-bold mt-4');

    classes = Arr.toCssClasses({ 0: 'font-bold', 1: 'mt-4', 'ml-2': true, 'mr-2': false });
    expect(classes).toEqual('font-bold mt-4 ml-2');
});

test('toCssStyles', () => {
    let styles = Arr.toCssStyles(['font-weight: bold', 'margin-top: 4px;']);
    expect(styles).toEqual('font-weight: bold; margin-top: 4px;');

    styles = Arr.toCssStyles({
        0: 'font-weight: bold;',
        1: 'margin-top: 4px',
        'margin-left: 2px;': true,
        'margin-right: 2px': false,
    });
    expect(styles).toEqual('font-weight: bold; margin-top: 4px; margin-left: 2px;');
});

test('undot', () => {
    let array = Arr.undot({
        'user.name': 'Taylor',
        'user.age': 25,
        'user.languages.0': 'PHP',
        'user.languages.1': 'C#',
    });
    expect(array).toEqual({ user: { name: 'Taylor', age: 25, languages: { 0: 'PHP', 1: 'C#' } } });

    array = Arr.undot({ 'pagination.previous': '<<', 'pagination.next': '>>' });
    expect(array).toEqual({ pagination: { previous: '<<', next: '>>' } });

    array = Arr.undot({ 0: 'foo', 'foo.bar': 'baz', 'foo.baz': { a: 'b' } });
    expect(array).toEqual({ 0: 'foo', foo: { bar: 'baz', baz: { a: 'b' } } });
});

test('where', () => {
    let array: any = [100, '200', 300, '400', 500];
    expect(Arr.where(array, (value) => typeof value === 'string')).toEqual(['200', '400']);

    array = { 10: 1, foo: 3, 20: 2 };
    expect(Arr.where(array, (_, key) => !isNaN(Number(key)))).toEqual({ 10: 1, 20: 2 });
});

test('whereNotUndefined', () => {
    let array = Arr.whereNotUndefined([undefined, 0, false, '', undefined, []]);
    expect(array).toEqual([0, false, '', []]);

    array = Arr.whereNotUndefined([1, 2, 3]);
    expect(array).toEqual([1, 2, 3]);

    array = Arr.whereNotUndefined([undefined, undefined, undefined]);
    expect(array).toEqual([]);

    array = Arr.whereNotUndefined(['a', undefined, 'b', undefined, 'c']);
    expect(array).toEqual(['a', 'b', 'c']);

    const obj = {};
    const fun = () => undefined;
    array = Arr.whereNotUndefined([undefined, 1, 'string', 0.0, false, [], obj, fun]);
    expect(array).toEqual([1, 'string', 0.0, false, [], obj, fun]);
});

test('wrap', () => {
    const array = ['a'];
    const object = { value: 'a' };

    expect(Arr.wrap('a')).toEqual(['a']);
    expect(Arr.wrap(array)).toEqual(array);
    expect(Arr.wrap(object)).toEqual(object);
    expect(Arr.wrap(null)).toEqual([]);
    expect(Arr.wrap([null])).toEqual([null]);
    expect(Arr.wrap([null, null])).toEqual([null, null]);
    expect(Arr.wrap('')).toEqual(['']);
    expect(Arr.wrap([''])).toEqual(['']);
    expect(Arr.wrap(false)).toEqual([false]);
    expect(Arr.wrap([false])).toEqual([false]);
    expect(Arr.wrap(0)).toEqual([0]);
});

test('take', () => {
    const array = [1, 2, 3, 4, 5, 6];

    // Test with a positive limit, should return the first 'limit' elements.
    expect(Arr.take(array, 3)).toEqual([1, 2, 3]);

    // Test with a negative limit, should return the last 'abs(limit)' elements.
    expect(Arr.take(array, -3)).toEqual([4, 5, 6]);

    // Test with zero limit, should return an empty array.
    expect(Arr.take(array, 0)).toEqual([]);

    // Test with a limit greater than the array size, should return the entire array.
    expect(Arr.take(array, 10)).toEqual([1, 2, 3, 4, 5, 6]);

    // Test with a negative limit greater than the array size, should return the entire array.
    expect(Arr.take(array, -10)).toEqual([1, 2, 3, 4, 5, 6]);
});
