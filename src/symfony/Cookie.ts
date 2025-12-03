/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Represents a cookie.
 *
 * @author Johannes M. Schmitt <schmittjoh@gmail.com>
 */
export class Cookie {
    public static readonly SAMESITE_NONE = 'none';
    public static readonly SAMESITE_LAX = 'lax';
    public static readonly SAMESITE_STRICT = 'strict';

    protected expire: number;
    protected path: string;

    private sameSite?: string;
    private secureDefault: boolean = false;

    private static readonly RESERVED_CHARS_LIST = '=,; \t\r\n\v\f';
    private static readonly RESERVED_CHARS_FROM = ['=', ',', ';', ' ', '\t', '\r', '\n', '\v', '\f'];
    private static readonly RESERVED_CHARS_TO = ['%3D', '%2C', '%3B', '%20', '%09', '%0D', '%0A', '%0B', '%0C'];

    //     /**
    //      * Creates cookie from raw header string.
    //      */
    //     public static function fromString(string $cookie, bool $decode = false): static
    //     {
    //         $data = [
    //             'expires' => 0,
    //             'path' => '/',
    //             'domain' => null,
    //             'secure' => false,
    //             'httponly' => false,
    //             'raw' => !$decode,
    //             'samesite' => null,
    //             'partitioned' => false,
    //         ];

    //         $parts = HeaderUtils::split($cookie, ';=');
    //         $part = array_shift($parts);

    //         $name = $decode ? urldecode($part[0]) : $part[0];
    //         $value = isset($part[1]) ? ($decode ? urldecode($part[1]) : $part[1]) : null;

    //         $data = HeaderUtils::combine($parts) + $data;
    //         $data['expires'] = self::expiresTimestamp($data['expires']);

    //         if (isset($data['max-age']) && ($data['max-age'] > 0 || $data['expires'] > time())) {
    //             $data['expires'] = time() + (int) $data['max-age'];
    //         }

    //         return new static($name, $value, $data['expires'], $data['path'], $data['domain'], $data['secure'], $data['httponly'], $data['raw'], $data['samesite'], $data['partitioned']);
    //     }

    //     /**
    //      * @see self::__construct
    //      *
    //      * @param self::SAMESITE_*|''|null $sameSite
    //      */
    //     public static function create(string $name, ?string $value = null, int|string|\DateTimeInterface $expire = 0, ?string $path = '/', ?string $domain = null, ?bool $secure = null, bool $httpOnly = true, bool $raw = false, ?string $sameSite = self::SAMESITE_LAX, bool $partitioned = false): self
    //     {
    //         return new self($name, $value, $expire, $path, $domain, $secure, $httpOnly, $raw, $sameSite, $partitioned);
    //     }

    /**
     * @param  name  The name of the cookie
     * @param  value  The value of the cookie
     * @param  expire  The time the cookie expires
     * @param  path  The path on the server in which the cookie will be available on
     * @param  domain  The domain that the cookie is available to
     * @param  secure  Whether the client should send back the cookie only over HTTPS or undefined to auto-enable this
     * when the request is already using HTTPS
     * @param  httpOnly  Whether the cookie will be made accessible only through the HTTP protocol
     * @param  raw  Whether the cookie value should be sent with no url encoding
     * @param  sameSite  Whether the cookie will be available for cross-site requests
     *
     * @throws {Error}
     */
    public constructor(
        protected name: string,
        protected value?: string,
        expire: number | string | Date = 0,
        path: string = '/',
        protected domain?: string,
        protected secure?: boolean,
        protected httpOnly: boolean = true,
        private raw: boolean = false,
        sameSite: string = Cookie.SAMESITE_LAX,
        private partitioned: boolean = false,
    ) {
        if (raw) {
            for (const char of Cookie.RESERVED_CHARS_FROM) {
                if (name.includes(char)) {
                    throw new Error(`The cookie name "${name}" contains invalid characters.`);
                }
            }
        }

        if (!name) {
            throw new Error('The cookie name cannot be empty.');
        }

        this.expire = Cookie.expiresTimestamp(expire);
        this.path = path ? path : '/';
        this.sameSite = this.withSameSite(sameSite).sameSite;
    }

    //     /**
    //      * Creates a cookie copy with a new value.
    //      */
    //     public withValue(?string value): static
    //     {
    //         $cookie = clone $this;
    //         $cookie->value = $value;

    //         return $cookie;
    //     }

    //     /**
    //      * Creates a cookie copy with a new domain that the cookie is available to.
    //      */
    //     public withDomain(?string $domain): static
    //     {
    //         $cookie = clone $this;
    //         $cookie->domain = $domain;

    //         return $cookie;
    //     }

    //     /**
    //      * Creates a cookie copy with a new time the cookie expires.
    //      */
    //     public withExpires(int|string|\DateTimeInterface $expire = 0): static
    //     {
    //         $cookie = clone $this;
    //         $cookie->expire = self::expiresTimestamp($expire);

    //         return $cookie;
    //     }

    /**
     * Converts expires formats to a unix timestamp.
     */
    private static expiresTimestamp(expire: number | string | Date = 0): number {
        // convert expiration time to a Unix timestamp
        if (expire instanceof Date) {
            expire = expire.getTime() * 1000;
        } else if (typeof expire === 'string') {
            expire = Date.parse(expire) * 1000;
        }

        return 0 < expire ? expire : 0;
    }

    //     /**
    //      * Creates a cookie copy with a new path on the server in which the cookie will be available on.
    //      */
    //     public withPath(string $path): static
    //     {
    //         $cookie = clone $this;
    //         $cookie->path = '' === $path ? '/' : $path;

