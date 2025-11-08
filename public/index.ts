import 'reflect-metadata';
import { Application } from '../src/framework/Application';

(await Application.create().withProviders().boot()).listen(3000);
