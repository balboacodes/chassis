// prettier-ignore
import {
    array_all, array_any, array_chunk, array_combine, array_diff, array_diff_assoc, array_diff_key, array_diff_uassoc, array_filter, array_find_key, array_flip, array_intersect, array_intersect_assoc, array_intersect_key, array_intersect_uassoc, array_keys, array_map, array_merge, array_merge_recursive, array_pad, array_pop, array_push, array_replace, array_replace_recursive, array_reverse, array_search, array_shift, array_slice, array_splice, array_uintersect, array_unique, arsort, asort, count, empty, in_array, intval, isset, krsort, ksort, range, SORT_FLAG_CASE, SORT_LOCALE_STRING, SORT_NATURAL, SORT_NUMERIC, SORT_REGULAR, SORT_STRING, strcasecmp, strcmp, strcoll, strnatcasecmp, strnatcmp, uasort, uksort, unset,
} from '@balboacodes/php-utils';
import { Arr } from './Arr';
import { use } from './decorators/use';
import { data_get, data_has, value } from './helpers';
import { Conditionable } from './traits/Conditionable';

type Enumerable<TKey extends number | string, TValue> = TValue[] | Record<TKey, TValue> | Collection<TKey, TValue>;

export interface Collection<TKey extends number | string, TValue> extends Conditionable {}

@use(Conditionable)
export class Collection<TKey extends number | string, TValue> {
    /**
     * The items contained in the collection.
     */
    protected items: TValue[] | Record<TKey, TValue> = [];

    /**
     * Create a new collection.
     */
    public constructor(items: Enumerable<TKey, TValue> = []) {
        this.items = this.getArrayableItems(items) as TValue[] | Record<TKey, TValue>;
    }

    /**
     * Get the item after the given item.
     */
    public after(value: TValue | ((value: TValue, key: TKey) => boolean), strict = false): TValue | null {
        const key = this.search(value, strict);

        if (key === false) {
            return null;
        }

        const keys = this.keys();
        const position = keys.search(key) as number;

        if (position === keys.count() - 1) {
            return null;
        }

        return this.get(keys.get(position + 1));
    }

    /**
     * Get all of the items in the collection.
     */
    public all(): TValue[] | Record<TKey, TValue> {
        return this.items;
    }

    /**
     * Get the average value of a given key.
     */
    public avg(callback?: ((value: TValue) => number) | string): number | null {
        callback = this.valueRetriever(callback) as any;

        const reduced = this.reduce(
            // @ts-ignore
            (reduce: [number, number], value: TValue) => {
                let resolved: number | undefined = (callback as Function)(value);

                if (resolved !== undefined && resolved !== null) {
                    resolved = Number(resolved);
                    reduce[0] += resolved;
                    reduce[1]++;
                }

                return reduce;
            },
            [0, 0],
        );

        return reduced[1] ? reduced[0] / reduced[1] : null;
    }

    /**
     * Get the item before the given item.
     */
    public before(value: TValue | ((value: TValue, key: TKey) => boolean), strict: boolean = false): TValue | null {
        const key = this.search(value, strict);

        if (key === false) {
            return null;
        }

        const keys = this.keys();
        const position = keys.search(key) as number;

        if (position === 0) {
            return null;
        }

        return this.get(keys.get(position - 1));
    }

    /**
     * Chunk the collection into chunks of the given size.
     */
    public chunk(
        size: number,
        preserveKeys: boolean = true,
    ): Collection<number, Collection<TKey, TValue>> | Collection<number, Collection<number, TValue>> {
        if (size <= 0) {
            return new Collection() as any;
        }

        const chunks: (Collection<TKey, TValue> | Collection<number, TValue>)[] = [];
        preserveKeys = Array.isArray(this.items) ? false : true;

        for (const chunk of array_chunk(this.items, size, preserveKeys)) {
            chunks.push(new Collection(chunk) as any);
        }

        return new Collection(chunks) as any;
    }

    /**
     * Collapse the collection of items into a single array.
     */
    public collapse(): Collection<TKey, any> {
        return new Collection(Arr.collapse(this.items)) as any;
    }

    /**
     * Collapse the collection of items into a single array while preserving its keys.
     */
    public collapseWithKeys(): Collection<TKey, any> {
        if (!this.items) {
            return new Collection();
        }

        const results: any[] = [];

        for (let values of Object.values(this.items)) {
            if (values instanceof Collection) {
                values = values.all() as any;
            } else if (!Arr.accessible(values)) {
                continue;
            }

            results.push(values);
        }

        if (Object.values(results).length === 0) {
            return new Collection();
        }

        return new Collection(array_replace(results[0], ...results.slice(1))) as any;
    }

    /**
     * Collect the values into a collection.
     */
    public collect(): Collection<TKey, TValue> {
        return new Collection(this.all());
    }

    /**
     * Create a collection by using this collection for keys and another for its values.
     */
    public combine<TCombineValue>(
        values: Enumerable<number | string, TCombineValue>,
    ): Collection<TValue extends number ? number : string, TCombineValue> {
        return new Collection(array_combine(this.all() as any, this.getArrayableItems(values))) as any;
    }

    /**
     * Push all of the given items onto the collection.
     */
    public concat<TConcatKey extends number | string, TConcatValue>(
        source: TConcatValue[] | Record<TConcatKey, TConcatValue> | Collection<TConcatKey, TConcatValue>,
    ): Collection<TKey | TConcatKey, TValue | TConcatValue> {
        const result = new Collection(this);

        for (const item of Object.values(this.getArrayableItems(source))) {
            result.push(item);
        }

        return result as any;
    }

    /**
     * Count the number of items in the collection.
     */
    public count(): number {
        return count(this.items);
    }

    /**
     * Determine if an item exists in the collection.
     */
    public contains(
        key: ((value: TValue, key: TKey) => boolean) | TValue | string,
        operator?: any,
        value?: any,
    ): boolean {
        if (arguments.length === 1 || operator === undefined) {
            if (this.useAsCallable(key)) {
                return array_any(this.items, key as any);
            }

            return in_array(key, this.items);
        }

        return this.contains(this.operatorForWhere(key as any, operator, value) as any);
    }

    /**
     * Determine if the collection contains exactly one item. If a callback is provided, determine if exactly one item
     * matches the condition.
     */
    public containsOneItem(callback?: (value: TValue, key: TKey) => boolean): boolean {
        if (callback) {
            return this.filter(callback).count() === 1;
        }

        return this.count() === 1;
    }

    /**
     * Determine if an item exists, using strict comparison.
     */
    public containsStrict(key: ((value: TValue) => boolean) | TValue | number | string, value?: TValue): boolean {
        if (value !== undefined) {
            return this.contains((item: TValue) => data_get(item as any, key as any) === value);
        }

        if (this.useAsCallable(key)) {
            return this.first(key as (value: TValue) => boolean) !== undefined;
        }

        return in_array(key, this.items, true);
    }

    /**
     * Cross join with the given lists, returning all possible permutations.
     */
    public crossJoin<TCrossJoinKey extends number | string, TCrossJoinValue>(
        ...lists: Enumerable<TCrossJoinKey, TCrossJoinValue>[]
    ): Collection<TKey, (TValue | TCrossJoinValue)[] | Record<string, TValue | TCrossJoinValue>> {
        return new Collection(
            Arr.crossJoin(this.items, ...(array_map(this.getArrayableItems.bind(this), lists) as any)),
        ) as any;
    }

