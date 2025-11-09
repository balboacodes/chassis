// prettier-ignore
import {
    array_filter, array_map, array_reduce, array_reverse, array_shift, base64_decode, base64_encode, count, ctype_lower, empty, explode, in_array, isset, lcfirst, ltrim, max, MB_CASE_TITLE, mb_convert_case, mb_split, mb_str_pad, mb_str_split, mb_strimwidth, mb_strlen, mb_strpos, mb_strrpos, mb_strwidth, mb_substr, preg_match, preg_match_all, preg_quote, preg_replace, preg_replace_callback, preg_split, PREG_SPLIT_NO_EMPTY, random_bytes, random_int, rtrim, str_ireplace, STR_PAD_BOTH, STR_PAD_LEFT, STR_PAD_RIGHT, str_replace, str_word_count, strip_tags, strlen, strpos, strrpos, strstr, strtr, substr, substr_count, substr_replace, trim, ucwords, wordwrap,
} from '@balboacodes/php-utils';
import { Stringable } from './Stringable';

export class Str {
    /**
     * The list of characters that are considered "invisible" in strings.
     */
    // prettier-ignore
    public static readonly INVISIBLE_CHARACTERS = [
      '\u0009', '\u0020', '\u00A0', '\u00AD', '\u034F', '\u061C', '\u115F', '\u1160', '\u17B4', '\u17B5', '\u180E', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u200B', '\u200C', '\u200D', '\u200E', '\u200F', '\u202F', '\u205F', '\u2060', '\u2061', '\u2062', '\u2063', '\u2064', '\u2065', '\u206A', '\u206B', '\u206C', '\u206D', '\u206E', '\u206F', '\u3000', '\u2800', '\u3164', '\uFEFF', '\uFFA0', '\uD834\uDD59', '\uD834\uDD73', '\uD834\uDD74', '\uD834\uDD75', '\uD834\uDD76', '\uD834\uDD77', '\uD834\uDD78', '\uD834\uDD79', '\uD834\uDD7A', '\uDB40\uDC20',
    ];

    /**
     * The cache of camel-cased words.
     */
    protected static camelCache: Record<string, string> = {};

    /**
     * The callback that should be used to generate random strings.
     */
    protected static randomStringFactory?: (length: number) => string;

    /**
     * The cache of snake-cased words.
     */
    protected static snakeCache: Record<string, Record<string, string>> = {};

    /**
     * The cache of studly-cased words.
     */
    protected static studlyCache: Record<string, string> = {};

    /**
     * Return the remainder of a string after the first occurrence of a given value.
     */
    public static after(subject: string, search: string): string {
        return search === '' ? subject : (array_reverse(explode(search, subject, 2)) as any[])[0];
    }

    /**
     * Return the remainder of a string after the last occurrence of a given value.
     */
    public static afterLast(subject: string, search: string): string {
        if (search === '') {
            return subject;
        }

        const position = strrpos(subject, search);

        if (position === false) {
            return subject;
        }

        return substr(subject, position + strlen(search));
    }

    /**
     * Convert the given string to APA-style title case.
     *
     * @see https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case
     */
    public static apa(value: string): string {
        if (value.trim() === '') {
            return value;
        }

        // prettier-ignore
        const minorWords = [
          'and', 'as', 'but', 'for', 'if', 'nor', 'or', 'so', 'yet', 'a', 'an', 'the', 'at', 'by', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via', 'et', 'ou', 'un', 'une', 'la', 'le', 'les', 'de', 'du', 'des', 'par', 'à',
        ];

        const endPunctuation = ['.', '!', '?', ':', '—', ','];

        let words = mb_split('\\s+', value);
        words = words ? words : [];
        const wordCount = count(words);

        for (let i = 0; i < wordCount; i++) {
            const lowercaseWord = words[i].toLocaleLowerCase();

            if (lowercaseWord.includes('-')) {
                let hyphenatedWords = explode('-', lowercaseWord);

                hyphenatedWords = array_map(
                    (part) =>
                        in_array(part, minorWords) && mb_strlen(part) <= 3
                            ? part
                            : mb_substr(part, 0, 1).toLocaleUpperCase() + mb_substr(part, 1),
                    hyphenatedWords,
                ) as string[];

                words[i] = hyphenatedWords.join('-');
            } else {
                if (
                    in_array(lowercaseWord, minorWords) &&
                    mb_strlen(lowercaseWord) <= 3 &&
                    !(i === 0 || in_array(mb_substr(words[i - 1], -1), endPunctuation))
                ) {
                    words[i] = lowercaseWord;
                } else {
                    words[i] = mb_substr(lowercaseWord, 0, 1).toLocaleUpperCase() + mb_substr(lowercaseWord, 1);
                }
            }
        }

        return words.join(' ');
    }

