import { array_push, array_reduce, array_reverse } from '@balboacodes/php-utils';
import { use } from './decorators/use';
import { Conditionable } from './traits/Conditionable';

export interface Pipeline extends Conditionable {}

@use(Conditionable)
export class Pipeline {
    /**
     * The final callback to be executed after the pipeline ends regardless of the outcome.
     */
    protected finallyFn?: (passable?: any) => any;

    /**
     * The method to call on each pipe.
     */
    protected method: string = 'handle';

    /**
     * The object being passed through the pipeline.
     */
    protected passable?: any;

    /**
     * The array of class pipes.
     */
    protected pipesArr: (object | (() => any))[] = [];

    /**
     * Set a final callback to be executed after the pipeline ends regardless of the outcome.
     */
    public finally(callback: (passable?: any) => any): this {
        this.finallyFn = callback;

        return this;
    }

    /**
     * Push additional pipes onto the pipeline.
     */
    public pipe(
        ...pipes:
            | [object | ((passable: any, next: object | ((passable: any) => any)) => any)]
            | (object | ((passable: any, next: object | ((passable: any) => any)) => any))[]
    ): this {
        array_push(this.pipesArr, ...(Array.isArray(pipes[0]) ? pipes[0] : pipes));

        return this;
    }

    /**
     * Set the object being sent through the pipeline.
     */
    public send(passable: any): this {
        this.passable = passable;

        return this;
    }

    /**
     * Run the pipeline with a final destination callback.
     */
    public then(destination: (passable: any) => any): any {
        const pipeline = array_reduce(array_reverse(this.pipes()), this.carry(), this.prepareDestination(destination));

        try {
            return pipeline(this.passable);
        } finally {
            if (this.finallyFn) {
                this.finallyFn(this.passable);
            }
        }
    }

    /**
     * Run the pipeline and return the result.
     */
    public thenReturn(): any {
        return this.then((passable: any) => passable);
    }

    /**
     * Set the array of pipes.
     */
    public through(
        ...pipes: (
            | [object | ((passable: any, next: object | ((passable: any) => any)) => any)]
            | (object | ((passable: any, next: object | ((passable: any) => any)) => any))
        )[]
    ): this {
        this.pipesArr = Array.isArray(pipes[0]) ? pipes[0] : pipes;

        return this;
    }

    /**
     * Set the method to call on the pipes.
     */
    public via(method: string): this {
        this.method = method;

        return this;
    }

    /**
     * Get a Closure that represents a slice of the application onion.
     */
    protected carry(): (stack: any, pipe: any) => any {
        return (
            stack: (passable: any) => any,
            pipe: object | ((passable: any, next: (passable: any) => any) => any),
        ) => {
            return (passable: any) => {
                let parameters;

                try {
                    if (typeof pipe === 'function') {
                        // If the pipe is a callable, then we will call it directly, but otherwise we
                        // will resolve the pipes out of the dependency container and call it with
                        // the appropriate method and arguments, returning the results back out.
                        return pipe(passable, stack);
                    }

                    // If the pipe is already an object we'll just make a callable and pass it to
                    // the pipe as-is. There is no need to do any extra parsing and formatting
                    // since the object we're given was already a fully instantiated object.
                    parameters = [passable, stack];

                    const carry = (pipe as any)[this.method](...parameters);

                    return this.handleCarry(carry);
                } catch (e: any) {
                    return this.handleException(e);
                }
            };
        };
    }

    /**
     * Handle the value returned from each pipe before passing it to the next.
     */
    protected handleCarry(carry: any): any {
        return carry;
    }

    /**
     * Handle the given exception.
     *
     * @throws {Error}
     */
    protected handleException(e: Error): any {
        throw e;
    }

    /**
     * Get the array of configured pipes.
     */
    protected pipes(): (object | ((passable: any, next: (passable: any) => any) => any))[] {
        return this.pipesArr;
    }

    /**
     * Get the final piece of the Closure onion.
     */
    protected prepareDestination(destination: (passable: any) => any): (passable: any) => any {
        return (passable: any) => {
            try {
                return destination(passable);
            } catch (e: any) {
                return this.handleException(e);
            }
        };
    }
}
