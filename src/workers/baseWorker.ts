/**
 * Base Worker
 * 
 * @module baseWorker.ts
 * @author Daniel Dimitrov <danieldimitrov2304@gmail.com>
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
    public context: WorkerData;

    // Constructor
    constructor() {

        // No parent port
        if (!parentPort)
            throw new Error('Not running in a worker thread');

        // Initialize the context
        this.context = workerData;

        // Automatically listen for incoming messages
        parentPort.on('message', async (message: { call: string }) => {

            // Extract the call from the message
            const { call } = message;

            // Prepare for errors
            try {

                // Dynamically invoke the method
                await (this as any)[call]();

            } 

            // Catch errors
            catch (error) {

                // Log the error
                logger.error(`Error in worker call '${call}':`, error);

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
