export default class RewindableGenerator {
    /**
     * The generator callback.
     */
    protected generator: (tag: string) => Generator<unknown, void, unknown>;

    /**
     * The number of tagged services.
     */
    protected count: (() => unknown) | number;

    /**
     * Create a new generator instance.
     */
    public constructor(generator: (tag: string) => Generator<unknown, void, unknown>, count: (() => unknown) | number) {
        this.count = count;
        this.generator = generator;
    }

    //     /**
    //      * Get an iterator from the generator.
    //      *
    //      * @return \Traversable
    //      */
    //     public function getIterator(): Traversable
    //     {
    //         return ($this->generator)();
    //     }

    //     /**
    //      * Get the total number of tagged services.
    //      *
    //      * @return int
    //      */
    //     public function count(): int
    //     {
    //         if (is_callable($count = $this->count)) {
    //             $this->count = $count();
    //         }

    //         return $this->count;
    //     }
}
