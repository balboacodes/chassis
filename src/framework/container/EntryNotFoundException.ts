import { NotFoundExceptionInterface } from '../contracts/psr/NotFoundExceptionInterface.ts';
import { Exception } from '../php/Exception.ts';

export class EntryNotFoundException extends Exception implements NotFoundExceptionInterface {
    //
}
