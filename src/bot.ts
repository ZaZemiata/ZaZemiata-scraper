/**
 * Bot
 * 
 * @module bot.ts
 * @author Daniel Dimitrov <danieldimitrov2304@gmail.com>
 * @description This module is responsible for fulfilling pending tasks and processing the gathered data.
 */

// Import dependencies
import path from 'path';
import os from 'os';
import { Worker } from 'worker_threads';
import prisma from './db/prisma/prisma';

// Constants
const MAX_CONCURRENT_WORKERS = os.cpus().length - 1;

// Variables
let activeWorkers = 0;

export const crawlPendingTasks = async (): Promise<void> => {

    // Method not implemented
    throw new Error('Method not implemented.');
}
