import { Config as RealConfig } from '../Config.ts';
import { Facade } from './Facade.ts';

export const Config = Facade.create<RealConfig>('chassis.config');
