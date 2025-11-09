// prettier-ignore
import {
    basename, dirname, explode, FILTER_VALIDATE_INT, filter_var, hash, mb_str_split, preg_split, sscanf, strip_tags,
} from '@balboacodes/php-utils';
import { Str } from './Str';
import { use } from './decorators/use';
import { Conditionable } from './traits/Conditionable';

export interface Stringable extends Conditionable {}

@use(Conditionable)
export class Stringable {
    /**
     * The underlying string value.
     */
    protected value: string;

    public constructor(value: string = '') {
        this.value = value;
    }

    /**
     * Return the remainder of a string after the first occurrence of a given value.
     */
    public after(search: string): Stringable {
        return new Stringable(Str.after(this.value, search));
    }

    /**
     * Return the remainder of a string after the last occurrence of a given value.
     */
    public afterLast(search: string): Stringable {
        return new Stringable(Str.afterLast(this.value, search));
    }

    /**
     * Convert the given string to APA-style title case.
     */
    public apa(): Stringable {
        return new Stringable(Str.apa(this.value));
    }

    /**
     * Append the given values to the string.
     */
    public append(...values: string[]): Stringable {
        return new Stringable(this.value + values.join(''));
    }

    /**
     * Get the trailing name component of the path.
     */
    public basename(suffix: string = ''): Stringable {
        return new Stringable(basename(this.value, suffix));
    }

    /**
     * Get the portion of a string before the first occurrence of a given value.
     */
    public before(search: string): Stringable {
        return new Stringable(Str.before(this.value, search));
    }

    /**
     * Get the portion of a string before the last occurrence of a given value.
     */
    public beforeLast(search: string): Stringable {
        return new Stringable(Str.beforeLast(this.value, search));
    }

    /**
     * Get the portion of a string between two given values.
     */
    public between(from: string, to: string): Stringable {
        return new Stringable(Str.between(this.value, from, to));
    }

    /**
     * Get the smallest possible portion of a string between two given values.
     */
    public betweenFirst(from: string, to: string): Stringable {
        return new Stringable(Str.betweenFirst(this.value, from, to));
    }

    /**
     * Convert a value to camel case.
     */
    public camel(): Stringable {
        return new Stringable(Str.camel(this.value));
    }

    /**
     * Get the character at the specified index.
     */
    public charAt(index: number): string | false {
        return Str.charAt(this.value, index);
    }

    /**
     * Remove the given string if it exists at the end of the current string.
     */
    public chopEnd(needle: string | string[]): Stringable {
        return new Stringable(Str.chopEnd(this.value, needle));
    }

    /**
     * Remove the given string if it exists at the start of the current string.
     */
    public chopStart(needle: string | string[]): Stringable {
        return new Stringable(Str.chopStart(this.value, needle));
    }

    /**
     * Get the basename of the class path.
     */

    /**
     * Determine if a given string contains a given substring.
     */
    public contains(needles: string | string[], ignoreCase: boolean = false): boolean {
        return Str.contains(this.value, needles, ignoreCase);
    }

    /**
     * Determine if a given string contains all array values.
     */
    public containsAll(needles: string[], ignoreCase: boolean = false): boolean {
        return Str.containsAll(this.value, needles, ignoreCase);
    }

    /**
     * Replace consecutive instances of a given character with a single character.
     */
    public deduplicate(characters: string | string[] = ' '): Stringable {
        return new Stringable(Str.deduplicate(this.value, characters)?.toString() ?? undefined);
    }

    /**
     * Get the parent directory's path.
     */
    public dirname(levels: number = 1): Stringable {
        return new Stringable(dirname(this.value, levels));
    }

    /**
     * Determine if a given string doesn't end with a given substring.
     */
    public doesntEndWith(needles: string | string[]): boolean {
        return Str.doesntEndWith(this.value, needles);
    }

    /**
     * Determine if a given string doesn't start with a given substring.
     */
    public doesntStartWith(needles: string | string[]): boolean {
        return Str.doesntStartWith(this.value, needles);
    }

    /**
     * Determine if a given string ends with a given substring.
     */
    public endsWith(needles: string | string[]): boolean {
        return Str.endsWith(this.value, needles);
    }

    /**
     * Determine if the string is an exact match with the given value.
     */
    public exactly(value: Stringable | string): boolean {
        if (value instanceof Stringable) {
            value = value.toString();
        }

        return this.value === value;
    }

    /**
     * Extracts an excerpt from text that matches the first instance of a phrase.
     */
    public excerpt(phrase: string = '', options: { radius?: number; omission?: string } = {}): string | null {
        return Str.excerpt(this.value, phrase, options);
    }

