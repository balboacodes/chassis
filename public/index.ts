import 'reflect-metadata';
import Application from '../src/framework/Application.js';

(await new Application().boot()).listen();
