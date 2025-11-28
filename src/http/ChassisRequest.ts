import { filled, Str } from '@balboacodes/laravel-helpers';
import { App } from '../facades/App.ts';
import { RouteRegistrar } from '../routing/RouteRegistrar.ts';

export class ChassisRequest extends Request {
    /**
     * Create a new Chassis request.
     */
    public constructor(
        request: Request,
        protected params: URLPatternResult | undefined,
        protected serverHandlerInfo: Deno.ServeHandlerInfo | undefined,
    ) {
        super(request);
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
     * Get the request's path.
     */
    public path(): string {
        return new URL(this.url).pathname;
    }

    /**
     * Determine if the incoming request path matches a given pattern.
     */
    public is(pattern: string): boolean {
        return Str.is(pattern, this.path());
    }

    /**
     * Determine if the incoming request has matched a named route.
     */
    public routeIs(pattern: string): boolean {
        const routeNames = App.resolve<RouteRegistrar>('chassis.route-registrar').getRoutes();
        const matchedNames = [];

        for (const routeName of routeNames.keys()) {
            if (Str.is(pattern, String(routeName))) {
                matchedNames.push(routeName);
            }
        }

        for (const name of matchedNames) {
            const matches = routeNames.get(name)?.pattern.test(this.url);

            if (matches) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the IP address of the client that made the request. It will check the X-Forwarded-For and Forwarded headers
     * before falling back to the actual IP that sent the request.
     */
    public ip(): string | undefined {
        return this.headers.get('X-Forwarded-For') ??
            this.headers.get('Forwarded') ??
            // @ts-ignore:
            this.serverHandlerInfo?.remoteAddr.hostname;
    }

    /**
     * Determine if all of the specified keys are present on the request.
     */
    public async has(keys: string[]): Promise<boolean> {
        const all = await this.all();

        for (const key of keys) {
            if (!Object.hasOwn(all, key)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Determine if any of the specified keys are present on the request.
     */
    public async hasAny(keys: string[]): Promise<boolean> {
        const all = await this.all();

        for (const key of keys) {
            if (Object.hasOwn(all, key)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if a value is present on the request and is not an empty.
     */
    public async filled(key: string): Promise<boolean> {
        const all = await this.all();

        return filled(all[key]);
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
