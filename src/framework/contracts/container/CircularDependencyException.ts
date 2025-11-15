import { Exception } from '../../php/Exception.ts';
import { ContainerExceptionInterface } from '../psr/ContainerExceptionInterface.ts';

export class CircularDependencyException extends Exception implements ContainerExceptionInterface {
    //
}
