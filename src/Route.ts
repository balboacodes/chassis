import { type Route as RouteType } from '@std/http/unstable-route';
import { ChassisRequest } from './ChassisRequest.ts';
import { Class } from './types.ts';

export type RouteHandler = [Class, string] | ((request: Request) => Response | Promise<Response>);

export class Route {
    public static routes: RouteType[] = [];

    public static get(path: string, handler: RouteHandler): void {
        Route.routes.push({
            method: 'GET',
            pattern: new URLPattern({ pathname: path }),
            handler: async (req, params, _info) => {
                const chassisRequest = new ChassisRequest(req, params);

                if (Array.isArray(handler)) {
                    // @ts-ignore: handler[1] is a method on the controller
                    return await new handler[0]()[handler[1]](chassisRequest);
                }

                return await handler(chassisRequest);
            },
        });
    }
}