    /**
     * Explode the string into a collection.
     */
    public explode(delimiter: string, limit: number = Number.MAX_SAFE_INTEGER): string[] {
        return explode(delimiter, this.value, limit);
    }

    /**
     * Cap a string with a single instance of a given value.
     */
    public finish(cap: string): Stringable {
        return new Stringable(Str.finish(this.value, cap));
    }

    /**
     * Decode the Base64 encoded string.
     */
    public fromBase64(): Stringable {
        return new Stringable(String(Str.fromBase64(this.value)));
    }

    /**
     * Hash the string using the given algorithm.
     */
    public async hash(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512'): Promise<Stringable> {
        return new Stringable(await hash(algorithm, this.value));
    }

    /**
     * Convert the given string to proper case for each word.
     */
    public headline(): Stringable {
        return new Stringable(Str.headline(this.value));
    }

    /**
     * Determine if a given string matches a given pattern.
     */
    public is(pattern: string | string[], ignoreCase: boolean = false): boolean {
        return Str.is(pattern, this.value, ignoreCase);
    }

    /**
     * Determine if the given string is empty.
     */
    public isEmpty(): boolean {
        return this.value === '';
    }

    /**
     * Determine if a given string is valid JSON.
     */
    public isJson(): boolean {
        return Str.isJson(this.value);
    }

    /**
     * Determine if a given string matches a given pattern.
     */
    public isMatch(pattern: string | string[] | RegExp | RegExp[]): boolean {
        return Str.isMatch(pattern, this.value);
    }

    /**
     * Determine if the given string is not empty.
     */
    public isNotEmpty(): boolean {
        return !this.isEmpty();
    }

    /**
     * Determine if a given value is a valid URL.
     */
    public isUrl(protocols: string[] = []): boolean {
        return Str.isUrl(this.value, protocols);
    }

    /**
     * Convert a string to kebab case.
     */
    public kebab(): Stringable {
        return new Stringable(Str.kebab(this.value));
    }

    /**
     * Make a string's first character lowercase.
     */
    public lcfirst(): Stringable {
        return new Stringable(Str.lcfirst(this.value));
    }

    /**
     * Return the length of the given string.
     */
    public length(): number {
        return Str.length(this.value);
    }

    /**
     * Limit the number of characters in a string.
     */
    public limit(limit: number = 100, end: string = '...', preserveWords: boolean = false): Stringable {
        return new Stringable(Str.limit(this.value, limit, end, preserveWords));
    }

    /**
     * Convert the given string to lower-case.
     */
    public lower(): Stringable {
        return new Stringable(Str.lower(this.value));
    }

    /**
     * Left trim the string of the given characters.
     */
    public ltrim(characters?: string): Stringable {
        return new Stringable(Str.ltrim(this.value, characters));
    }

    /**
     * Masks a portion of a string with a repeated character.
     */
    public mask(character: string, index: number, length?: number): Stringable {
        return new Stringable(Str.mask(this.value, character, index, length));
    }

    /**
     * Get the string matching the given pattern.
     */
    public match(pattern: string): Stringable {
        return new Stringable(Str.match(pattern, this.value));
    }

    /**
     * Get the string matching the given pattern.
     */
    public matchAll(pattern: string): string[] {
        return Str.matchAll(pattern, this.value);
    }

    /**
     * Append a new line to the string.
     */
    public newLine(count: number = 1): Stringable {
        return this.append('\n'.repeat(count));
    }

    /**
     * Pad both sides of the string with another.
     */
    public padBoth(length: number, pad: string = ' '): Stringable {
        return new Stringable(Str.padBoth(this.value, length, pad));
    }

    /**
     * Pad the left side of the string with another.
     */
    public padLeft(length: number, pad: string = ' '): Stringable {
        return new Stringable(Str.padLeft(this.value, length, pad));
    }

    /**
     * Pad the right side of the string with another.
     */
    public padRight(length: number, pad: string = ' '): Stringable {
        return new Stringable(Str.padRight(this.value, length, pad));
    }

    /**
     * Call the given callback and return a new string.
     */
    public pipe(callback: (instance: Stringable) => string): Stringable {
        return new Stringable(callback(this));
    }

    /**
     * Find the multi-byte safe position of the first occurrence of the given substring.
     */
    public position(needle: string, offset: number = 0): number | false {
        return Str.position(this.value, needle, offset);
    }

    /**
     * Prepend the given values to the string.
     */
    public prepend(...values: string[]): Stringable {
        return new Stringable(values.join('') + this.value);
    }

