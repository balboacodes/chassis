/**
 * Interface to detect if a class is traversable using foreach.
 * Abstract base interface that cannot be implemented alone.
 * Instead it must be implemented by either {@see IteratorAggregate} or {@see Iterator}.
 *
 * @link https://php.net/manual/en/class.traversable.php
 * @template TKey
 * @template-covariant TValue
 *
 */
export interface Traversable {}
