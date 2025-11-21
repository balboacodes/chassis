import PendingDispatch from '../../foundation/bus/PendingDispatch.ts';
import InputInterface from '../symfony/InputInterface.ts';
import OutputInterface from '../symfony/OutputInterface.ts';

export const Kernel = Symbol('Kernel');

export interface Kernel {
    /**
     * Bootstrap the application for artisan commands.
     */
    bootstrap(): void;

    /**
     * Handle an incoming console command.
     */
    handle(input: InputInterface, output?: OutputInterface): number;

    /**
     * Run an Artisan console command by name.
     */
    call(command: string, parameters: unknown[], outputBuffer?: OutputInterface): number;

    /**
     * Queue an Artisan console command by name.
     */
    queue(command: string, parameters: unknown[]): PendingDispatch;

    /**
     * Get all of the commands registered with the console.
     */
    all(): unknown[];

    /**
     * Get the output for the last run command.
     */
    output(): string;

    /**
     * Terminate the application.
     */
    terminate(input: InputInterface, status: number): void;
}
