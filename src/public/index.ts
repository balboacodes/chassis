// prettier-ignore
import 'reflect-metadata/lite';
// prettier-ignore
import LogTime from '../app/http/middleware/LogTime.ts';
import { App } from '../framework/index.ts';

await new App().withMiddleware([LogTime]).start();