    /**
     * Dump the given arguments and terminate execution.
     */
    public dd(...args: any[]): void {
        console.log(this.all(), ...args);
        throw new Error();
    }

    /**
     * Get the items in the collection that are not present in the given items.
     */
    public diff(items: Enumerable<number | string, any>): Collection<TKey, TValue> {
        return new Collection(array_diff(this.items, this.getArrayableItems(items))) as any;
    }

    /**
     * Get the items in the collection whose keys and values are not present in the given items.
     */
    public diffAssoc(items: Enumerable<number | string, any>): Collection<TKey, TValue> {
        return new Collection(array_diff_assoc(this.items, this.getArrayableItems(items))) as any;
    }

    /**
     * Get the items in the collection whose keys and values are not present in the given items, using the callback.
     */
    public diffAssocUsing(
        items: Enumerable<number | string, any>,
        callback: (key1: string, key2: string) => number,
    ): Collection<TKey, TValue> {
        return new Collection(array_diff_uassoc(this.items, this.getArrayableItems(items), callback)) as any;
    }

    /**
     * Get the items in the collection whose keys are not present in the given items.
     */
    public diffKeys(items: Enumerable<number | string, any>): Collection<TKey, TValue> {
        return new Collection(array_diff_key(this.items, this.getArrayableItems(items))) as any;
    }

    /**
     * Determine if an item is not contained in the collection.
     */
    public doesntContain(key: any, operator?: any, value?: any): boolean {
        return !this.contains(key, operator, value);
    }

    /**
     * Determine if an item is not contained in the enumerable, using strict comparison.
     */
    public doesntContainStrict(key: any, operator?: any): boolean {
        return !this.containsStrict(key, operator);
    }

    /**
     * Flatten a multi-dimensional associative array with dots.
     */
    public dot(): Collection<string, TValue> {
        return new Collection(Arr.dot(this.all()));
    }

    /**
     * Dump the items.
     */
    public dump(...args: any[]): this {
        console.log(this.all(), ...args);

        return this;
    }

    /**
     * Retrieve duplicate items from the collection.
     */
    public duplicates<TMapValue>(
        callback?: ((value: TValue) => TMapValue) | string,
        strict: boolean = false,
    ): Collection<TKey, TValue> {
        const items = this.map(this.valueRetriever(callback) as (value: TValue) => TMapValue);
        const uniqueItems = items.unique(undefined, strict);
        const compare = this.duplicateComparator(strict);
        const duplicates = new Collection(Array.isArray(this.items) ? [] : {});

        for (const [key, value] of Object.entries(items.all())) {
            if (uniqueItems.isNotEmpty() && compare(value as any, uniqueItems.first() as TValue)) {
                uniqueItems.shift();
            } else {
                if (Array.isArray(duplicates.all())) {
                    duplicates.push(value);
                } else {
                    duplicates.put(key, value);
                }
            }
        }

        return duplicates as any;
    }

    /**
     * Retrieve duplicate items from the collection using strict comparison.
     */
    public duplicatesStrict<TMapValue>(callback?: ((value: TValue) => TMapValue) | string): Collection<TKey, TValue> {
        return this.duplicates(callback, true);
    }

    /**
     * Execute a callback over each item.
     */
    public each(callback: (value: TValue, key: TKey) => any): this {
        for (const [key, item] of Object.entries(this.items)) {
            if (callback(item, key as TKey) === false) {
                break;
            }
        }

        return this;
    }

    /**
     * Execute a callback over each nested chunk of items.
     */
    public eachSpread(callback: (...chunk: any[]) => any): Collection<TKey, TValue> {
        return this.each((chunk: TValue, key: TKey) => {
            chunk = this.getArrayableItems(chunk).slice();
            (chunk as any[]).push(key);

            return callback(...(chunk as any[]));
        });
    }

    /**
     * Ensure that every item in the collection is of the expected type.
     */
    public ensure<TEnsureOfType>(
        type:
            | TEnsureOfType
            | TEnsureOfType[]
            | 'bigint'
            | 'boolean'
            | 'function'
            | 'number'
            | 'object'
            | 'string'
            | 'symbol'
            | 'undefined',
    ): this {
        let allowedTypes = Array.isArray(type) ? type : [type];

        return this.each((item, index) => {
            let itemType = typeof item;

            for (const allowedType of allowedTypes) {
                if (itemType === allowedType || (typeof allowedType === 'function' && item instanceof allowedType)) {
                    return true;
                }
            }

            allowedTypes = allowedTypes.map((type) => (typeof type === 'function' ? type.name : type)) as any;
            itemType = itemType === 'function' ? (item as Function).name : (itemType as any);

            throw new Error(
                `Collection should only include [${allowedTypes}] items, but '${itemType}' found at position ${index}.`,
            );
        });
    }

    /**
     * Determine if all items pass the given truth test.
     */
    public every(key: ((value: TValue, key: TKey) => boolean) | TValue | string, operator?: any, value?: any): boolean {
        if (arguments.length === 1) {
            const callback = this.valueRetriever(key as Function | string);

            for (const [k, v] of Object.entries(this.items)) {
                if (!callback(v, k)) {
                    return false;
                }
            }

            return true;
        }

        return this.every(this.operatorForWhere(key as any, operator, value) as (value: TValue, key: TKey) => boolean);
    }

    /**
     * Get all items except for those with the specified keys.
     */
    public except(keys: TValue[] | Collection<TKey, TValue> | string): Collection<TKey, TValue> {
        if (keys instanceof Collection) {
            keys = keys.all() as any;
        } else if (!Array.isArray(keys)) {
            keys = [...arguments];
        }

        return new Collection(Arr.except(this.items, keys as any)) as any;
    }

    /**
     * Run a filter over each of the items.
     */
    public filter(callback?: (value: TValue, key: TKey) => boolean): Collection<TKey, TValue> {
        if (callback) {
            return new Collection(Arr.where(this.items, callback as any)) as any;
        }

        return new Collection(array_filter(this.items)) as any;
    }

    /**
     * Get the first item from the collection passing the given truth test.
     */
    public first<TFirstDefault>(
        callback?: (value: TValue, key: TKey) => boolean,
        defaultValue?: TFirstDefault | (() => TFirstDefault),
    ): TValue | TFirstDefault {
        return Arr.first(this.items, callback as any, defaultValue);
    }

    /**
     * Get the first item in the collection but throw an exception if no matching items exist.
     *
     * @throws if item not found.
     */
    public firstOrFail(key?: ((value: TValue, key: TKey) => boolean) | string, operator?: string, value?: any): TValue {
        const filter = arguments.length > 1 ? this.operatorForWhere(key as any, operator, value) : key;

        const placeholder = {};
        const item = this.first(filter as any, placeholder);

        if (item === placeholder) {
            throw new Error('Item not found.');
        }

        return item as TValue;
    }

    /**
     * Get the first item by the given key value pair.
     */
    public firstWhere(key: Function | string, operator?: any, value?: any): TValue | undefined {
        return this.first(this.operatorForWhere(key, operator, value) as (value: TValue, key: TKey) => boolean);
    }

    /**
     * Map a collection and flatten the result by a single level.
     */
    public flatMap<TFlatMapKey extends number | string, TFlatMapValue>(
        callback: (value: TValue, key: TKey) => Collection<TFlatMapKey, TFlatMapValue> | TFlatMapValue[],
    ): Collection<TFlatMapKey, TFlatMapValue> {
        return this.map(callback).collapse() as any;
    }

