// @ts-nocheck
import { Throwable } from '../contracts/php/Throwable.ts';

/**
 * Exception is the base class for
 * all Exceptions.
 * @link https://php.net/manual/en/class.exception.php
 */
export class Exception implements Throwable {
    /**
     * The error message
     * @var string
     */

    protected message: string;

    /** The error code */
    protected code: any;

    /** The filename where the error happened  */

    protected file: string;

    /** The line where the error happened */

    protected line: number;

    /**
     * Clone the exception
     * Tries to clone the Exception, which results in Fatal error.
     * @link https://php.net/manual/en/exception.clone.php
     * @return void
     */

    private __clone(): void {}

    /**
     * Construct the exception. Note: The message is NOT binary safe.
     * @link https://php.net/manual/en/exception.construct.php
     * @param string message [optional] The Exception message to throw.
     * @param int code [optional] The Exception code.
     * @param null|Throwable previous [optional] The previous throwable used for the exception chaining.
     */

    public __construct(message: string = '', code: number = 0, previous?: Throwable) {}

    /**
     * Gets the Exception message
     * @link https://php.net/manual/en/exception.getmessage.php
     * @return string the Exception message as a string.
     */

    public getMessage(): string {}

    /**
     * Gets the Exception code
     * @link https://php.net/manual/en/exception.getcode.php
     * @return mixed|int the exception code as integer in
     * <b>Exception</b> but possibly as other type in
     * <b>Exception</b> descendants (for example as
     * string in <b>PDOException</b>).
     */
    public getCode(): any {}

    /**
     * Gets the file in which the exception occurred
     * @link https://php.net/manual/en/exception.getfile.php
     * @return string the filename in which the exception was created.
     */

    public getFile(): string {}

    /**
     * Gets the line in which the exception occurred
     * @link https://php.net/manual/en/exception.getline.php
     * @return int the line number where the exception was created.
     */

    public getLine(): number {}

    /**
     * Gets the stack trace
     * @link https://php.net/manual/en/exception.gettrace.php
     * @return array the Exception stack trace as an array.
     */

    public getTrace(): any[] {}

    /**
     * Returns previous Exception
     * @link https://php.net/manual/en/exception.getprevious.php
     * @return null|Throwable Returns the previous {@see Throwable} if available, or <b>NULL</b> otherwise.
     * or null otherwise.
     */

    public getPrevious(): Throwable | undefined {}

    /**
     * Gets the stack trace as a string
     * @link https://php.net/manual/en/exception.gettraceasstring.php
     * @return string the Exception stack trace as a string.
     */

    public getTraceAsString(): string {}

    /**
     * String representation of the exception
     * @link https://php.net/manual/en/exception.tostring.php
     * @return string the string representation of the exception.
     */

    public __toString(): string {}

    public __wakeup(): void {}
}
