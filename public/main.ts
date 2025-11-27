import { App } from '../src/App.ts';

await new App().withMiddleware([]).start();
