import ProcessorInterface from '../monolog/ProcessorInterface.ts';

export const ContextLogProcessor = Symbol('ContextLogProcessor');

export interface ContextLogProcessor extends ProcessorInterface {}
