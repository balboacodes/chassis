import { ChassisRequest } from './ChassisRequest.ts';

export type Abstract = string | symbol | Class;

export type Class<T = unknown> = {
    // deno-lint-ignore no-explicit-any
    new (...args: any[]): T;
};

export type RouteStackHandler = (request: ChassisRequest) => Promise<Response>;

export type RouteHandler = [Class, string] | ((request: ChassisRequest) => Response | Promise<Response>);
