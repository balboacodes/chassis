import { Response } from 'express';
import Container from './Container.ts';
import Request from './Request.ts';

export type Class<T = any> = {
    new (...args: any[]): T;
    [key: string]: any;
};

export type Factory<T = any> = (container?: Container) => T;

export type ResourceActions = 'index' | 'create' | 'store' | 'show' | 'edit' | 'update' | 'destroy';

export type RouteDefinition = (path: string, handler: Class | RouteHandler | string, method?: string) => void;

export type RouteHandler = (req: Request, res: Response, ...params: any[]) => any;
