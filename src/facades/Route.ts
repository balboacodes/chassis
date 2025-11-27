import { Route as RealRoute } from '../routing/Route.ts';
import { Facade } from './Facade.ts';

export const Route = Facade.create<RealRoute>('chassis.route');
