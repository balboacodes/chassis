import { Request as ExpressRequest, Response } from 'express';
import Container from './Container.ts';
import Stringable from './support/Stringable.ts';

export type Class<T = any> = {
    new (...args: any[]): T;
    [key: string]: any;
};

export type Factory<T = any> = (container?: Container) => T;

export interface Request extends ExpressRequest {
    all: () => {};
    input: (key: string, defaultValue?: any) => any;
    string: (key: string, defaultValue?: any) => Stringable;
    integer: (key: string, defaultValue?: number) => number;
    boolean: (key: string, defaultValue?: boolean) => boolean;
    date: (key: string) => Date | null;
}

export type ResourceActions = 'index' | 'create' | 'store' | 'show' | 'edit' | 'update' | 'destroy';

export type RouteDefinition = (path: string, handler: Class | RouteHandler | string, method?: string) => void;

export type RouteHandler = (req: Request, res: Response, ...params: any[]) => any;