    /**
     * Get a flattened array of the items in the collection.
     */
    public flatten(depth: number = Number.POSITIVE_INFINITY): Collection<TKey, any> {
        return new Collection(Arr.flatten(this.items, depth)) as any;
    }

    /**
     * Flip the items in the collection.
     */
    public flip(): Collection<string, TKey> {
        return new Collection(array_flip(this.items as any)) as any;
    }

    /**
     * Remove an item from the collection by key.
     */
    public forget(keys: TKey | Enumerable<number | string, TKey>): this {
        for (const key of Object.values(this.getArrayableItems(keys))) {
            this.offsetUnset(key);
        }

        return this;
    }

    /**
     * "Paginate" the collection by slicing it into a smaller collection.
     */
    public forPage(page: number, perPage: number): Collection<TKey, TValue> {
        const offset = Math.max(0, (page - 1) * perPage);

        return this.slice(offset, perPage);
    }

    /**
     * Create a new collection by decoding a JSON string.
     */
    public static fromJson(json: string): Collection<number | string, any> {
        return new Collection(JSON.parse(json));
    }

    /**
     * Get an item from the collection by key.
     */
    public get<TGetDefault>(key?: TKey, defaultValue?: TGetDefault | (() => TGetDefault)): TValue | TGetDefault {
        key ??= '' as TKey;

        if (Object.hasOwn(this.items, key)) {
            return (this.items as any)[key];
        }

        return value(defaultValue) as any;
    }

    /**
     * Group an associative array by a field or using a callback.
     */
    public groupBy<TGroupKey extends number | string, TGroupBy extends any[] | string>(
        groupBy: ((value: TValue, key: TKey) => TGroupKey) | TGroupBy,
        preserveKeys: boolean = false,
    ): Collection<
        TGroupBy extends string ? number | string : TGroupBy extends any[] ? number | string : TGroupKey,
        Collection<TKey | number, TGroupBy extends any[] ? any : TValue>
    > {
        let nextGroups: any[] = [];

        if (!this.useAsCallable(groupBy) && Array.isArray(groupBy)) {
            nextGroups = groupBy;
            groupBy = array_shift(nextGroups);
        }

        groupBy = this.valueRetriever(groupBy as any) as any;

        const results: Record<string, Collection<number | string, any>> = {};

        for (const [key, value] of Object.entries(this.items)) {
            // @ts-ignore
            let groupKeys = groupBy(value, key);

            if (!Array.isArray(groupKeys)) {
                groupKeys = [groupKeys];
            }

            for (let groupKey of groupKeys) {
                switch (true) {
                    case typeof groupKey === 'boolean':
                        groupKey = groupKey === true ? 1 : 0;
                        break;
                    case groupKey === undefined || groupKey === null:
                        groupKey = String(groupKey);
                        break;
                    default:
                        groupKey = groupKey;
                }

                if (!Object.hasOwn(results, groupKey)) {
                    results[groupKey] = new Collection(preserveKeys ? {} : []) as any;
                }

                results[groupKey].offsetSet(preserveKeys ? key : undefined, value);
            }
        }

        const result = new Collection(results);

        if (!empty(nextGroups)) {
            return result.map((value) => value.groupBy(nextGroups.slice(), preserveKeys)) as any;
        }

        return result as any;
    }

    /**
     * Determine if an item exists in the collection by key.
     */
    public has(key: TKey | TKey[]): boolean {
        const keys = Array.isArray(key) ? key : [...arguments];

        return array_all(keys, (key) => Object.hasOwn(this.items, key ?? ''));
    }

    /**
     * Determine if any of the keys exist in the collection.
     */
    public hasAny(key: TKey | TKey[]): boolean {
        if (this.isEmpty()) {
            return false;
        }

        const keys = Array.isArray(key) ? key : [...arguments];

        return array_any(keys, (key) => Object.hasOwn(this.items, key ?? ''));
    }

    /**
     * Concatenate values of a given key as a string.
     */
    public implode(value?: ((value: TValue, key: TKey) => any) | number | string, glue?: string): string {
        if (this.useAsCallable(value)) {
            return Object.values(this.map(value as (value: TValue, key: TKey) => any).all()).join(glue ?? '');
        }

        const first = this.first();

        if (Arr.accessible(first)) {
            return Object.values(this.pluck(value as number | string).all()).join(glue ?? '');
        }

        return Object.values(this.items).join(String(value) ?? '');
    }

    /**
     * Intersect the collection with the given items.
     */
    public intersect(items: Enumerable<number | string, any>): Collection<TKey, TValue> {
        return new Collection(array_intersect(this.items, this.getArrayableItems(items))) as any;
    }

    /**
     * Intersect the collection with the given items with additional index check.
     */
    public intersectAssoc(items: Enumerable<number | string, any>): Collection<TKey, TValue> {
        return new Collection(array_intersect_assoc(this.items, this.getArrayableItems(items))) as any;
    }

    /**
     * Intersect the collection with the given items with additional index check, using the callback.
     */
    public intersectAssocUsing(
        items: Enumerable<number | string, any>,
        callback: (key1: string, key2: string) => number,
    ): Collection<TKey, TValue> {
        return new Collection(array_intersect_uassoc(this.items, this.getArrayableItems(items), callback)) as any;
    }

    /**
     * Intersect the collection with the given items by key.
     */
    public intersectByKeys(items: Enumerable<number | string, any>): Collection<TKey, TValue> {
        return new Collection(array_intersect_key(this.items, this.getArrayableItems(items))) as any;
    }

    /**
     * Intersect the collection with the given items, using the callback.
     */
    public intersectUsing(
        items: Enumerable<number | string, any>,
        callback: (value1: any, value2: any) => number,
    ): Collection<TKey, TValue> {
        return new Collection(array_uintersect(this.items, this.getArrayableItems(items), callback)) as any;
    }

    /**
     * Determine if the collection is empty or not.
     */
    public isEmpty(): boolean {
        return empty(this.items);
    }

    /**
     * Determine if the collection is not empty.
     */
    public isNotEmpty(): boolean {
        return !this.isEmpty();
    }

    /**
     * Join all items from the collection using a string. The final items can use a separate glue string.
     */
    public join(glue: string, finalGlue: string = ''): TValue | string {
        if (finalGlue === '') {
            return this.implode(glue);
        }

        const count = this.count();

        if (count === 0) {
            return '';
        }

        if (count === 1) {
            return this.last();
        }

        const collection = new Collection(this.items);
        const finalItem = collection.pop();

        return collection.implode(glue) + finalGlue + finalItem;
    }

    /**
     * Key an associative array by a field or using a callback.
     */
    public keyBy<TNewKey extends number | string, TKeyBy extends any[] | string>(
        keyBy: ((value: TValue, key: TKey) => TNewKey) | TKeyBy,
    ): Collection<TKeyBy extends string ? number | string : TKeyBy extends any[] ? number | string : TNewKey, TValue> {
        keyBy = this.valueRetriever(keyBy as any) as any;
        const results: Record<string, TValue> = {};

        for (const [key, item] of Object.entries(this.items)) {
            let resolvedKey = (keyBy as Function)(item, key);
            results[resolvedKey] = item;
        }

        return new Collection(results) as any;
    }

