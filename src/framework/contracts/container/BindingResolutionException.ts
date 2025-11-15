import { Exception } from '../../php/Exception.ts';
import { ContainerExceptionInterface } from '../psr/ContainerExceptionInterface.ts';

export class BindingResolutionException extends Exception implements ContainerExceptionInterface {
    //
}
