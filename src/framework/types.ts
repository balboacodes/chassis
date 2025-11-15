import { Request as ExpressRequest, NextFunction, Response } from 'express';
import Container from './Container.ts';
import Stringable from './support/Stringable.ts';

export type Class<T = any> = {
    new (...args: any[]): T;
    [key: string]: any;
};

export type Factory<T = any> = (container?: Container) => T;

export type Request = ExpressRequest & {
    all: () => {} | undefined;
    input: (key: string, defaultValue?: any) => any | undefined;
    string: (key: string, defaultValue?: any) => Stringable;
    integer: (key: string, defaultValue?: any) => number;
    boolean: (key: string, defaultValue?: any) => boolean;
    date: (key: string) => Date | null;
};

export type ResourceActions = 'index' | 'create' | 'store' | 'show' | 'edit' | 'update' | 'destroy';

export type RouteDefinition = (path: string, handler: Class | RouteHandler | string, method?: string) => void;

export type RouteErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => any;

export type RouteHandler = (req: Request, res: Response, ...params: any[]) => any;