    /**
     * Get the keys of the collection items.
     */
    public keys(): Collection<number, TKey> {
        return new Collection(array_keys(this.items)) as any;
    }

    /**
     * Get the last item from the collection.
     */
    public last<TLastDefault>(
        callback?: (value: TValue, key: TKey) => boolean,
        defaultValue?: TLastDefault | (() => TLastDefault),
    ): TValue | TLastDefault {
        return Arr.last(this.items, callback as any, defaultValue);
    }

    /**
     * Create a new collection instance if the value isn't one already.
     */
    public static make<TMakeKey extends number | string, TMakeValue>(
        items: TMakeValue[] | Record<TMakeKey, TMakeValue> = [],
    ): Collection<TMakeKey, TMakeValue> {
        return new Collection(items);
    }

    /**
     * Run a map over each of the items.
     */
    public map<TMapValue>(callback: (value: TValue, key: TKey) => TMapValue): Collection<TKey, TMapValue> {
        return new Collection(Arr.map(this.items, callback as any)) as any;
    }

    /**
     * Map the values into a new class.
     */
    public mapInto<TMapIntoValue>(className: TMapIntoValue): Collection<TKey, TMapIntoValue> {
        return this.map((value) => new (className as ObjectConstructor)(value)) as any;
    }

    /**
     * Run a map over each nested chunk of items.
     */
    public mapSpread<TMapSpreadValue>(
        callback: (...chunk: any[]) => TMapSpreadValue,
    ): Collection<TKey, TMapSpreadValue> {
        return this.map((chunk, key) => {
            chunk = this.getArrayableItems(chunk).slice();
            (chunk as any[]).push(key);

            return callback(...(chunk as any[]));
        });
    }

    /**
     * Run a dictionary map over the items.
     *
     * The callback should return an associative array with a single key/value pair.
     */
    public mapToDictionary<TMapToDictionaryKey extends number | string, TMapToDictionaryValue>(
        callback: (value: TValue, key: TKey) => Record<TMapToDictionaryKey, TMapToDictionaryValue>,
    ): Collection<TMapToDictionaryKey, TMapToDictionaryValue[]> {
        const dictionary: Record<TMapToDictionaryKey, TMapToDictionaryValue[]> = {} as any;

        for (let [key, item] of Object.entries(this.items)) {
            const pair = callback(item, key as any);
            key = Object.keys(pair)[0];
            const pairValue = Object.values(pair)[0];

            if (!isset((dictionary as any)[key])) {
                (dictionary as any)[key] = [];
            }

            (dictionary as any)[key].push(pairValue);
        }

        return new Collection(dictionary) as any;
    }

    /**
     * Run a grouping map over the items.
     *
     * The callback should return an associative array with a single key/value pair.
     */
    public mapToGroups<TMapToGroupsKey extends number | string, TMapToGroupsValue>(
        callback: (value: TValue, key: TKey) => Record<TMapToGroupsKey, TMapToGroupsValue>,
    ): Collection<TMapToGroupsKey, Collection<number, TMapToGroupsValue>> {
        const groups = this.mapToDictionary(callback);

        // @ts-ignore
        return groups.map(Collection.make.bind(this)) as any;
    }

    /**
     * Run an associative map over each of the items.
     *
     * The callback should return an associative array with a single key/value pair.
     */
    public mapWithKeys<TMapWithKeysKey extends number | string, TMapWithKeysValue>(
        callback: (value: TValue, key: TKey) => Record<TMapWithKeysKey, TMapWithKeysValue>,
    ): Collection<TMapWithKeysKey, TMapWithKeysValue> {
        return new Collection(Arr.mapWithKeys(this.items, callback as any)) as any;
    }

    /**
     * Get the max value of a given key.
     */
    public max(callback?: ((value: TValue) => any) | string): any {
        callback = this.valueRetriever(callback) as any;

        return this.reject((value) => value === undefined || value === null).reduce(function (result, item) {
            const itemValue = (callback as Function)(item);

            return result === undefined || result === null || itemValue > result ? itemValue : result;
        });
    }

    /**
     * Get the median of a given key.
     */
    public median(key?: string | string[]): number | null {
        const values = (isset(key) ? this.pluck(key) : this)
            .reject((item) => item === undefined || item === null)
            .sort()
            .values();

        const count = values.count();

        if (count === 0) {
            return null;
        }

        const middle = Math.floor(count / 2);

        if (count % 2) {
            return values.get(middle) as any;
        }

        return new Collection([values.get(middle - 1), values.get(middle)]).avg();
    }

    /**
     * Merge the collection with the given items.
     */
    public merge(items: Enumerable<number | string, any>): Collection<number | string, any> {
        return new Collection(array_merge(this.items, this.getArrayableItems(items))) as any;
    }

    /**
     * Recursively merge the collection with the given items.
     */
    public mergeRecursive<TMergeRecursiveValue>(
        items: Enumerable<number | string, TMergeRecursiveValue>,
    ): Collection<number | string, TValue | TMergeRecursiveValue> {
        return new Collection(array_merge_recursive(this.items, this.getArrayableItems(items))) as any;
    }

    /**
     * Get the min value of a given key.
     */
    public min(callback?: ((value: TValue) => any) | string): any {
        callback = this.valueRetriever(callback) as any;

        return this.map((value) => (callback as Function)(value))
            .reject((value: any) => value === undefined || value === null)
            .reduce((result, value) => (result === undefined || result === null || value < result ? value : result));
    }

    /**
     * Get the mode of a given key.
     */
    public mode(key?: number | string | (number | string)[]): number[] | null {
        if (this.count() === 0) {
            return null;
        }

        const collection = isset(key) ? this.pluck(key) : this;
        const counts = new Map();

        collection.each((value) =>
            counts.has(value) ? counts.set(value, counts.get(value) + 1) : counts.set(value, 1),
        );

        // @ts-ignore
        const highestValue = counts.values().toArray().sort().pop();

        return (
            counts
                .entries()
                // @ts-ignore
                .toArray()
                .sort(([, v1]: [any, number], [, v2]: [any, number]) => v1 - v2)
                .filter(([, v]: [any, number]) => v === highestValue)
                .map(([k]: [any]) => k)
                .sort() as any
        );
    }

    /**
     * Multiply the items in the collection by the multiplier.
     */
    public multiply(multiplier: number): Collection<number, TValue[] | Record<TKey, TValue>> {
        const newCollection = new Collection();

        for (let i = 0; i < multiplier; i++) {
            newCollection.push(...(this.items as any));
        }

        return newCollection as any;
    }

    /**
     * Create a new collection consisting of every n-th element.
     */
    public nth(step: number, offset: number = 0): Collection<TKey, TValue> {
        const newItems = [];
        let position = 0;

        for (const item of Object.values(this.slice(offset).items)) {
            if (position % step === 0) {
                newItems.push(item);
            }

            position++;
        }

        return new Collection(newItems) as any;
    }

    /**
     * Unset the item at a given offset.
     */
    public offsetUnset(key: TKey): void {
        unset(this.items, key);
    }

    /**
     * Set the item at a given offset.
     */
    public offsetSet(key: TKey | undefined, value: TValue): void {
        if (key === undefined) {
            array_push(this.items, value);
        } else {
            (this.items as any)[key] = value;
        }
    }

