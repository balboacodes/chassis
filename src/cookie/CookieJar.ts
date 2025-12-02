import { Arr } from '@balboacodes/laravel-helpers';
import { use } from '../decorators/use.ts';
import { Cookie } from '../symfony/Cookie.ts';
import { InteractsWithTime } from '../traits/InteractsWithTime.ts';

export interface CookieJar extends InteractsWithTime {}

@use(InteractsWithTime)
export class CookieJar {
    // use Macroable;

    /**
     * The default path (if specified).
     */
    protected path: string | undefined = '/';

    /**
     * The default domain (if specified).
     */
    protected domain?: string;

    /**
     * The default secure setting (defaults to undefined).
     */
    protected secure?: boolean;

    /**
     * The default SameSite option (defaults to lax).
     */
    protected sameSite: string | undefined = 'lax';

    /**
     * All of the cookies queued for sending.
     */
    protected $queued: Record<string, Record<string, Cookie>> = {};

    /**
     * Create a new cookie instance.
     */
    public make(
        name: string,
        value?: string,
        minutes: number = 0,
        path?: string,
        domain?: string,
        secure?: boolean,
        httpOnly: boolean = true,
        raw: boolean = false,
        sameSite?: string,
    ): Cookie {
        [path, domain, secure, sameSite] = this.getPathAndDomain(path, domain, secure, sameSite);

        const time = (minutes == 0) ? 0 : this.availableAt(minutes * 60);

        return new Cookie(name, value, time, path, domain, secure, httpOnly, raw, sameSite);
    }

    /**
     * Create a cookie that lasts "forever" (400 days).
     */
    public forever(
        name: string,
        value: string,
        path?: string,
        domain?: string,
        secure?: boolean,
        httpOnly: boolean = true,
        raw: boolean = false,
        sameSite?: string,
    ): Cookie {
        return this.make(name, value, 576000, path, domain, secure, httpOnly, raw, sameSite);
    }

    /**
     * Expire the given cookie.
     */
    public forget(name: string, path?: string, domain?: string): Cookie {
        return this.make(name, undefined, -2628000, path, domain);
    }

    /**
     * Determine if a cookie has been queued.
     */
    public hasQueued(key: string, path?: string): boolean {
        return this.queued(key, undefined, path) !== undefined;
    }

    /**
     * Get a queued cookie instance.
     */
    public queued(key: string, defaultValue?: unknown, path?: string): Cookie | undefined {
        const queued = Arr.get(this.$queued, key, defaultValue);

        if (path === undefined) {
            return Arr.last(queued, undefined, defaultValue) as Cookie | undefined;
        }

        return Arr.get(queued, path, defaultValue);
    }

    /**
     * Queue a cookie to send with the next response.
     */
    public queue(...parameters: unknown[]): void {
        let cookie;

        if (parameters[0] !== undefined && parameters[0] instanceof Cookie) {
            cookie = parameters[0];
        } else {
            // @ts-ignore:
            cookie = this.make(...parameters);
        }

        if (this.$queued[cookie.getName()] !== undefined) {
            this.$queued[cookie.getName()] = {};
        }

        this.$queued[cookie.getName()][cookie.getPath()] = cookie;
    }

    /**
     * Queue a cookie to expire with the next response.
     */
    public expire(name: string, path?: string, domain?: string): void {
        this.queue(this.forget(name, path, domain));
    }

    /**
     * Remove a cookie from the queue.
     */
    public unqueue(name: string, path?: string): void {
        if (path === undefined) {
            delete this.$queued[name];

            return;
        }

        delete this.$queued[name][path];

        if (Object.values(this.$queued[name]).length === 0) {
            delete this.$queued[name];
        }
    }

    /**
     * Get the path and domain, or the default values.
     */
    protected getPathAndDomain(
        path?: string,
        domain?: string,
        secure?: boolean,
        sameSite?: string,
    ): [string | undefined, string | undefined, boolean | undefined, string | undefined] {
        return [
            path ? path : this.path,
            domain ? domain : this.domain,
            typeof secure === 'boolean' ? secure : this.secure,
            sameSite ? sameSite : this.sameSite,
        ];
    }

    /**
     * Set the default path and domain for the jar.
     */
    public setDefaultPathAndDomain(path: string, domain?: string, secure: boolean = false, sameSite?: string): this {
        [this.path, this.domain, this.secure, this.sameSite] = [path, domain, secure, sameSite];

        return this;
    }

    /**
     * Get the cookies which have been queued for the next request.
     */
    public getQueuedCookies(): Record<string, Cookie> {
        return Arr.flatten(this.$queued) as Record<string, Cookie>;
    }

    /**
     * Flush the cookies which have been queued for the next request.
     */
    public flushQueuedCookies(): this {
        this.$queued = {};

        return this;
    }
}
