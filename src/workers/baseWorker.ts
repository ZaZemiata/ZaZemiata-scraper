/**
 * Base Worker
 * 
 * @module baseWorker.ts
 * @author Stoqn Kolev <jakeaceminus8@abv.bg>
 * @description This module is providing a base class for worker threads.
 */

// Import dependencies
import { parentPort, workerData } from 'worker_threads';
import WorkerData from '../types/workerData';
import WorkerMessage from '../types/workerMessage';
import logger from '../utils/logger';

// BaseWorker class
export default class BaseWorker {

    // Properties
    public context: WorkerData[];

    // Constructor
    constructor() {

        // Check if the worker is running on the parent port
        if (!parentPort)
            throw new Error('Not running in a worker thread');

        // Ensure workerData is an array
        if (!Array.isArray(workerData))
            throw new Error('Worker data must be an array');

        // Initialize the context
        this.context = workerData;

        // Automatically listen for incoming messages
        parentPort.on('message', async (message: { command: string }) => {

            // Extract the call from the message
            const { command } = message;

            // Prepare for errors
            try {

                // Skip processing if worker data is empty
                if (this.context.length === 0) {
                    logger.warn('Worker data array is empty. Skipping processing.');

                    // Exit the worker
                    process.exit(0);
                }

                // Dynamically invoke the method for all worker data
                await (this as any)[command]();

            }

            // Catch errors
            catch (error) {

                // Log the error
                logger.error(`Error in worker call '${command}':`, error);

                // Build an error message
                const errorMessage: WorkerMessage = {
                    status: 'error',
                    error: (error as Error).message,
                };

                // Publish the error message
                await this.publishMessage(errorMessage);
            }
        });
    }

    // Publish a message to the parent thread
    public async publishMessage(message: WorkerMessage) {

        // Prepare for errors
        try {

            // Send the message to the parent thread
            parentPort?.postMessage(message);

        }

        // Catch errors
        catch (error) {

            // Log the error
            logger.error(error);
        }
    }

    // Abstract method for derived workers
    protected run(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