    /**
     * Remove any occurrence of the given string in the subject.
     */
    public remove(search: string | string[], caseSensitive: boolean = true): Stringable {
        return new Stringable(Str.remove(search, this.value, caseSensitive) as any);
    }

    /**
     * Repeat the string.
     */
    public repeat(times: number): Stringable {
        return new Stringable(Str.repeat(this.value, times));
    }

    /**
     * Replace the given value in the given string.
     */
    public replace(search: string | string[], replace: string | string[], caseSensitive: boolean = true): Stringable {
        return new Stringable(Str.replace(search, replace, this.value, caseSensitive).toString());
    }

    /**
     * Replace a given value in the string sequentially with an array.
     */
    public replaceArray(search: string, replace: string[]): Stringable {
        return new Stringable(Str.replaceArray(search, replace, this.value));
    }

    /**
     * Replace the last occurrence of a given value if it appears at the end of the string.
     */
    public replaceEnd(search: string, replace: string): Stringable {
        return new Stringable(Str.replaceEnd(search, replace, this.value));
    }

    /**
     * Replace the first occurrence of a given value in the string.
     */
    public replaceFirst(search: string, replace: string): Stringable {
        return new Stringable(Str.replaceFirst(search, replace, this.value));
    }

    /**
     * Replace the last occurrence of a given value in the string.
     */
    public replaceLast(search: string, replace: string): Stringable {
        return new Stringable(Str.replaceLast(search, replace, this.value));
    }

    /**
     * Replace the patterns matching the given regular expression.
     */
    public replaceMatches(
        pattern: string | string[],
        replace: ((match: string[]) => string) | string | string[],
        limit: number = -1,
    ): Stringable {
        return new Stringable(Str.replaceMatches(pattern, replace, this.value, limit)?.toString() ?? undefined);
    }

    /**
     * Replace the first occurrence of the given value if it appears at the start of the string.
     */
    public replaceStart(search: string, replace: string): Stringable {
        return new Stringable(Str.replaceStart(search, replace, this.value));
    }

    /**
     * Reverse the string.
     */
    public reverse(): Stringable {
        return new Stringable(Str.reverse(this.value));
    }

    /**
     * Right trim the string of the given characters.
     */
    public rtrim(characters?: string): Stringable {
        return new Stringable(Str.rtrim(this.value, characters));
    }

    /**
     * Parse input from a string to a collection, according to a format.
     */
    public scan(format: string): any[] {
        return sscanf(this.value, format) ?? [];
    }

    /**
     * Convert a string to snake case.
     */
    public snake(delimiter: string = '_'): Stringable {
        return new Stringable(Str.snake(this.value, delimiter));
    }

    /**
     * Split a string using a regular expression or by length.
     */
    public split(
        pattern: string | number,
        limit: number = -1,
        flags: (0 | 1 | 2 | 4)[] = [0],
    ): (string | number)[][] | string[] {
        if (filter_var(pattern, FILTER_VALIDATE_INT) !== false) {
            return mb_str_split(this.value, pattern as number);
        }

        return preg_split(pattern as string, this.value, limit, flags);
    }

    /**
     * Remove all "extra" blank space from the given string.
     */
    public squish(): Stringable {
        return new Stringable(Str.squish(this.value));
    }

    /**
     * Begin a string with a single instance of a given value.
     */
    public start(prefix: string): Stringable {
        return new Stringable(Str.start(this.value, prefix));
    }

    /**
     * Determine if a given string starts with a given substring.
     */
    public startsWith(needles: string | string[]): boolean {
        return Str.startsWith(this.value, needles);
    }

    /**
     * Strip HTML and PHP tags from the given string.
     */
    public stripTags(allowedTags: string[] | string = ''): Stringable {
        return new Stringable(strip_tags(this.value, allowedTags));
    }

    /**
     * Convert a value to studly caps case.
     */
    public studly(): Stringable {
        return new Stringable(Str.studly(this.value));
    }

    /**
     * Returns the portion of the string specified by the start and length parameters.
     */
    public substr(start: number, length?: number): Stringable {
        return new Stringable(Str.substr(this.value, start, length));
    }

    /**
     * Returns the number of substring occurrences.
     */
    public substrCount(needle: string, offset: number = 0, length?: number): number {
        return Str.substrCount(this.value, needle, offset, length);
    }

    /**
     * Replace text within a portion of a string.
     */
    public substrReplace(replace: string, offset: number = 0, length?: number): Stringable {
        return new Stringable(Str.substrReplace(this.value, replace, offset, length));
    }

    /**
     * Swap multiple keywords in a string with other keywords.
     */
    public swap(map: { [key: string]: string }): Stringable {
        return new Stringable(Str.swap(map, this.value));
    }

