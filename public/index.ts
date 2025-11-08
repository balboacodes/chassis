import 'reflect-metadata';
import Application from '../src/framework/Application.js';
import AppServiceProvider from '../app/providers/AppServiceProvider.js';

(await new Application().withProviders([AppServiceProvider]).boot()).listen(3000);
