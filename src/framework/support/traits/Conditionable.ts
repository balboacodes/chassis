export class Conditionable {
    /**
     * Apply the callback if the given "value" is (or resolves to) falsy.
     */
    public unless<TUnlessParameter, TUnlessReturnType>(
        value?: ((instance: this) => TUnlessParameter) | TUnlessParameter,
        callback?: (instance: this, unless: TUnlessParameter) => TUnlessReturnType,
        defaultValue?: (instance: this, unless: TUnlessParameter) => TUnlessReturnType,
    ): this | TUnlessReturnType {
        value = typeof value === 'function' ? (value as (instance: this) => TUnlessParameter)(this) : value;

        if (arguments.length === 0) {
            return this;
        }

        if (!value) {
            return callback?.(this, value as TUnlessParameter) ?? this;
        } else if (defaultValue) {
            return defaultValue(this, value as TUnlessParameter) ?? this;
        }

        return this;
    }

    /**
     * Apply the callback if the given "value" is (or resolves to) truthy.
     */
    public when<TWhenParameter, TWhenReturnType>(
        value?: ((instance: this) => TWhenParameter) | TWhenParameter,
        callback?: (instance: this, when: TWhenParameter) => TWhenReturnType,
        defaultValue?: (instance: this, when: TWhenParameter) => TWhenReturnType,
    ): this | TWhenReturnType {
        value = typeof value === 'function' ? (value as (instance: this) => TWhenParameter)(this) : value;

        if (arguments.length === 0) {
            return this;
        }

        if (value) {
            return callback?.(this, value as TWhenParameter) ?? this;
        } else if (defaultValue) {
            return defaultValue(this, value as TWhenParameter) ?? this;
        }

        return this;
    }
}
