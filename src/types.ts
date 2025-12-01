import { ChassisRequest } from './http/ChassisRequest.ts';
import { ChassisResponse } from './http/ChassisResponse.ts';

export type Abstract = string | symbol | Class;

export type Class<T = unknown> = {
    // deno-lint-ignore no-explicit-any
    new (...args: any[]): T;
};

export type ControllerHandler = [Class, string];

export type ResponseHandler = (request: ChassisRequest) => Response;

export type AsyncResponseHandler = (request: ChassisRequest) => Promise<Response> | Promise<ChassisResponse>;

export type RouteHandler = ControllerHandler | ResponseHandler | AsyncResponseHandler;
