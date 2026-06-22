import { type Route as RouteType } from '@std/http/unstable-route';
import { ChassisRequest } from './http/ChassisRequest.ts';
import { ChassisResponse } from './http/ChassisResponse.ts';

export type Abstract = string | symbol | Class;

export type Class<T = unknown> = {
    // deno-lint-ignore no-explicit-any
    new (...args: any[]): T;
};

export type ChassisRouteType = Omit<RouteType, 'handler'> & {
    handler: (
        request: Request,
        params?: URLPatternResult,
        info?: Deno.ServeHandlerInfo,
    ) => Promise<Response | ChassisResponse>;
};

export type ControllerHandler = [Class, string];

export type ResponseHandler = (request: ChassisRequest) => Response | ChassisResponse;

export type AsyncResponseHandler = (request: ChassisRequest) => Promise<Response | ChassisResponse>;

export type RouteHandler = ControllerHandler | ResponseHandler | AsyncResponseHandler;
