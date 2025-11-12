import type { NextFunction, Request, Response } from 'express';
import Container from './Container.ts';

export type Class<T = any> = {
    new (...args: any[]): T;
    [key: string]: any;
};

export type Factory<T = any> = (container: Container) => T;

export type RouteHandler = (req: Request, res: Response, next: NextFunction) => any;
