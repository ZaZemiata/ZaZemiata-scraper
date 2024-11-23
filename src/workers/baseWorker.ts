/**
 * Base Worker
 * 
 * @module baseWorker.ts
 * @author Daniel Dimitrov <danieldimitrov2304@gmail.com>
 * @description This module is providing a base class for worker threads.
 */

// Import dependencies

// BaseWorker class
export default class BaseWorker {

    // Constructor
    constructor() {
       
        throw new Error('Method not implemented.');
    }


    // Abstract method for derived workers
    protected run(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
