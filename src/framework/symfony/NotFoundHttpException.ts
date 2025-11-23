/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpException } from './HttpException.ts';

/**
 * @author Fabien Potencier <fabien@symfony.com>
 */
export class NotFoundHttpException extends HttpException {
    public constructor(message: string = '', previous?: Error, code: number = 0, headers: unknown[] = []) {
        //         parent::__construct(404, $message, $previous, $headers, $code);
    }
}