    /**
     * Get the items with the specified keys.
     */
    public only(keys: Enumerable<number | string, TKey>): Collection<TKey, TValue> {
        if (keys instanceof Collection) {
            keys = keys.all();
        }

        keys = Array.isArray(keys) ? keys : [...arguments];

        return new Collection(Arr.only(this.items, keys)) as any;
    }

    /**
     * Pad collection to the specified length with a value.
     */
    public pad<TPadValue>(size: number, value: TPadValue): Collection<number, TValue | TPadValue> {
        return new Collection(array_pad(this.items, size, value)) as any;
    }

    /**
     * Partition the collection into two arrays using the given callback or key.
     */
    public partition(
        key: ((value: TValue, key: TKey) => boolean) | TValue | string,
        operator?: any,
        value?: any,
    ): Collection<0 | 1, Collection<TKey, TValue>> {
        const callback =
            arguments.length === 1
                ? this.valueRetriever(key as any)
                : (this.operatorForWhere(key as any, operator, value) as any);

        const [passed, failed] = Arr.partition(this.items, callback);

        return new Collection([new Collection(passed), new Collection(failed)]) as any;
    }

    /**
     * Calculate the percentage of items that pass a given truth test.
     */
    public percentage(callback: (value: TValue, key: TKey) => boolean, precision: number = 2): number | null {
        if (this.isEmpty()) {
            return null;
        }

        return Number.parseFloat(((this.filter(callback).count() / this.count()) * 100).toFixed(precision));
    }

    /**
     * Pass the collection to the given callback and return the result.
     */
    public pipe<TPipeReturnType>(callback: (instance: this) => TPipeReturnType): TPipeReturnType {
        return callback(this);
    }

    /**
     * Pass the collection into a new class.
     */
    public pipeInto<TPipeIntoValue extends new (...args: any) => any>(
        className: TPipeIntoValue,
    ): InstanceType<TPipeIntoValue> {
        return new className(this);
    }

    /**
     * Pass the collection through a series of callable pipes and return the result.
     */
    public pipeThrough(callbacks: ((carry: any) => any)[]): any {
        return new Collection(callbacks).reduce((carry, callback) => callback(carry), this);
    }

    /**
     * Push an item onto the beginning of the collection.
     */
    public prepend(value: any, key?: number | string): this {
        this.items = Arr.prepend(this.items, value, key) as any;

        return this;
    }

    /**
     * Get the values of a given key.
     */
    public pluck(
        value?: ((item: any) => any) | number | string | (number | string)[],
        key?: ((item: any) => number) | string,
    ): Collection<TKey | number | string, TValue> {
        return new Collection(Arr.pluck(this.items, value, key)) as any;
    }

    /**
     * Get and remove the last N items from the collection.
     */
    public pop(count: number = 1): TValue | null | Collection<number, TValue> {
        if (count < 1) {
            return new Collection();
        }

        if (count === 1) {
            return array_pop(this.items);
        }

        if (this.isEmpty()) {
            return new Collection();
        }

        const results = [];
        const collectionCount = this.count();

        for (const _ of range(1, Math.min(count, collectionCount))) {
            results.push(array_pop(this.items));
        }

        return new Collection(results) as any;
    }

    /**
     * Get and remove an item from the collection.
     */
    public pull<TPullDefault>(key: TKey, defaultValue?: TPullDefault | (() => TPullDefault)): TValue | TPullDefault {
        return Arr.pull(this.items, key, defaultValue);
    }

    /**
     * Push one or more items onto the end of the collection.
     */
    public push(...values: any[]): this {
        array_push(this.items, ...values);

        return this;
    }

    /**
     * Put an item in the collection by key.
     */
    public put(key: number | string, value: any): this {
        this.offsetSet(key as any, value);

        return this;
    }

    /**
     * Create a collection with the given range.
     */
    public static range(from: number, to: number, step: number = 1): Collection<number, number> {
        return new Collection(range(from, to, step)) as any;
    }

    /**
     * Reduce the collection to a single value.
     *
     * The value for carry on the first iteration will be undefined unless an initial value is provided.
     */
    public reduce<TReduceInitial, TReduceReturnType>(
        callback: (
            carry: TReduceInitial | TReduceReturnType | undefined,
            value: TValue,
            key: TKey,
        ) => TReduceReturnType,
        initial?: TReduceInitial,
    ): TReduceReturnType {
        let result = initial;

        for (const [key, value] of Object.entries(this.items)) {
            result = callback(result as any, value, key as any) as any;
        }

        return result as TReduceReturnType;
    }

    /**
     * Reduce the collection to multiple aggregate values.
     *
     * @throws {Error} If reducer does not return an array.
     */
    public reduceSpread(callback: (...values: any[]) => any[], ...initial: any[]): any[] {
        let result = initial;

        for (const [key, value] of Object.entries(this.items)) {
            result = callback(...(array_merge(result, [value, key]) as any[])) as any;

            if (!Array.isArray(result)) {
                throw new Error(
                    `Collection.reduceSpread expects reducer to return an array, but got a '${typeof result}' instead.`,
                );
            }
        }

        return result;
    }

    /**
     * Create a collection of all elements that do not pass a given truth test.
     */
    public reject(
        callback: ((value: TValue, key: TKey) => boolean) | boolean | TValue = true,
    ): Collection<TKey, TValue> {
        const useAsCallable = this.useAsCallable(callback);

        return this.filter((value: TValue, key: TKey): boolean =>
            useAsCallable ? !(callback as Function)(value, key) : value != callback,
        );
    }

    /**
     * Replace the collection items with the given items.
     */
    public replace(items: Enumerable<number | string, any>): Collection<number | string, any> {
        return new Collection(array_replace(this.items, this.getArrayableItems(items))) as any;
    }

    /**
     * Recursively replace the collection items with the given items.
     */
    public replaceRecursive(items: Enumerable<number | string, any>): Collection<number | string, any> {
        return new Collection(array_replace_recursive(this.items, this.getArrayableItems(items))) as any;
    }

    /**
     * Reverse items order.
     */
    public reverse(): Collection<TKey, TValue> {
        return new Collection(array_reverse(this.items, true)) as any;
    }

    /**
     * Search the collection for a given value and return the corresponding key if successful.
     */
    public search(value: TValue | ((value: TValue, key: TKey) => boolean), strict: boolean = false): TKey | false {
        if (!this.useAsCallable(value)) {
            return array_search(value, this.items, strict) as any;
        }

        return array_find_key(this.items, value as any) ?? (false as any);
    }

    /**
     * Select specific values from the items within the collection.
     */
    public select(keys: Enumerable<number | string, TKey>): Collection<TKey, TValue> {
        if (keys instanceof Collection) {
            keys = keys.all();
        }

        keys = Array.isArray(keys) ? keys : [...arguments];

        return new Collection(Arr.select(this.items, keys)) as any;
    }

    /**
     * Get and remove the first N items from the collection.
     * @throws if count is less than 0.
     */
    public shift(count: number = 1): TValue | Collection<number, TValue> | null {
        if (count < 0) {
            throw new Error('Number of shifted items may not be less than zero.');
        }

        if (this.isEmpty()) {
            return null;
        }

        if (count === 0) {
            return new Collection();
        }

        if (count === 1) {
            return array_shift(this.items);
        }

        const results = [];
        const collectionCount = this.count();

        for (const _ of range(1, Math.min(count, collectionCount))) {
            results.push(array_shift(this.items));
        }

        return new Collection(results) as any;
    }

