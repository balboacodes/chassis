export class ChassisRequest extends Request {
    /**
     * Create a new Chassis request.
     */
    public constructor(req: Request, protected params?: URLPatternResult) {
        super(req);
    }

    /**
     * Get all path parameters, search parameters, form data, and JSON data from the request.
     */
    public async all(): Promise<Record<string, unknown>> {
        return {
            ...this.getPathParams(),
            ...this.query(),
            ...Object.fromEntries((await this.getFormData())?.entries() ?? []),
            ...await this.getJsonData() ?? {},
        };
    }

    /**
     * Get a specific piece of data from the request.
     */
    public async input(key: string, defaultValue?: unknown): Promise<unknown> {
        const all = await this.all();

        return all[key] ?? defaultValue;
    }

    /**
     * Get the search parameters from the request's URL.
     */
    public query(): Record<string, string>;
    public query(key: string): string | undefined;
    public query<T>(key: string, defaultValue: T): string | T;
    public query<T = unknown>(
        key?: string,
        defaultValue?: T,
    ): Record<string, string> | string | undefined | T {
        const entries = Object.fromEntries(new URL(this.url).searchParams.entries());

        return key === undefined ? entries : (entries[key] ?? defaultValue);
    }

    /**
     * Get the path parameters from the request's URL.
     */
    protected getPathParams(): Record<string, string | undefined> | undefined {
        return this.params?.pathname.groups;
    }

    /**
     * Get the form data from the request.
     */
    protected async getFormData(): Promise<FormData | undefined> {
        try {
            return await this.formData();
        } catch {
            return undefined;
        }
    }

    /**
     * Get the JSON data from the request as an object.
     */
    protected async getJsonData(): Promise<Record<string, unknown> | undefined> {
        try {
            return await this.json();
        } catch {
            return undefined;
        }
    }
}
