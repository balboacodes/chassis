import type { NextFunction, Request, Response } from 'express';
import Container from './Container.ts';

export type Class<T = any> = {
    new (...args: any[]): T;
    [key: string]: any;
};

export type Factory<T = any> = (container?: Container) => T;

export type RouteDefinition = (path: string, handler: Class | RouteHandler | string, method?: string) => void;

export type RouteHandler = (req: Request, res: Response, ...params: any[]) => any;

export type ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => any;
