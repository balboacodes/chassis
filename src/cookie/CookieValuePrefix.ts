export class CookieValuePrefix {
    /**
     * Create a new cookie value prefix for the given cookie name.
     */
    public static async create(cookieName: string, key: string): Promise<string> {
        const encoder = new TextEncoder();

        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(key),
            { name: 'HMAC', hash: { name: 'SHA-1' } },
            false,
            ['sign'],
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(cookieName));

        return [...new Uint8Array(signature)]
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Remove the cookie value prefix.
     */
    public static remove(cookieValue: string): string {
        return cookieValue.substring(41);
    }

    /**
     * Validate a cookie value contains a valid prefix. If it does, return the cookie value with the prefix removed.
     * Otherwise, return null.
     */
    public static async validate(cookieName: string, cookieValue: string, keys: string[]): Promise<string | null> {
        for (const key of keys) {
            const hasValidPrefix = cookieValue.startsWith(await CookieValuePrefix.create(cookieName, key));

            if (hasValidPrefix) {
                return CookieValuePrefix.remove(cookieValue);
            }
        }

        return null;
    }
}
