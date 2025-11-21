export default class LocaleUpdated {
    /**
     * The new locale.
     */
    public locale: string;

    /**
     * Create a new event instance.
     */
    public constructor(locale: string) {
        this.locale = locale;
    }
}