    /**
     * Get the portion of a string before the first occurrence of a given value.
     */
    public static before(subject: string, search: string): string {
        if (search === '') {
            return subject;
        }

        const result = strstr(subject, search, true);

        return result === false ? subject : result;
    }

    /**
     * Get the portion of a string before the last occurrence of a given value.
     */
    public static beforeLast(subject: string, search: string): string {
        if (search === '') {
            return subject;
        }

        const pos = mb_strrpos(subject, search);

        if (pos === false) {
            return subject;
        }

        return Str.substr(subject, 0, pos);
    }

    /**
     * Get the portion of a string between two given values.
     */
    public static between(subject: string, from: string, to: string): string {
        if (from === '' || to === '') {
            return subject;
        }

        return Str.beforeLast(Str.after(subject, from), to);
    }

    /**
     * Get the smallest possible portion of a string between two given values.
     */
    public static betweenFirst(subject: string, from: string, to: string): string {
        if (from === '' || to === '') {
            return subject;
        }

        return Str.before(Str.after(subject, from), to);
    }

    /**
     * Convert a value to camel case.
     */
    public static camel(value: string): string {
        if (isset(Str.camelCache[value])) {
            return Str.camelCache[value];
        }

        return (Str.camelCache[value] = lcfirst(Str.studly(value)));
    }

    /**
     * Get the character at the specified index.
     */
    public static charAt(subject: string, index: number): string | false {
        const length = mb_strlen(subject);

        if (index < 0 ? index < -length : index > length - 1) {
            return false;
        }

        return mb_substr(subject, index, 1);
    }

    /**
     * Remove the given string(s) if it exists at the end of the haystack.
     */
    public static chopEnd(subject: string, needle: string | string[]): string {
        for (const n of Array.isArray(needle) ? needle : [needle]) {
            if (subject.endsWith(n)) {
                return substr(subject, 0, -strlen(n));
            }
        }

        return subject;
    }

    /**
     * Remove the given string(s) if it exists at the start of the haystack.
     */
    public static chopStart(subject: string, needle: string | string[]): string {
        for (const n of Array.isArray(needle) ? needle : [needle]) {
            if (subject.startsWith(n)) {
                return substr(subject, strlen(n));
            }
        }

        return subject;
    }