    /**
     * Skip the first {count} items.
     */
    public skip(count: number): Collection<TKey, TValue> {
        return this.slice(count);
    }

    /**
     * Slice the underlying collection array.
     */
    public slice(offset: number, length?: number): Collection<TKey, TValue> {
        return new Collection(array_slice(this.items, offset, length, true)) as any;
    }

    /**
     * Create chunks representing a "sliding window" view of the items in the collection.
     */
    public sliding(size: number = 2, step: number = 1): Collection<number, Collection<TKey, TValue>> {
        const chunks = Math.floor((this.count() - size) / step) + 1;

        return Collection.times(chunks, (number) => this.slice((number - 1) * step, size));
    }

    /**
     * Get the first item in the collection, but only if exactly one item exists. Otherwise, throw an exception.
     *
     * @throws if item not found.
     * @throws if multiple items found.
     */
    public sole(key?: ((value: TValue, key: TKey) => boolean) | string, operator?: any, value?: any): TValue {
        const filter = arguments.length > 1 ? this.operatorForWhere(key as any, operator, value) : key;
        const items = filter === undefined ? this : this.filter(filter as any);
        const count = items.count();

        if (count === 0) {
            throw new Error('Item not found.');
        }

        if (count > 1) {
            throw new Error(`${count} items were found.`);
        }

        return items.first();
    }

    /**
     * Sort through each item with a callback.
     */
    public sort(
        callback?:
            | ((value: TValue, value2: TValue) => number)
            | typeof SORT_REGULAR
            | typeof SORT_NUMERIC
            | typeof SORT_STRING
            | typeof SORT_LOCALE_STRING
            | typeof SORT_NATURAL
            | typeof SORT_FLAG_CASE
            | number,
    ): Collection<TKey, TValue> {
        const items = this.items;
        callback && typeof callback === 'function' ? uasort(items, callback) : asort(items, callback ?? SORT_REGULAR);

        return new Collection(items);
    }

    /**
     * Sort the collection using the given callback.
     */
    public sortBy(
        callback:
            | (
                  | ((value: TValue, value2: TValue) => any)
                  | ((value: TValue, key: TKey) => any)
                  | string
                  | [string, string][]
              )[]
            | ((value: TValue, key: TKey) => any)
            | string,
        options:
            | typeof SORT_REGULAR
            | typeof SORT_NUMERIC
            | typeof SORT_STRING
            | typeof SORT_LOCALE_STRING
            | typeof SORT_NATURAL
            | typeof SORT_FLAG_CASE
            | number = SORT_REGULAR,
        descending: boolean = false,
    ): Collection<TKey, TValue> {
        if (Array.isArray(callback) && typeof callback !== 'function') {
            return this.sortByMany(callback, options);
        }

        const results: any[] | Record<string, any> = Array.isArray(this.items) ? [] : {};
        const map = new Map();
        callback = this.valueRetriever(callback) as any;

        // First we will loop through the items and get the comparator from a callback
        // function which we were given. Then, we will sort the returned values and
        // grab all the corresponding values for the sorted keys from this array.
        for (const [key, value] of Object.entries(this.items)) {
            (results as any)[key] = (callback as Function)(value, key);
            map.set((results as any)[key], key);
        }

        descending ? arsort(results, options) : asort(results, options);

        // Once we have sorted all of the keys in the array, we will loop through them
        // and grab the corresponding model so we can set the underlying items list
        // to the sorted version. Then we'll just return the collection instance.
        for (const [key, value] of Object.entries(results)) {
            (results as any)[key] = (this.items as any)[map.get(value)];
        }

        return new Collection(results) as any;
    }

    /**
     * Sort the collection in descending order using the given callback.
     */
    public sortByDesc(
        callback:
            | (
                  | ((value: TValue, value2: TValue) => any)
                  | ((value: TValue, key: TKey) => any)
                  | string
                  | [string, string][]
              )[]
            | ((value: TValue, key: TKey) => any)
            | string,
        options:
            | typeof SORT_REGULAR
            | typeof SORT_NUMERIC
            | typeof SORT_STRING
            | typeof SORT_LOCALE_STRING
            | typeof SORT_NATURAL
            | typeof SORT_FLAG_CASE
            | number = SORT_REGULAR,
    ): Collection<TKey, TValue> {
        if (Array.isArray(callback) && typeof callback !== 'function') {
            for (const [index, key] of Object.entries(callback)) {
                let comparison = Arr.wrap(key);
                comparison[1] = 'desc';
                callback[Number(index)] = comparison;
            }
        }

        return this.sortBy(callback, options, true);
    }

    /**
     * Sort items in descending order.
     */
    public sortDesc(
        options:
            | typeof SORT_REGULAR
            | typeof SORT_NUMERIC
            | typeof SORT_STRING
            | typeof SORT_LOCALE_STRING
            | typeof SORT_NATURAL
            | typeof SORT_FLAG_CASE
            | number = SORT_REGULAR,
    ): Collection<TKey, TValue> {
        const items = this.items;
        arsort(items, options);

        return new Collection(items);
    }

    /**
     * Sort the collection keys.
     */
    public sortKeys(
        options: typeof SORT_REGULAR | typeof SORT_NUMERIC | typeof SORT_STRING = SORT_REGULAR,
        descending: boolean = false,
    ): Collection<TKey, TValue> {
        const items = this.items;
        descending ? krsort(items, options) : ksort(items, options);

        return new Collection(items);
    }

    /**
     * Sort the collection keys in descending order.
     */
    public sortKeysDesc(
        options: typeof SORT_REGULAR | typeof SORT_NUMERIC | typeof SORT_STRING = SORT_REGULAR,
    ): Collection<TKey, TValue> {
        return this.sortKeys(options, true);
    }

    /**
     * Sort the collection keys using a callback.
     */
    public sortKeysUsing(callback: (key: TKey, key2: TKey) => number): Collection<TKey, TValue> {
        const items = this.items;
        uksort(items, callback);

        return new Collection(items);
    }

    /**
     * Splice a portion of the underlying collection array.
     */
    public splice(offset: number, length?: number, replacement: TValue[] = []): Collection<TKey, TValue> {
        if (arguments.length === 1) {
            return new Collection(array_splice(this.items, offset)) as any;
        }

        return new Collection(
            array_splice(this.items, offset, length, Object.values(this.getArrayableItems(replacement))),
        ) as any;
    }

    /**
     * Split a collection into a certain number of groups.
     */
    public split(numberOfGroups: number): Collection<number, Collection<TKey, TValue>> {
        if (this.isEmpty()) {
            return new Collection();
        }

        const groups = new Collection();
        const groupSize = Math.floor(this.count() / numberOfGroups);
        const remain = this.count() % numberOfGroups;
        let start = 0;

        for (let i = 0; i < numberOfGroups; i++) {
            let size = groupSize;

            if (i < remain) {
                size++;
            }

            if (size) {
                groups.push(new Collection(array_slice(this.items, start, size)));
                start += size;
            }
        }

        return groups as any;
    }

    /**
     * Split a collection into a certain number of groups, and fill the first groups completely.
     */
    public splitIn(numberOfGroups: number): Collection<number, Collection<TKey, TValue>> {
        return this.chunk(Math.ceil(this.count() / numberOfGroups)) as any;
    }

