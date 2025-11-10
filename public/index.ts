import 'reflect-metadata';
import LogAppName from '../app/http/middleware/LogAppName.js';
import App from '../src/framework/App.js';

await new App().withMiddleware(LogAppName).start();
