import { getCookies } from '@std/http/cookie';
import { parseSignedCookie, verifySignedCookie } from '@std/http/unstable-signed-cookie';
import { Config } from '../facades/Config.ts';
import { parseAppKey } from '../helpers.ts';
import { ChassisRequest } from './ChassisRequest.ts';

export class Redirect {
    /**
     * Create a new redirect instance.
     */
    public constructor(
        /**
         * The current request.
         */
        protected request: ChassisRequest,
    ) {}

    /**
     * Redirect to a given path.
     */
    public to(path: string): Response {
        const url = Config.get('app.url');
        const port = Config.get('app.port');

        return Response.redirect(new URL(path, `${url}:${port}`));
    }

    /**
     * Redirect back to the previous URL.
     */
    public async back(): Promise<Response> {
        const key = await parseAppKey();
        const previousUrl = getCookies(this.request.headers)['previous-url'];

        if (previousUrl === undefined) throw new Error('Previous URL not set');
        if (!await verifySignedCookie(previousUrl, key)) throw new Error('Previous URL could not be verified');

        return Response.redirect(parseSignedCookie(previousUrl));
    }
}