    /**
     * Get the sum of the given values.
     */
    public sum<TCallback extends ((value: TValue) => TReturnType) | string, TReturnType>(
        callback?: TCallback,
    ): TCallback extends Function ? TReturnType : any {
        callback = callback === undefined ? this.identity() : (this.valueRetriever(callback) as any);

        return this.reduce((result, item) => result + (callback as Function)(item), 0);
    }

    /**
     * Take the first or last {$limit} items.
     */
    public take(limit: number): Collection<TKey, TValue> {
        if (limit < 0) {
            return this.slice(limit, Math.abs(limit));
        }

        return this.slice(0, limit);
    }

    /**
     * Pass the collection to the given callback and then return it.
     */
    public tap(callback: (instance: this) => any): this {
        callback(this);

        return this;
    }

    /**
     * Create a new collection by invoking the callback a given amount of times.
     */
    public static times<TTimesValue>(
        number: number,
        callback?: (number: number) => TTimesValue,
    ): Collection<number, TTimesValue> {
        if (number < 1) {
            return new Collection();
        }

        const collection = Collection.range(1, number);

        if (callback === undefined) {
            return collection as any;
        }

        return collection.map(callback);
    }

    /**
     * Get the collection of items as a plain array.
     */
    public toArray(): TValue[] | Record<TKey, TValue> {
        return this.map((value) => (value instanceof Collection ? value.toArray() : value)).all() as any;
    }

    /**
     * Get the collection of items as JSON.
     */
    public toJson(): string {
        return JSON.stringify(this.all());
    }

    /**
     * Transform each item in the collection using a callback.
     */
    public transform<TMapValue>(callback: (value: TValue, key: TKey) => TMapValue): this {
        this.items = this.map(callback).all() as any;

        return this;
    }

    /**
     * Convert a flatten "dot" notation array into an expanded array.
     */
    public undot(): Collection<string, TValue> {
        return new Collection(Arr.undot(this.all()));
    }

    /**
     * Union the collection with the given items.
     */
    public union(items: Enumerable<number | string, any>): Collection<number | string, any> {
        return new Collection(array_merge(this.getArrayableItems(items), this.items)) as any;
    }

    /**
     * Return only unique items from the collection array.
     */
    public unique(
        key?: ((value: TValue, key: TKey) => any) | number | string,
        strict: boolean = false,
    ): Collection<TKey, TValue> {
        if (key === undefined && strict === false) {
            return new Collection(array_unique(this.items, SORT_REGULAR)) as any;
        }

        const callback = this.valueRetriever(key);
        const exists: any = [];

        // @ts-ignore
        return this.reject((item: TValue, key: TKey): true | undefined => {
            const id = callback(item, key);

            if (in_array(id, exists, strict)) {
                return true;
            }

            exists.push(id);
        });
    }

    /**
     * Return only unique items from the collection array using strict comparison.
     */
    public uniqueStrict(key?: ((value: TValue, key: TKey) => any) | number | string): Collection<TKey, TValue> {
        return this.unique(key, true);
    }

    /**
     * Apply the callback unless the collection is empty.
     */
    public unlessEmpty<TUnlessEmptyReturnType>(
        callback: (instance: this) => TUnlessEmptyReturnType,
        defaultValue?: (instance: this) => TUnlessEmptyReturnType,
    ): this | TUnlessEmptyReturnType {
        return this.whenNotEmpty(callback, defaultValue);
    }

    /**
     * Apply the callback unless the collection is not empty.
     */
    public unlessNotEmpty<TUnlessNotEmptyReturnType>(
        callback: (instance: this) => TUnlessNotEmptyReturnType,
        defaultValue?: (instance: this) => TUnlessNotEmptyReturnType,
    ): this | TUnlessNotEmptyReturnType {
        return this.whenEmpty(callback, defaultValue);
    }

    /**
     * Get the underlying items from the given collection if applicable.
     */
    public static unwrap<TUnwrapKey extends number | string, TUnwrapValue>(
        value: Enumerable<TUnwrapKey, TUnwrapValue>,
    ): TUnwrapValue[] | Record<TUnwrapKey, TUnwrapValue> {
        return value instanceof Collection ? value.all() : value;
    }

    /**
     * Get a single key's value from the first matching item in the collection.
     */
    public value<TValueDefault>(
        key: number | string,
        defaultValue?: TValueDefault | (() => TValueDefault),
    ): TValue | TValueDefault {
        const value = this.first((target) => data_has(target, key));

        return data_get(value, key, defaultValue);
    }

    /**
     * Reset the keys on the underlying array.
     */
    public values(): Collection<number, TValue> {
        if (Array.isArray(this.items)) {
            return new Collection(Object.values(this.items)) as any;
        }

        return new Collection({ ...Object.values(this.items) }) as any;
    }

    /**
     * Apply the callback if the collection is empty.
     */
    public whenEmpty<TWhenEmptyReturnType>(
        callback: (instance: this) => TWhenEmptyReturnType,
        defaultValue?: (instance: this) => TWhenEmptyReturnType,
    ): this | TWhenEmptyReturnType {
        return this.when(this.isEmpty(), callback, defaultValue);
    }

    /**
     * Apply the callback if the collection is not empty.
     */
    public whenNotEmpty<TWhenNotEmptyReturnType>(
        callback: (instance: this) => TWhenNotEmptyReturnType,
        defaultValue?: (instance: this) => TWhenNotEmptyReturnType,
    ): this | TWhenNotEmptyReturnType {
        return this.when(this.isNotEmpty(), callback, defaultValue);
    }

    /**
     * Filter items by the given key value pair.
     */
    public where(key?: Function | number | string, operator?: any, value?: any): Collection<TKey, TValue> {
        return this.filter(this.operatorForWhere(key, operator, value) as any);
    }

    /**
     * Filter items such that the value of the given key is between the given values.
     */
    public whereBetween(key: number | string, values: Enumerable<number | string, any>): Collection<TKey, TValue> {
        values = Object.values(this.getArrayableItems(values));

        return this.where(key, '>=', values[0]).where(key, '<=', values[values.length - 1]);
    }

    /**
     * Filter items by the given key value pair.
     */
    public whereIn(
        key: number | string,
        values: Enumerable<number | string, any>,
        strict: boolean = false,
    ): Collection<TKey, TValue> {
        values = this.getArrayableItems(values);

        return this.filter((item) => in_array(data_get(item, key), values, strict));
    }

    /**
     * Filter items by the given key value pair using strict comparison.
     */
    public whereInStrict(key: number | string, values: Enumerable<number | string, any>): Collection<TKey, TValue> {
        return this.whereIn(key, values, true);
    }

    /**
     * Filter the items, removing any items that don't match the given type(s).
     */
    public whereInstanceOf<TWhereInstanceOf>(
        type: TWhereInstanceOf | TWhereInstanceOf[],
    ): Collection<TKey, TWhereInstanceOf> {
        return this.filter((value) => {
            if (Array.isArray(type)) {
                for (const classType of type) {
                    if (typeof classType === 'function' && value instanceof classType) {
                        return true;
                    }
                }

                return false;
            }

            return typeof type === 'function' && value instanceof type;
        }) as any;
    }

    /**
     * Filter items such that the value of the given key is not between the given values.
     */
    public whereNotBetween(key: number | string, values: Enumerable<number | string, any>): Collection<TKey, TValue> {
        values = Object.values(this.getArrayableItems(values));

        return this.filter(
            (item) => data_get(item, key) < values[0] || data_get(item, key) > values[values.length - 1],
        );
    }

