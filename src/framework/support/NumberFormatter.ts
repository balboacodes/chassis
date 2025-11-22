export class NumberFormatter {
    /**
     * The current default currency.
     */
    protected static defCurrency: string = 'USD';

    /**
     * The current default locale.
     */
    protected static locale?: Intl.LocalesArgument = 'en';

    /**
     * Convert the number to its human-readable equivalent.
     */
    public static abbreviate(number: number, minPrecision?: number, maxPrecision: number = 0): string {
        return NumberFormatter.forHumans(number, minPrecision, maxPrecision, true);
    }

    /**
     * Clamp the given number between the given minimum and maximum.
     */
    public static clamp(number: number, min: number, max: number): number {
        return Math.min(Math.max(number, min), max);
    }

    /**
     * Convert the given number to its currency equivalent.
     */
    public static currency(
        number: number,
        currency?: string,
        locale?: Intl.LocalesArgument,
        maxPrecision?: number,
    ): string {
        const formatter = new Intl.NumberFormat(locale ?? NumberFormatter.locale, {
            style: 'currency',
            maximumFractionDigits: maxPrecision,
            currency: currency ?? NumberFormatter.defCurrency,
        });

        return formatter.format(number);
    }

    /**
     * Get the default currency.
     */
    public static defaultCurrency(): string {
        return NumberFormatter.defCurrency;
    }

    /**
     * Get the default locale.
     */
    public static defaultLocale(): Intl.LocalesArgument | undefined {
        return NumberFormatter.locale;
    }

    /**
     * Convert the given number to its file size equivalent.
     */
    public static fileSize(bytes: number, minPrecision: number = 0, maxPrecision?: number): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const unitCount = units.length;

        let i = 0;

        for (i; bytes / 1024 > 0.9 && i < unitCount - 1; i++) {
            bytes /= 1024;
        }

        const formatted = NumberFormatter.format(bytes, minPrecision, maxPrecision);

        return `${formatted} ${units[i]}`;
    }

    /**
     * Convert the number to its human-readable equivalent.
     */
    public static forHumans(
        number: number,
        minPrecision?: number,
        maxPrecision: number = 0,
        abbreviate: boolean = false,
    ): string {
        return NumberFormatter.summarize(
            number,
            minPrecision,
            maxPrecision,
            abbreviate
                ? {
                      3: 'K',
                      6: 'M',
                      9: 'B',
                      12: 'T',
                      15: 'Q',
                  }
                : {
                      3: ' thousand',
                      6: ' million',
                      9: ' billion',
                      12: ' trillion',
                      15: ' quadrillion',
                  },
        );
    }

    /**
     * Format the given number according to the current locale.
     */
    public static format(
        number: number,
        minPrecision?: number,
        maxPrecision?: number,
        locale?: Intl.LocalesArgument,
    ): string {
        const formatter = new Intl.NumberFormat(locale ?? NumberFormatter.locale, {
            style: 'decimal',
            minimumFractionDigits: minPrecision,
            maximumFractionDigits:
                minPrecision !== undefined && minPrecision > (maxPrecision ?? 0) ? undefined : maxPrecision,
        });

        return formatter.format(number);
    }

    /**
     * Split the given number into pairs of min/max values.
     */
    public static pairs(to: number, by: number, start: number = 0, offset: number = 1): [number, number][] {
        const output: [number, number][] = [];

        for (let lower = start; lower < to; lower += by) {
            let upper = lower + by - offset;

            if (upper > to) {
                upper = to;
            }

            output.push([lower, upper]);
        }

        return output;
    }

    /**
     * Parse the given string according to the specified format type.
     */
    public static parse(string: string, type: 'int' | 'float' = 'float', locale?: Intl.LocalesArgument): number {
        const parsed = String(NumberFormatter.parseLocaleNumber(string, locale ?? NumberFormatter.locale));

        return Number(type === 'float' ? Number.parseFloat(parsed) : Number.parseInt(parsed));
    }

    /**
     * Parse a string into a float according to the specified locale.
     */
    public static parseFloat(string: string, locale?: Intl.LocalesArgument): number {
        return NumberFormatter.parse(string, 'float', locale);
    }

    /**
     * Parse a string into an integer according to the specified locale.
     */
    public static parseInt(string: string, locale?: Intl.LocalesArgument): number {
        return NumberFormatter.parse(string, 'int', locale);
    }

    /**
     * Convert the given number to its percentage equivalent.
     */
    public static percentage(
        number: number,
        minPrecision: number = 0,
        maxPrecision?: number,
        locale?: Intl.LocalesArgument,
    ): string {
        const formatter = new Intl.NumberFormat(locale ?? NumberFormatter.locale, {
            style: 'percent',
            minimumFractionDigits: minPrecision,
            maximumFractionDigits: maxPrecision,
        });

        return formatter.format(number / 100);
    }

    /**
     * Remove any trailing zero digits after the decimal point of the given number.
     */
    public static trim(number: number): number {
        return JSON.parse(JSON.stringify(number));
    }

    /**
     * Set the default currency.
     */
    public static useCurrency(currency: string): void {
        NumberFormatter.defCurrency = currency;
    }

    /**
     * Set the default locale.
     */
    public static useLocale(locale: Intl.LocalesArgument): void {
        NumberFormatter.locale = locale;
    }

    /**
     * Execute the given callback using the given currency.
     */
    public static withCurrency(currency: string, callback: () => any): any {
        const previousCurrency = NumberFormatter.defCurrency;
        NumberFormatter.useCurrency(currency);

        try {
            return callback();
        } finally {
            NumberFormatter.useCurrency(previousCurrency);
        }
    }

    /**
     * Execute the given callback using the given locale.
     */
    public static withLocale(locale: Intl.LocalesArgument, callback: () => any): any {
        const previousLocale = NumberFormatter.locale;
        NumberFormatter.useLocale(locale);

        try {
            return callback();
        } finally {
            NumberFormatter.useLocale(previousLocale);
        }
    }

    /**
     * Parse a string into a locale-aware number.
     */
    protected static parseLocaleNumber(string: string, locale: Intl.LocalesArgument): number {
        const parts = Intl.NumberFormat(locale).formatToParts(1234.5);
        const group = parts.find((p) => p.type === 'group')?.value ?? ',';
        const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.';

        // Replace special space characters that some locales use with a regular space
        const escapedGroup = group.replace(/[\u202F\u00A0\s]/g, '\\s');

        // Remove grouping separator, replace decimal with dot
        const normalized = string.replaceAll(new RegExp(`[${escapedGroup}]`, 'g'), '').replace(decimal, '.');

        return Number(normalized);
    }

    /**
     * Convert the number to its human-readable equivalent.
     */
    protected static summarize(
        number: number,
        minPrecision?: number,
        maxPrecision: number = 0,
        units: Record<number, string> = {},
    ): string {
        if (Object.keys(units).length === 0) {
            units = {
                3: 'K',
                6: 'M',
                9: 'B',
                12: 'T',
                15: 'Q',
            };
        }

        switch (true) {
            case number === 0:
                return NumberFormatter.format(0, minPrecision, maxPrecision);
            case number < 0:
                return '-' + NumberFormatter.summarize(Math.abs(number), minPrecision, maxPrecision, units);
            case number >= 1e15:
                return (
                    NumberFormatter.summarize(number / 1e15, minPrecision, maxPrecision, units) +
                    (Object.values(units).pop() ?? '')
                );
        }

        const numberExponent = Math.floor(Math.log10(number));
        const displayExponent = numberExponent - (numberExponent % 3);
        number /= Math.pow(10, displayExponent);

        return (NumberFormatter.format(number, minPrecision, maxPrecision) + (units[displayExponent] ?? '')).trim();
    }
}
