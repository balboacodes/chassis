/**
 * Interface to provide accessing objects as arrays.
 * @link https://php.net/manual/en/class.arrayaccess.php
 * @template TKey
 * @template TValue
 */
export interface ArrayAccess {
    // /**
    //  * Whether a offset exists
    //  * @link https://php.net/manual/en/arrayaccess.offsetexists.php
    //  * @param TKey $offset <p>
    //  * An offset to check for.
    //  * </p>
    //  * @return bool true on success or false on failure.
    //  * </p>
    //  * <p>
    //  * The return value will be casted to boolean if non-boolean was returned.
    //  */
    // #[TentativeType]
    // public function offsetExists(#[LanguageLevelTypeAware(['8.0' => 'mixed'], default: '')] $offset): bool;
    // /**
    //  * Offset to retrieve
    //  * @link https://php.net/manual/en/arrayaccess.offsetget.php
    //  * @param TKey $offset <p>
    //  * The offset to retrieve.
    //  * </p>
    //  * @return TValue Can return all value types.
    //  */
    // #[TentativeType]
    // public function offsetGet(#[LanguageLevelTypeAware(['8.0' => 'mixed'], default: '')] $offset): mixed;
    // /**
    //  * Offset to set
    //  * @link https://php.net/manual/en/arrayaccess.offsetset.php
    //  * @param TKey $offset <p>
    //  * The offset to assign the value to.
    //  * </p>
    //  * @param TValue $value <p>
    //  * The value to set.
    //  * </p>
    //  * @return void
    //  */
    // #[TentativeType]
    // public function offsetSet(
    //     #[LanguageLevelTypeAware(['8.0' => 'mixed'], default: '')] $offset,
    //     #[LanguageLevelTypeAware(['8.0' => 'mixed'], default: '')] $value
    // ): void;
    // /**
    //  * Offset to unset
    //  * @link https://php.net/manual/en/arrayaccess.offsetunset.php
    //  * @param TKey $offset <p>
    //  * The offset to unset.
    //  * </p>
    //  * @return void
    //  */
    // #[TentativeType]
    // public function offsetUnset(#[LanguageLevelTypeAware(['8.0' => 'mixed'], default: '')] $offset): void;
}
