import { Arr, Collection } from "@balboacodes/laravel-helpers";

export class Repository {
  // use Macroable;

  /**
   * Create a new configuration repository.
   */
  public constructor(
    /**
     * All of the configuration items.
     */
    protected items: Record<string, unknown> = {},
  ) {}

  /**
   * Determine if the given configuration value exists.
   */
  public has(key: string): boolean {
    return Arr.has(this.items, key);
  }

  /**
   * Get the specified configuration value.
   */
  public get<T = unknown>(key: string[] | string, defaultValue?: unknown): T {
    if (Array.isArray(key)) {
      return this.getMany(key) as T;
    }

    return Arr.get(this.items, key, defaultValue);
  }

  /**
   * Get many configuration values.
   */
  public getMany(
    keys: Record<string, unknown> | string[],
  ): Record<string, unknown> {
    const config: Record<string, unknown> = {};

    for (let [key, defaultValue] of Object.entries(keys)) {
      // if key is numeric
      if (!Number.isNaN(Number(key))) {
        [key, defaultValue] = [defaultValue as string, null];
      }

      config[key] = Arr.get(this.items, key, defaultValue);
    }

    return config;
  }

  /**
   * Get the specified string configuration value.
   *
   * @throws {TypeError} if value at `key` is not a string.
   */
  public string(
    key: string,
    defaultValue?: (() => string | undefined) | string,
  ): string {
    const value = this.get(key, defaultValue);

    if (typeof value !== "string") {
      throw new TypeError(
        `Configuration value for key [${key}] must be a string, ${typeof value} given.`,
      );
    }

    return value;
  }

  /**
   * Get the specified integer configuration value.
   *
   * @throws {TypeError} if value at `key` is not a integer.
   */
  public integer(
    key: string,
    defaultValue?: (() => number | undefined) | number,
  ): number {
    const value = this.get(key, defaultValue);

    if (!Number.isInteger(value)) {
      throw new TypeError(
        `Configuration value for key [${key}] must be an integer, ${typeof value} given.`,
      );
    }

    return value as number;
  }

  /**
   * Get the specified float configuration value.
   *
   * @throws {TypeError} if value at `key` is not a float.
   */
  public float(
    key: string,
    defaultValue?: (() => number | undefined) | number,
  ): number {
    const value = this.get(key, defaultValue);

    if (typeof value === "number" && Number.isInteger(value)) {
      throw new TypeError(
        `Configuration value for key [${key}] must be a float, ${typeof value} given.`,
      );
    }

    return value as number;
  }

  /**
   * Get the specified boolean configuration value.
   *
   * @throws {TypeError} if value at `key` is not a boolean.
   */
  public boolean(
    key: string,
    defaultValue?: (() => boolean | undefined) | boolean,
  ): boolean {
    const value = this.get(key, defaultValue);

    if (typeof value !== "boolean") {
      throw new TypeError(
        `Configuration value for key [${key}] must be a boolean, ${typeof value} given.`,
      );
    }

    return value;
  }

  /**
   * Get the specified array configuration value.
   *
   * @throws {TypeError} if value at `key` is not a array.
   */
  public array(
    key: string,
    defaultValue?: (() => unknown[] | undefined) | unknown[],
  ): unknown[] {
    const value = this.get(key, defaultValue);

    if (!Array.isArray(value)) {
      throw new TypeError(
        `Configuration value for key [${key}] must be an array, ${typeof value} given.`,
      );
    }

    return value;
  }

  /**
   * Get the specified array configuration value as a collection.
   */
  public collection(
    key: string,
    defaultValue?: (() => unknown[] | undefined) | unknown[],
  ): Collection<number | string, unknown> {
    return new Collection(this.array(key, defaultValue));
  }

  /**
   * Set a given configuration value.
   */
  public set(
    key: Record<string, unknown> | string,
    value: unknown = null,
  ): void {
    const keys = typeof key === "string" ? { [key]: value } : key;

    for (const [key, value] of Object.entries(keys)) {
      Arr.set(this.items, key, value);
    }
  }

  /**
   * Prepend a value onto an array configuration value.
   */
  public prepend(key: string, value: unknown): void {
    const array = this.get(key, []) as unknown[];

    array.unshift(value);

    this.set(key, array);
  }

  /**
   * Push a value onto an array configuration value.
   */
  public push(key: string, value: unknown): void {
    const array = this.get(key, []) as unknown[];

    array.push(value);

    this.set(key, array);
  }

  /**
   * Get all of the configuration items for the application.
   */
  public all(): Record<string, unknown> {
    return this.items;
  }
}
