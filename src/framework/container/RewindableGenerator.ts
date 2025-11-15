// @ts-nocheck
import { Countable } from '../contracts/php/Countable.ts';
import { IteratorAggregate } from '../contracts/php/IteratorAggregate.ts';
import { Traversable } from '../contracts/php/Traversable.ts';

export class RewindableGenerator implements Countable, IteratorAggregate {
    /**
     * The generator callback.
     *
     * @var callable
     */

    protected generator: Function;

    /**
     * The number of tagged services.
     *
     * @var callable|int
     */

    protected count: Function | number;

    /**
     * Create a new generator instance.
     *
     * @param  callable  generator
     * @param  callable|int  count
     */

    public __construct(generator: Function, count: Function | number) {
        // this->count = count;
        // this->generator = generator;
    }

    /**
     * Get an iterator from the generator.
     *
     * @return \Traversable
     */

    public getIterator(): Traversable {
        // return (this->generator)();
    }

    /**
     * Get the total number of tagged services.
     *
     * @return int
     */

    public count(): number {
        // if (is_callable(count = this->count)) {
        //     this->count = count();
        // }
        // return this->count;
    }
}
