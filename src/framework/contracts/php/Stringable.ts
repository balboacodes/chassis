/**
 * Stringable interface denotes a class as having a __toString() method.
 *
 * @since 8.0
 */
export interface Stringable {
    /**
     * Magic method {@see https://www.php.net/manual/en/language.oop5.magic.php#object.tostring}
     * allows a class to decide how it will react when it is treated like a string.
     *
     * @return string Returns string representation of the object that
     * implements this interface (and/or "__toString" magic method).
     */
    __toString(): string;
}
