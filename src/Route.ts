import { type Route as RouteType } from '@std/http/unstable-route';

export class Route {
    public static routes: RouteType[] = [];

    public static get(
        path: string,
        handler: (request: Request, ...params: unknown[]) => Response,
    ): void {
        Route.routes.push({
            method: 'GET',
            pattern: new URLPattern({ pathname: path }),
            handler: (req, params, _info) => {
                const pathParams = Object.values(params?.pathname.groups ?? {});
                const searchParams = new URLSearchParams(params?.search.input).values().toArray();
                return handler(req, ...pathParams, ...searchParams);
            },
        });
    }
}
