import Queue from './Queue.ts';

export const Factory = Symbol('Factory');

export interface Factory {
    /**
     * Resolve a queue connection instance.
     */
    connection(name?: string): Queue;
}