    /**
     * Take the first or last {limit} characters.
     */
    public take(limit: number): Stringable {
        return new Stringable(Str.take(this.value, limit));
    }

    /**
     * Determine if the string matches the given pattern.
     */
    public test(pattern: string | string[] | RegExp | RegExp[]): boolean {
        return this.isMatch(pattern);
    }

    /**
     * Convert the given string to proper case.
     */
    public title(): Stringable {
        return new Stringable(Str.title(this.value));
    }

    /**
     * Convert the string to Base64 encoding.
     */
    public toBase64(): Stringable {
        return new Stringable(Str.toBase64(this.value));
    }

    /**
     * Get the underlying string value.
     */
    public toString(): string {
        return this.value;
    }

    /**
     * Trim the string of the given characters.
     */
    public trim(characters?: string): Stringable {
        return new Stringable(Str.trim(this.value, characters));
    }

    /**
     * Make a string's first character uppercase.
     */
    public ucfirst(): Stringable {
        return new Stringable(Str.ucfirst(this.value));
    }

    /**
     * Split a string by uppercase characters.
     */
    public ucsplit(): (string | (string | number)[])[] | false {
        return Str.ucsplit(this.value);
    }

    /**
     * Unwrap the string with the given strings.
     */
    public unwrap(before: string, after?: string): Stringable {
        return new Stringable(Str.unwrap(this.value, before, after));
    }

    /**
     * Convert the given string to upper-case.
     */
    public upper(): Stringable {
        return new Stringable(Str.upper(this.value));
    }

    /**
     * Get the number of words a string contains.
     */
    public wordCount(characters?: string): number {
        return Str.wordCount(this.value, characters);
    }

    /**
     * Wrap a string to a given number of characters.
     */
    public wordWrap(characters: number = 75, breakStr: string = '\n', cutLongWords: boolean = false): Stringable {
        return new Stringable(Str.wordWrap(this.value, characters, breakStr, cutLongWords));
    }

    /**
     * Limit the number of words in a string.
     */
    public words(words: number = 100, end: string = '...'): Stringable {
        return new Stringable(Str.words(this.value, words, end));
    }

    /**
     * Wrap the string with the given strings.
     */
    public wrap(before: string, after?: string): Stringable {
        return new Stringable(Str.wrap(this.value, before, after));
    }

    /**
     * Execute the given callback if the string contains a given substring.
     */
    public whenContains(
        needles: string | string[],
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(this.contains(needles), callback, defaultCallback);
    }

    /**
     * Execute the given callback if the string contains all array values.
     */
    public whenContainsAll(
        needles: string[],
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(this.containsAll(needles), callback, defaultCallback);
    }

    /**
     * Execute the given callback if the string doesn't end with a given substring.
     */
    public whenDoesntEndWith(
        needles: string | string[],
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(this.doesntEndWith(needles), callback, defaultCallback);
    }

    /**
     * Execute the given callback if the string doesn't start with a given substring.
     */
    public whenDoesntStartWith(
        needles: string | string[],
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(this.doesntStartWith(needles), callback, defaultCallback);
    }

    /**
     * Execute the given callback if the string is empty.
     */
    public whenEmpty(
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(this.isEmpty(), callback, defaultCallback);
    }

    /**
     * Execute the given callback if the string ends with a given substring.
     */
    public whenEndsWith(
        needles: string | string[],
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(this.endsWith(needles), callback, defaultCallback);
    }

    /**
     * Execute the given callback if the string is an exact match with the given value.
     */
    public whenExactly(
        value: string,
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(this.exactly(value), callback, defaultCallback);
    }

    /**
     * Execute the given callback if the string matches a given pattern.
     */
    public whenIs(
        pattern: string | string[],
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(this.is(pattern), callback, defaultCallback);
    }

    /**
     * Execute the given callback if the string is not empty.
     */
    public whenNotEmpty(
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(this.isNotEmpty(), callback, defaultCallback);
    }

    /**
     * Execute the given callback if the string is not an exact match with the given value.
     */
    public whenNotExactly(
        value: string,
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(!this.exactly(value), callback, defaultCallback);
    }

    /**
     * Execute the given callback if the string starts with a given substring.
     */
    public whenStartsWith(
        needles: string | string[],
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(this.startsWith(needles), callback, defaultCallback);
    }

    /**
     * Execute the given callback if the string matches the given pattern.
     */
    public whenTest(
        pattern: string | RegExp,
        callback?: (self: Stringable, val: any) => Stringable,
        defaultCallback?: (self: Stringable, val: any) => Stringable,
    ): Stringable {
        return this.when(this.test(pattern), callback, defaultCallback);
    }
}