    /**
     * Determine if a given string contains a given substring.
     */
    public static contains(haystack: string, needles: string | string[], ignoreCase: boolean = false): boolean {
        if (ignoreCase) {
            haystack = haystack.toLocaleLowerCase();
        }

        if (typeof needles === 'string') {
            needles = [needles];
        }

        for (let needle of needles) {
            if (ignoreCase) {
                needle = needle.toLocaleLowerCase();
            }

            if (needle !== '' && haystack.includes(needle)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if a given string contains all array values.
     */
    public static containsAll(haystack: string, needles: string[], ignoreCase: boolean = false): boolean {
        for (const needle of needles) {
            if (!Str.contains(haystack, needle, ignoreCase)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Indicate that random strings should be created normally and not using a custom factory.
     */
    public static createRandomStringsNormally(): void {
        Str.randomStringFactory = undefined;
    }

    /**
     * Set the callable that will be used to generate random strings.
     */
    public static createRandomStringsUsing(factory?: (length: number) => string): void {
        Str.randomStringFactory = factory;
    }

    /**
     * Replace consecutive instances of a given character with a single character in the given string.
     */
    public static deduplicate(string: string, characters: string | string[] = ' '): string | null {
        if (typeof characters === 'string') {
            return preg_replace('/' + preg_quote(characters, '/') + '+/gu', characters, string) as string;
        }

        return array_reduce(
            characters,
            (carry, character) => {
                const result = preg_replace('/' + preg_quote(character, '/') + '+/gu', character, carry);

                return result ? result : '';
            },
            string,
        );
    }

    /**
     * Determine if a given string doesn't contain a given substring.
     */
    public static doesntContain(haystack: string, needles: string | string[], ignoreCase: boolean = false): boolean {
        return !Str.contains(haystack, needles, ignoreCase);
    }

    /**
     * Determine if a given string doesn't end with a given substring.
     */
    public static doesntEndWith(haystack: string, needles: string | string[]): boolean {
        return !Str.endsWith(haystack, needles);
    }

    /**
     * Determine if a given string doesn't start with a given substring.
     */
    public static doesntStartWith(haystack: string, needles: string | string[]): boolean {
        return !Str.startsWith(haystack, needles);
    }

    /**
     * Determine if a given string ends with a given substring.
     */
    public static endsWith(haystack: string, needles: string | string[]): boolean {
        if (typeof needles === 'string') {
            needles = [needles];
        }

        for (const needle of needles) {
            if (needle !== '' && haystack.endsWith(needle)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Extracts an excerpt from text that matches the first instance of a phrase.
     */
    public static excerpt(
        text: string,
        phrase: string = '',
        options: { omission?: string; radius?: number } = {},
    ): string | null {
        const omission = options.omission ?? '...';
        const radius = options.radius ?? 100;
        let matches: string[] = [];

        preg_match('/^(.*?)(' + preg_quote(phrase, '/') + ')(.*)/iu', text, matches);

        if (matches.length === 0) {
            return null;
        }

        let start: string | Stringable = matches[1].trimStart();
        start = Str.of(mb_substr(start, max(mb_strlen(start) - radius, 0), radius))
            .ltrim()
            .unless(
                (startWithRadius: Stringable) => startWithRadius.exactly(start),
                (startWithRadius: Stringable) => startWithRadius.prepend(omission),
            );

        let end: string | Stringable = matches[3].trimEnd();
        end = Str.of(mb_substr(end, 0, radius))
            .rtrim()
            .unless(
                (endWithRadius: Stringable) => endWithRadius.exactly(end),
                (endWithRadius: Stringable) => endWithRadius.append(omission),
            );

        return start.append(matches[2], end.toString()).toString();
    }

    /**
     * Cap a string with a single instance of a given value.
     */
    public static finish(value: string, cap: string): string {
        const quoted = preg_quote(cap, '/');

        return preg_replace('/(?:' + quoted + ')+$/u', '', value) + cap;
    }

    /**
     * Remove all strings from the casing caches.
     */
    public static flushCache(): void {
        Str.snakeCache = {};
        Str.camelCache = {};
        Str.studlyCache = {};
    }

    /**
     * Decode the given Base64 encoded string.
     */
    public static fromBase64(string: string, strict: boolean = false): string | false {
        return base64_decode(string, strict);
    }

    /**
     * Convert the given string to proper case for each word.
     */
    public static headline(value: string): string {
        let parts = mb_split('\\s+', value);
        parts = parts ? parts : [];

        if (count(parts) > 1) {
            parts = array_map((s: string) => Str.title(s), parts) as string[];
        } else {
            let split = Str.ucsplit(parts.join('_'));
            split = split ? split : [];

            parts = array_map((s: string) => Str.title(s), split as any) as string[];
        }

        const collapsed = Str.replace(['-', '_', ' '], '_', parts.join('_'));

        return (array_filter(explode('_', collapsed as string)) as string[]).join(' ');
    }

    /**
     * Determine if a given string matches a given pattern.
     */
    public static is(pattern: string | string[], value: string, ignoreCase: boolean = false): boolean {
        if (typeof pattern === 'string') {
            pattern = [pattern];
        }

        for (let p of pattern) {
            // If the given value is an exact match we can of course return true right
            // from the beginning. Otherwise, we will translate asterisks and do an
            // actual pattern match against the two strings to see if they match.
            if (p === '*' || p === value) {
                return true;
            }

            if (ignoreCase && p.toLocaleLowerCase() === value.toLocaleLowerCase()) {
                return true;
            }

            p = preg_quote(p, '#');

            // Asterisks are translated into zero-or-more regular expression wildcards
            // to make it convenient to check if the strings starts with the given
            // pattern such as "library/*", making any string check convenient.
            p = str_replace('\\*', '.*', p) as string;

            if (preg_match('#^' + p + '$#' + (ignoreCase ? 'isu' : 'su'), value)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if a given value is valid JSON.
     */
    public static isJson(value: any): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        try {
            const parsed = JSON.parse(value);

            return typeof parsed !== 'undefined';
        } catch {
            return false;
        }
    }

    /**
     * Determine if a given string matches a given pattern.
     */
    public static isMatch(pattern: string | string[] | RegExp | RegExp[], value: string): boolean {
        let patterns = typeof pattern === 'string' || pattern instanceof RegExp ? [pattern] : pattern;

        for (let p of patterns) {
            if (preg_match(String(p), value)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if a given value is a valid URL.
     */
    public static isUrl(value: any, protocols: string[] = []): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        const protocolList =
            protocols.length === 0
                ? 'aaa|aaas|about|acap|acct|acd|acr|adiumxtra|adt|afp|afs|aim|amss|android|appdata|apt|ark|attachment|aw|barion|beshare|bitcoin|bitcoincash|blob|bolo|browserext|calculator|callto|cap|cast|casts|chrome|chrome-extension|cid|coap|coap\\+tcp|coap\\+ws|coaps|coaps\\+tcp|coaps\\+ws|com-eventbrite-attendee|content|conti|crid|cvs|dab|data|dav|diaspora|dict|did|dis|dlna-playcontainer|dlna-playsingle|dns|dntp|dpp|drm|drop|dtn|dvb|ed2k|elsi|example|facetime|fax|feed|feedready|file|filesystem|finger|first-run-pen-experience|fish|fm|ftp|fuchsia-pkg|geo|gg|git|gizmoproject|go|gopher|graph|gtalk|h323|ham|hcap|hcp|http|https|hxxp|hxxps|hydrazone|iax|icap|icon|im|imap|info|iotdisco|ipn|ipp|ipps|irc|irc6|ircs|iris|iris\\.beep|iris\\.lwz|iris\\.xpc|iris\\.xpcs|isostore|itms|jabber|jar|jms|keyparc|lastfm|ldap|ldaps|leaptofrogans|lorawan|lvlt|magnet|mailserver|mailto|maps|market|message|mid|mms|modem|mongodb|moz|ms-access|ms-browser-extension|ms-calculator|ms-drive-to|ms-enrollment|ms-excel|ms-eyecontrolspeech|ms-gamebarservices|ms-gamingoverlay|ms-getoffice|ms-help|ms-infopath|ms-inputapp|ms-lockscreencomponent-config|ms-media-stream-id|ms-mixedrealitycapture|ms-mobileplans|ms-officeapp|ms-people|ms-project|ms-powerpoint|ms-publisher|ms-restoretabcompanion|ms-screenclip|ms-screensketch|ms-search|ms-search-repair|ms-secondary-screen-controller|ms-secondary-screen-setup|ms-settings|ms-settings-airplanemode|ms-settings-bluetooth|ms-settings-camera|ms-settings-cellular|ms-settings-cloudstorage|ms-settings-connectabledevices|ms-settings-displays-topology|ms-settings-emailandaccounts|ms-settings-language|ms-settings-location|ms-settings-lock|ms-settings-nfctransactions|ms-settings-notifications|ms-settings-power|ms-settings-privacy|ms-settings-proximity|ms-settings-screenrotation|ms-settings-wifi|ms-settings-workplace|ms-spd|ms-sttoverlay|ms-transit-to|ms-useractivityset|ms-virtualtouchpad|ms-visio|ms-walk-to|ms-whiteboard|ms-whiteboard-cmd|ms-word|msnim|msrp|msrps|mss|mtqp|mumble|mupdate|mvn|news|nfs|ni|nih|nntp|notes|ocf|oid|onenote|onenote-cmd|opaquelocktoken|openpgp4fpr|pack|palm|paparazzi|payto|pkcs11|platform|pop|pres|prospero|proxy|pwid|psyc|pttp|qb|query|redis|rediss|reload|res|resource|rmi|rsync|rtmfp|rtmp|rtsp|rtsps|rtspu|s3|secondlife|service|session|sftp|sgn|shttp|sieve|simpleledger|sip|sips|skype|smb|sms|smtp|snews|snmp|soap\\.beep|soap\\.beeps|soldat|spiffe|spotify|ssh|steam|stun|stuns|submit|svn|tag|teamspeak|tel|teliaeid|telnet|tftp|tg|things|thismessage|tip|tn3270|tool|ts3server|turn|turns|tv|udp|unreal|urn|ut2004|v-event|vemmi|ventrilo|videotex|vnc|view-source|wais|webcal|wpid|ws|wss|wtai|wyciwyg|xcon|xcon-userid|xfire|xmlrpc\\.beep|xmlrpc\\.beeps|xmpp|xri|ymsgr|z39\\.50|z39\\.50r|z39\\.50s'
                : protocols.join('|');

        // Simplified URL regex compatible with JS
        const pattern =
            `/^${protocolList}:\\/\\/(?:\\S+(?::\\S*)?@)?` + // auth
            `(?:(?:[a-zA-Z0-9\\-._~%!$&'()*+,;=]+\\.)+[a-zA-Z]{2,}|` + // domain
            `localhost|` + // localhost
            `\\d{1,3}(?:\\.\\d{1,3}){3}|` + // IPv4
            `\\[[a-fA-F0-9:]+\\])` + // IPv6 (simplified)
            `(?::\\d{2,5})?` + // port
            `(\\/[^\\s]*)?$/` + // path
            'i';

        return preg_match(str_replace('LARAVEL_PROTOCOLS', protocolList, pattern) as string, value);
    }

    /**
     * Convert a string to kebab case.
     */
    public static kebab(value: string): string {
        return Str.snake(value, '-');
    }

    /**
     * Make a string's first character lowercase.
     */
    public static lcfirst(string: string): string {
        return Str.lower(Str.substr(string, 0, 1)) + Str.substr(string, 1);
    }

    /**
     * Return the length of the given string.
     */
    public static length(value: string): number {
        return mb_strlen(value);
    }

    /**
     * Limit the number of characters in a string.
     */
    public static limit(
        value: string,
        limit: number = 100,
        end: string = '...',
        preserveWords: boolean = false,
    ): string {
        if (mb_strwidth(value) <= limit) {
            return value;
        }

        if (!preserveWords) {
            return mb_strimwidth(value, 0, limit, '').trimEnd() + end;
        }

        const replaced = preg_replace('/[\n\r]+/', ' ', strip_tags(value));
        value = ((replaced ?? '') as string).trim();

        const trimmed = mb_strimwidth(value, 0, limit, '').trimEnd();

        if (mb_substr(value, limit, 1) === ' ') {
            return trimmed + end;
        }

        return preg_replace('/\\s+\\S*$/u', '', trimmed) + end;
    }

    /**
     * Convert the given string to lower-case.
     */
    public static lower(value: string): string {
        return value.toLocaleLowerCase();
    }

    /**
     * Remove all whitespace from the beginning of a string.
     */
    public static ltrim(value: string, charlist?: string): string {
        if (charlist === undefined) {
            const ltrimDefaultCharacters = ' \n\r\t\v\0';

            return (preg_replace('~^[\\s' + Str.INVISIBLE_CHARACTERS + ltrimDefaultCharacters + ']+~u', '', value) ??
                value.trimStart()) as string;
        }

        return ltrim(value, charlist);
    }

    /**
     * Masks a portion of a string with a repeated character.
     */
    public static mask(string: string, character: string, index: number, length?: number): string {
        if (character === '') {
            return string;
        }

        const segment = mb_substr(string, index, length);

        if (segment === '') {
            return string;
        }

        const strlength = mb_strlen(string);
        let startIndex = index;

        if (index < 0) {
            startIndex = index < -strlength ? 0 : strlength + index;
        }

        const start = mb_substr(string, 0, startIndex);
        const segmentLen = mb_strlen(segment);
        const end = mb_substr(string, startIndex + segmentLen);

        return start + mb_substr(character, 0, 1).repeat(segmentLen) + end;
    }

    /**
     * Get the string matching the given pattern.
     */
    public static match(pattern: string | RegExp, subject: string): string {
        let matches: string[] = [];
        preg_match(String(pattern), subject, matches);

        if (matches.length === 0) {
            return '';
        }

        return matches[1] ?? matches[0];
    }

    /**
     * Get the string matching the given pattern.
     */
    public static matchAll(pattern: string | RegExp, subject: string): string[] {
        let matches: string[][] = [];
        preg_match_all(String(pattern), subject, matches);

        if (empty(matches[0])) {
            return [];
        }

        return matches[1] ?? matches[0];
    }

    /**
     * Get a new stringable object from the given string.
     */
    public static of(string?: string): Stringable {
        return new Stringable(string);
    }

    /**
     * Pad both sides of a string with another.
     */
    public static padBoth(value: string, length: number, pad: string = ' '): string {
        return mb_str_pad(value, length, pad, STR_PAD_BOTH);
    }

    /**
     * Pad the left side of a string with another.
     */
    public static padLeft(value: string, length: number, pad: string = ' '): string {
        return mb_str_pad(value, length, pad, STR_PAD_LEFT);
    }

    /**
     * Pad the right side of a string with another.
     */
    public static padRight(value: string, length: number, pad: string = ' '): string {
        return mb_str_pad(value, length, pad, STR_PAD_RIGHT);
    }

    /**
     * Generate a random, secure password.
     */
    public static password(
        length: number = 32,
        letters: boolean = true,
        numbers: boolean = true,
        symbols: boolean = true,
        spaces: boolean = false,
    ): string {
        const password: string[] = [];

        // prettier-ignore
        const options = {
            letters: letters
                ? [
                    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                ]
                : null,
            numbers: numbers ? ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] : null,
            symbols: symbols
                ? [
                    '~', '!', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '.', ';', ',', '<', '>', '?', '/', '\\', '{', '}', '[', ']', '|', ':', ';',
                ]
                : null,
            spaces: spaces ? [" "] : null,
        }

        const filteredOptions = Object.values(options)
            .filter((c) => c !== null)
            .flat();

        for (const group of Object.values(options)) {
            if (group) {
                password.push(group[random_int(0, group.length - 1)]);
            }
        }

        length = length - password.length;

        // Fill the rest from the full options pool
        for (let i = 0; i < length; i++) {
            password.push(filteredOptions[random_int(0, filteredOptions.length - 1)]);
        }

        // Shuffle array using Fisher-Yates
        for (let i = password.length - 1; i > 0; i--) {
            const j = random_int(0, i);
            [password[i], password[j]] = [password[j], password[i]];
        }

        return password.join('');
    }

    /**
     * Find the multi-byte safe position of the first occurrence of a given substring in a string.
     */
    public static position(haystack: string, needle: string, offset: number = 0): number | false {
        return mb_strpos(haystack, needle, offset);
    }

    /**
     * Generate a more truly "random" alpha-numeric string.
     */
    public static random(length: number = 16): string {
        return (
            Str.randomStringFactory ??
            ((length: number) => {
                let string = '';

                while (strlen(string) < length) {
                    const size = length - strlen(string);
                    const bytesSize = Math.ceil(size / 3) * 3;
                    const bytes = random_bytes(bytesSize);

                    string += substr(str_replace(['/', '+', '='], '', btoa(bytes)) as string, 0, size);
                }

                return string;
            })
        )(length);
    }

    /**
     * Remove any occurrence of the given string in the subject.
     */
    public static remove(
        search: string | string[],
        subject: string | string[],
        caseSensitive: boolean = true,
    ): string | string[] {
        return caseSensitive ? str_replace(search, '', subject as any) : str_ireplace(search, '', subject as any);
    }

    /**
     * Repeat the given string.
     */
    public static repeat(string: string, times: number): string {
        return string.repeat(times);
    }

    /**
     * Replace the given value in the given string.
     */
    public static replace(
        search: string | string[],
        replace: string | string[],
        subject: string | string[],
        caseSensitive: boolean = true,
    ): string | string[] {
        return caseSensitive
            ? str_replace(search, replace, subject as any)
            : str_ireplace(search, replace, subject as any);
    }

    /**
     * Replace a given value in the string sequentially with an array.
     */
    public static replaceArray(search: string, replace: string[], subject: string): string {
        const segments = explode(search, subject);

        let result = array_shift(segments);
        result = result ? result : '';

        for (const segment of segments) {
            result += Str.toStringOr(array_shift(replace) ?? search, search) + segment;
        }

        return result;
    }

    /**
     * Replace the last occurrence of a given value if it appears at the end of the string.
     */
    public static replaceEnd(search: string, replace: string, subject: string): string {
        if (search === '') {
            return subject;
        }

        if (Str.endsWith(subject, search)) {
            return Str.replaceLast(search, replace, subject);
        }

        return subject;
    }

    /**
     * Replace the first occurrence of a given value in the string.
     */
    public static replaceFirst(search: string, replace: string, subject: string): string {
        if (search === '') {
            return subject;
        }

        const position = strpos(subject, search);

        if (position !== false) {
            return substr_replace(subject, replace, position, mb_strlen(search)) as string;
        }

        return subject;
    }

    /**
     * Replace the last occurrence of a given value in the string.
     */
    public static replaceLast(search: string, replace: string, subject: string): string {
        if (search === '') {
            return subject;
        }

        const position = mb_strrpos(subject, search);

        if (position !== false) {
            return substr_replace(subject, replace, position, mb_strlen(search)) as string;
        }

        return subject;
    }

    /**
     * Replace the patterns matching the given regular expression.
     */
    public static replaceMatches(
        pattern: string | string[] | RegExp | RegExp[],
        replace: ((match: string[]) => string) | string | string[],
        subject: string | string[],
        limit: number = -1,
    ): string | string[] | null {
        if (pattern instanceof RegExp) {
            pattern = String(pattern);
        } else if (Array.isArray(pattern)) {
            pattern = pattern.map((p) => String(p));
        }

        if (typeof replace === 'function') {
            return preg_replace_callback(pattern, replace, subject as any, limit);
        }

        return preg_replace(pattern, replace, subject as any, limit);
    }

    /**
     * Replace the first occurrence of the given value if it appears at the start of the string.
     */
    public static replaceStart(search: string, replace: string, subject: string): string {
        if (search === '') {
            return subject;
        }

        if (Str.startsWith(subject, search)) {
            return Str.replaceFirst(search, replace, subject);
        }

        return subject;
    }

    /**
     * Reverse the given string.
     */
    public static reverse(value: string): string {
        return (array_reverse(mb_str_split(value)) as string[]).join('');
    }

    /**
     * Remove all whitespace from the end of a string.
     */
    public static rtrim(value: string, charlist?: string): string {
        if (charlist === undefined) {
            const rtrimDefaultCharacters = ' \n\r\t\v\0';

            return (preg_replace('~[\\s' + Str.INVISIBLE_CHARACTERS + rtrimDefaultCharacters + ']+$~u', '', value) ??
                value.trimEnd()) as string;
        }

        return rtrim(value, charlist);
    }

    /**
     * Convert a string to snake case.
     */
    public static snake(value: string, delimiter: string = '_'): string {
        const key = value;

        if (isset(Str.snakeCache[key]?.[delimiter])) {
            return Str.snakeCache[key][delimiter];
        }

        if (!ctype_lower(value)) {
            value = (preg_replace('/\\s+/u', '', ucwords(value)) ?? '') as string;
            value = Str.lower((preg_replace('/(.)(?=[A-Z])/u', '$1' + delimiter, value) ?? '') as string);
        }

        if (!Str.snakeCache[key]) {
            Str.snakeCache[key] = {};
        }

        Str.snakeCache[key][delimiter] = value;

        return value;
    }

    /**
     * Remove all "extra" blank space from the given string.
     */
    public static squish(value: string): string {
        return (preg_replace('~(\\s|\u3164|\u1160)+~u', ' ', Str.trim(value)) ?? '') as string;
    }

    /**
     * Begin a string with a single instance of a given value.
     */
    public static start(value: string, prefix: string): string {
        const quoted = preg_quote(prefix, '/');

        return prefix + preg_replace('/^(?:' + quoted + ')+/u', '', value);
    }

    /**
     * Determine if a given string starts with a given substring.
     */
    public static startsWith(haystack: string, needles: string | string[]): boolean {
        if (typeof needles === 'string') {
            needles = [needles];
        }

        for (const needle of needles) {
            if (needle !== '' && haystack.startsWith(needle)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Convert a value to studly caps case.
     */
    public static studly(value: string): string {
        const key = value;

        if (isset(Str.studlyCache[key])) {
            return Str.studlyCache[key];
        }

        const words = mb_split('\\s+', Str.replace(['-', '_'], ' ', value) as any);

        if (!words) {
            return '';
        }

        const studlyWords = array_map((word: string) => Str.ucfirst(word), words);

        return (Str.studlyCache[key] = studlyWords.join(''));
    }

    /**
     * Returns the portion of the string specified by the start and length parameters.
     */
    public static substr(string: string, start: number, length?: number): string {
        return mb_substr(string, start, length);
    }

    /**
     * Returns the number of substring occurrences.
     */
    public static substrCount(haystack: string, needle: string, offset: number = 0, length?: number): number {
        if (length !== undefined) {
            return substr_count(haystack, needle, offset, length);
        }

        return substr_count(haystack, needle, offset);
    }

    /**
     * Replace text within a portion of a string.
     */
    public static substrReplace(string: string, replace: string, offset: number = 0, length?: number): string {
        if (length === undefined) {
            length = strlen(string);
        }

        return substr_replace(string, replace, offset, length) as string;
    }

    /**
     * Swap multiple keywords in a string with other keywords.
     */
    public static swap(map: Record<string, string>, subject: string): string {
        return strtr(subject, map);
    }

    /**
     * Take the first or last {limit} characters of a string.
     */
    public static take(string: string, limit: number): string {
        if (limit < 0) {
            return Str.substr(string, limit);
        }

        return Str.substr(string, 0, limit);
    }

    /**
     * Convert the given string to proper case.
     */
    public static title(value: string): string {
        return mb_convert_case(value, MB_CASE_TITLE);
    }

    /**
     * Convert the given string to Base64 encoding.
     */
    public static toBase64(string: string): string {
        return base64_encode(string);
    }

    /**
     * Remove all whitespace from both ends of a string.
     */
    public static trim(value: string, charlist?: string): string {
        if (charlist === undefined) {
            const trimDefaultCharacters = ' \n\r\t\v\0';

            return (preg_replace(
                '~^[\\s' +
                    Str.INVISIBLE_CHARACTERS +
                    trimDefaultCharacters +
                    ']+|[\\s' +
                    Str.INVISIBLE_CHARACTERS +
                    trimDefaultCharacters +
                    ']+$~u',
                '',
                value,
            ) ?? value.trim()) as string;
        }

        return trim(value, charlist);
    }

    /**
     * Make a string's first character uppercase.
     */
    public static ucfirst(string: string): string {
        return Str.upper(Str.substr(string, 0, 1)) + Str.substr(string, 1);
    }

    /**
     * Split a string into pieces by uppercase characters.
     */
    public static ucsplit(string: string): (string | number)[][] | string[] {
        return preg_split('/(?=\\p{Lu})/u', string, -1, [PREG_SPLIT_NO_EMPTY]);
    }

    /**
     * Unwrap the string with the given strings.
     */
    public static unwrap(value: string, before: string, after?: string): string {
        if (Str.startsWith(value, before)) {
            value = Str.substr(value, Str.length(before));
        }

        if (Str.endsWith(value, (after ??= before))) {
            value = Str.substr(value, 0, -Str.length(after));
        }

        return value;
    }

    /**
     * Convert the given string to upper-case.
     */
    public static upper(value: string): string {
        return value.toLocaleUpperCase();
    }

    /**
     * Get the number of words a string contains.
     */
    public static wordCount(string: string, characters?: string): number {
        return str_word_count(string, 0, characters) as number;
    }

    /**
     * Wrap a string to a given number of characters.
     */
    public static wordWrap(
        string: string,
        characters: number = 75,
        breakStr: string = '\n',
        cutLongWords: boolean = false,
    ): string {
        return wordwrap(string, characters, breakStr, cutLongWords);
    }

    /**
     * Limit the number of words in a string.
     */
    public static words(value: string, words: number = 100, end: string = '...'): string {
        let matches: string[] = [];
        preg_match('/^\\s*(?:\\S+\\s*){1,' + words + '}/u', value, matches);

        if (!isset(matches[0]) || Str.length(value) === Str.length(matches[0])) {
            return value;
        }

        return matches[0].trimEnd() + end;
    }

    /**
     * Wrap the string with the given strings.
     */
    public static wrap(value: string, before: string, after?: string): string {
        return before + value + (after ?? before);
    }

    /**
     * Convert the given value to a string or return the given fallback on failure.
     */
    private static toStringOr(value: any, fallback: string): string {
        try {
            return String(value);
        } catch {
            return fallback;
        }
    }
}
