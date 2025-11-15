import { Traversable } from './Traversable.ts';

/**
 * Interface to create an external Iterator.
 * @link https://php.net/manual/en/class.iteratoraggregate.php
 * @template TKey
 * @template-covariant TValue
 * @template-extends Traversable<TKey, TValue>
 */
export interface IteratorAggregate extends Traversable {
    /**
     * Retrieve an external iterator
     * @link https://php.net/manual/en/iteratoraggregate.getiterator.php
     * @return Traversable<TKey, TValue>|TValue[] An instance of an object implementing <b>Iterator</b> or
     * <b>Traversable</b>
     * @throws Exception on failure.
     */
    getIterator(): Traversable;
}
