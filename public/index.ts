import 'reflect-metadata';
import Application from '../src/framework/Application.js';

(await new Application().withProviders().boot()).listen(3000);
