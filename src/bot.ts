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
import WorkerData from './types/workerData';
import WorkerMessage from './types/workerMessage';
import logger from './utils/logger';

// Constants
const MAX_CONCURRENT_WORKERS = os.cpus().length - 1;

// Variables
let activeWorkers = 0;

export const crawlPendingTasks = async (): Promise<void> => {

    // Log message
    logger.info('Crawling pending tasks...');

    // Fetch pending tasks
    const pendingTasks = await prisma.crawlTask.findMany({
        where: { status: 'PENDING' },
        include: { source: true },
        take: MAX_CONCURRENT_WORKERS - activeWorkers
    });

    // Loop through each pending task
    for (const task of pendingTasks) {

        // Get source from task
        const source = task.source;

        // Skip if source is not found
        if (!source) continue;

        // Increment active worker count
        activeWorkers++;  // Increment active worker count

        // Define worker data
        const workerData: WorkerData = {
            url: source.url,
            sourceId: source.id
        };

        // Create new worker thread
        const worker = new Worker(path.resolve(__dirname, `workers/${source.worker_name}.js`), { workerData });

        worker.postMessage({ call: 'run' });

        // Worker started
        worker.on('online', async () => {

            // Log message
            logger.info(`Crawling task for ${source.site_name} with id ${source.id}...`);

            // Update task status to in-progress
            await prisma.crawlTask.update({
                where: { id: task.id },
                data: { status: 'IN_PROGRESS' }
            });

        });

        // Listen for messages from worker
        worker.on('message', async (message: WorkerMessage) => {

            // Receive completion message
            if (message.status === 'completed') {

                // Save crawled data
                await prisma.crawledData.create({
                    data: {
                        data: message.data?.text as string,  // Convert data to string
                        sourceId: message.data?.sourceId as string,  // Convert data to string
                    }
                });

                // Log message
                logger.info(`Task completed for ${source.site_name} with id ${source.id}.`, message.data);

                // Update task status to completed
                await prisma.crawlTask.update({
                    where: { id: task.id },
                    data: {
                        status: 'COMPLETED',
                        completed_at: new Date()
                    }
                });

                // Receive error message
            } else if (message.status === 'error') {

                // Log error
                logger.error(`Error in task for ${source.site_name} with id ${source.id}.`, message.error);

                // Update task status to error
                await prisma.crawlTask.update({
                    where: { id: task.id },
                    data: { status: 'ERROR', error: message.error }
                });
            }

        });

        // Listen for worker exit
        worker.on('exit', async (code) => {

            // Decrement active worker count
            activeWorkers--;

            // Log message
            if (code !== 0) logger.error(`Worker stopped with exit code ${code}`);

        });
    }
}