    /**
     * Filter items by the given key value pair.
     */
    public whereNotIn(
        key: number | string,
        values: Enumerable<number | string, any>,
        strict: boolean = false,
    ): Collection<TKey, TValue> {
        values = this.getArrayableItems(values);

        return this.reject((item) => in_array(data_get(item, key), values, strict));
    }

    /**
     * Filter items by the given key value pair using strict comparison.
     */
    public whereNotInStrict(key: number | string, values: Enumerable<number | string, any>): Collection<TKey, TValue> {
        return this.whereNotIn(key, values, true);
    }

    /**
     * Filter items where the value for the given key is not null.
     */
    public whereNotNull(key?: string): Collection<TKey, TValue> {
        return this.where(key, '!==', null);
    }

    /**
     * Filter items where the value for the given key is null.
     */
    public whereNull(key?: string): Collection<TKey, TValue> {
        return this.whereStrict(key, null);
    }

    /**
     * Filter items by the given key value pair using strict comparison.
     */
    public whereStrict(key: string | undefined, value: any): Collection<TKey, TValue> {
        return this.where(key, '===', value);
    }

    /**
     * Wrap the given value in a collection if applicable.
     */
    public static wrap<TWrapValue>(
        value: Enumerable<number | string, TWrapValue> | TWrapValue,
    ): Collection<number | string, TWrapValue> {
        return value instanceof Collection ? new Collection(value) : new Collection(Arr.wrap(value));
    }

    /**
     * Zip the collection together with one or more arrays.
     *
     * e.g. new Collection([1, 2, 3]).zip([4, 5, 6]);
     *      => [[1, 4], [2, 5], [3, 6]]
     */
    public zip<TZipValue>(
        ...items: Enumerable<number | string, TZipValue>[]
    ): Collection<number, Collection<number, TValue | TZipValue>> {
        const arrayableItems = array_map((items) => this.getArrayableItems(items), items);
        const params = array_merge(
            [
                function (...args: any): Collection<number, any> {
                    return new Collection(args);
                },
                this.items,
            ],
            arrayableItems,
        );

        return new Collection(array_map(...(params as any))) as any;
    }

    /**
     * Get the comparison function to detect duplicates.
     */
    protected duplicateComparator(strict: boolean): (value: TValue, value2: TValue) => boolean {
        if (strict) {
            return (a: TValue, b: TValue) => a === b;
        }

        return (a: TValue, b: TValue) => this.normalizeForComparison(a) == this.normalizeForComparison(b);
    }

    /**
     * Resolves array of items from Collection or Arrayable.
     */
    protected getArrayableItems(items?: any): any[] | Record<string, any> {
        return items === undefined ||
            items === null ||
            typeof items === 'bigint' ||
            typeof items === 'boolean' ||
            typeof items === 'number' ||
            typeof items === 'string'
            ? Arr.wrap(items)
            : items instanceof Collection
              ? items.all()
              : Arr.from(items);
    }

    /**
     * Make a function that returns what's passed to it.
     */
    protected identity(): (value: TValue) => TValue {
        return (value) => value;
    }

    /**
     * Normalizes the given value to be used for loose comparisons.
     */
    protected normalizeForComparison(value: any): any {
        // Convert arrays and objects to strings in order to compare structure since JS compares objects based on
        // reference.
        return typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
    }

    /**
     * Get an operator checker callback.
     */
    protected operatorForWhere(key?: Function | number | string, operator?: string, value?: any): Function {
        if (this.useAsCallable(key)) {
            return key as Function;
        }

        if (operator === undefined) {
            value = true;
            operator = '=';
        } else if (value === undefined) {
            value = operator;
            operator = '=';
        }

        return (item: any[] | Record<string, any>) => {
            const retrieved = data_get(item, key as string);
            const strings = array_filter([retrieved, value], (value) => typeof value === 'string');

            if (
                count(strings) < 2 &&
                count(
                    array_filter(
                        [retrieved, value],
                        (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
                    ),
                ) == 1
            ) {
                return in_array(operator, ['!=', '<>', '!==']);
            }

            switch (operator) {
                default:
                case '=':
                case '==':
                    return retrieved == value;
                case '!=':
                case '<>':
                    return retrieved != value;
                case '<':
                    return retrieved < value;
                case '>':
                    return retrieved > value;
                case '<=':
                    return retrieved <= value;
                case '>=':
                    return retrieved >= value;
                case '===':
                    return retrieved === value;
                case '!==':
                    return retrieved !== value;
                case '<=>':
                    return retrieved < value ? -1 : retrieved > value ? 1 : 0;
            }
        };
    }

    /**
     * Sort the collection using multiple comparisons.
     */
    protected sortByMany(
        comparisons: (
            | ((value: TValue, value2: TValue) => any)
            | ((value: TValue, key: TKey) => any)
            | string
            | [string, string][]
        )[] = [],
        options:
            | typeof SORT_REGULAR
            | typeof SORT_NUMERIC
            | typeof SORT_STRING
            | typeof SORT_LOCALE_STRING
            | typeof SORT_NATURAL
            | typeof SORT_FLAG_CASE
            | number = SORT_REGULAR,
    ): Collection<TKey, TValue> {
        const items = this.items;

        uasort(items, (a: TValue, b: TValue) => {
            for (let comparison of comparisons) {
                comparison = Arr.wrap(comparison);
                const prop = comparison[0];
                const ascending = Arr.get(comparison, 1, true) === true || Arr.get(comparison, 1, true) === 'asc';
                let result;

                if (typeof prop !== 'string' && typeof prop === 'function') {
                    result = (prop as Function)(a, b);
                } else {
                    let values = [data_get(a, prop), data_get(b, prop)];

                    if (!ascending) {
                        values = array_reverse(values) as any;
                    }

                    if ((options & SORT_FLAG_CASE) === SORT_FLAG_CASE) {
                        if ((options & SORT_NATURAL) === SORT_NATURAL) {
                            result = strnatcasecmp(values[0], values[1]);
                        } else {
                            result = strcasecmp(values[0], values[1]);
                        }
                    } else {
                        switch (options) {
                            case SORT_NUMERIC:
                                if (intval(values[0]) < intval(values[1])) {
                                    result = -1;
                                } else if (intval(values[0]) > intval(values[1])) {
                                    result = 1;
                                } else {
                                    result = 0;
                                }

                                break;
                            case SORT_STRING:
                                result = strcmp(values[0], values[1]);
                                break;
                            case SORT_NATURAL:
                                result = strnatcmp(String(values[0]), String(values[1]));
                                break;
                            case SORT_LOCALE_STRING:
                                result = strcoll(values[0], values[1]);
                                break;
                            default:
                                if (values[0] < values[1]) {
                                    result = -1;
                                } else if (values[0] > values[1]) {
                                    result = 1;
                                } else {
                                    result = 0;
                                }
                        }
                    }
                }

                if (result === 0) {
                    continue;
                }

                return result;
            }
        });

        return new Collection(items);
    }

    /**
     * Determine if the given value is callable, but not a string.
     */
    protected useAsCallable(value: any): boolean {
        return typeof value === 'function';
    }

    /**
     * Get a value retrieving callback.
     */
    protected valueRetriever(
        value?: Function | number | string,
    ): Function | ((item: any, key?: number | string) => any) {
        if (this.useAsCallable(value)) {
            return value as Function;
        }

        return (item: any, _key?: number | string): any => data_get(item, value as string);
    }
}