    //         return $cookie;
    //     }

    //     /**
    //      * Creates a cookie copy that only be transmitted over a secure HTTPS connection from the client.
    //      */
    //     public withSecure(bool $secure = true): static
    //     {
    //         $cookie = clone $this;
    //         $cookie->secure = $secure;

    //         return $cookie;
    //     }

    //     /**
    //      * Creates a cookie copy that be accessible only through the HTTP protocol.
    //      */
    //     public withHttpOnly(bool $httpOnly = true): static
    //     {
    //         $cookie = clone $this;
    //         $cookie->httpOnly = $httpOnly;

    //         return $cookie;
    //     }

    //     /**
    //      * Creates a cookie copy that uses no url encoding.
    //      */
    //     public withRaw(bool $raw = true): static
    //     {
    //         if ($raw && false !== strpbrk(this.name, self::RESERVED_CHARS_LIST)) {
    //             throw new \InvalidArgumentException(\sprintf('The cookie name "%s" contains invalid characters.', this.name));
    //         }

    //         $cookie = clone $this;
    //         $cookie->raw = $raw;

    //         return $cookie;
    //     }

    /**
     * Creates a cookie copy with SameSite attribute.
     */
    public withSameSite(sameSite?: string): Cookie {
        if ('' === sameSite) {
            sameSite = undefined;
        } else if (undefined !== sameSite) {
            sameSite = sameSite.toLowerCase();
        }

        if (![Cookie.SAMESITE_LAX, Cookie.SAMESITE_STRICT, Cookie.SAMESITE_NONE, undefined].includes(sameSite)) {
            throw new Error('The "sameSite" parameter value is not valid.');
        }

        const cookie = new Cookie(
            this.getName(),
            this.getValue(),
            this.getExpiresTime(),
            this.getPath(),
            this.getDomain(),
            this.isSecure(),
            this.isHttpOnly(),
            this.isRaw(),
            this.getSameSite(),
            this.isPartitioned(),
        );
        cookie.sameSite = sameSite;

        return cookie;
    }

    //     /**
    //      * Creates a cookie copy that is tied to the top-level site in cross-site context.
    //      */
    //     public withPartitioned(bool $partitioned = true): static
    //     {
    //         $cookie = clone $this;
    //         $cookie->partitioned = $partitioned;

    //         return $cookie;
    //     }

    //     /**
    //      * Returns the cookie as a string.
    //      */
    //     public __toString(): string
    //     {
    //         if (this.isRaw()) {
    //             $str = this.getName();
    //         } else {
    //             $str = str_replace(self::RESERVED_CHARS_FROM, self::RESERVED_CHARS_TO, this.getName());
    //         }

    //         $str .= '=';

    //         if ('' === (string) this.getValue()) {
    //             $str .= 'deleted; expires='.gmdate('D, d M Y H:i:s T', time() - 31536001).'; Max-Age=0';
    //         } else {
    //             $str .= this.isRaw() ? this.getValue() : rawurlencode(this.getValue());

    //             if (0 !== this.getExpiresTime()) {
    //                 $str .= '; expires='.gmdate('D, d M Y H:i:s T', this.getExpiresTime()).'; Max-Age='.this.getMaxAge();
    //             }
    //         }

    //         if (this.getPath()) {
    //             $str .= '; path='.this.getPath();
    //         }

    //         if (this.getDomain()) {
    //             $str .= '; domain='.this.getDomain();
    //         }

    //         if (this.isSecure()) {
    //             $str .= '; secure';
    //         }

    //         if (this.isHttpOnly()) {
    //             $str .= '; httponly';
    //         }

    //         if (null !== this.getSameSite()) {
    //             $str .= '; samesite='.this.getSameSite();
    //         }

    //         if (this.isPartitioned()) {
    //             $str .= '; partitioned';
    //         }

    //         return $str;
    //     }

    /**
     * Gets the name of the cookie.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Gets the value of the cookie.
     */
    public getValue(): string | undefined {
        return this.value;
    }

    /**
     * Gets the domain that the cookie is available to.
     */
    public getDomain(): string | undefined {
        return this.domain;
    }

    /**
     * Gets the time the cookie expires.
     */
    public getExpiresTime(): number {
        return this.expire;
    }

    /**
     * Gets the max-age attribute.
     */
    public getMaxAge(): number {
        const maxAge = this.expire - (Date.now() * 1000);

        return Math.max(0, maxAge);
    }

    /**
     * Gets the path on the server in which the cookie will be available on.
     */
    public getPath(): string {
        return this.path;
    }

    /**
     * Checks whether the cookie should only be transmitted over a secure HTTPS connection from the client.
     */
    public isSecure(): boolean {
        return this.secure ?? this.secureDefault;
    }

    /**
     * Checks whether the cookie will be made accessible only through the HTTP protocol.
     */
    public isHttpOnly(): boolean {
        return this.httpOnly;
    }

    /**
     * Whether this cookie is about to be cleared.
     */
    public isCleared(): boolean {
        return 0 !== this.expire && this.expire < Date.now() * 1000;
    }

    /**
     * Checks if the cookie value should be sent with no url encoding.
     */
    public isRaw(): boolean {
        return this.raw;
    }

    /**
     * Checks whether the cookie should be tied to the top-level site in cross-site context.
     */
    public isPartitioned(): boolean {
        return this.partitioned;
    }

    /**
     * Gets the same site attribute.
     */
    public getSameSite(): string | undefined {
        return this.sameSite;
    }

    /**
     * Set the secure default.
     */
    public setSecureDefault(defaultValue: boolean): void {
        this.secureDefault = defaultValue;
    }
}
