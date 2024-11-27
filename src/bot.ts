/**
 * Bot
 * 
 * @module bot.ts
 * @author Stoqn Kolev <jakeaceminus8@abv.bg>
 * @description This module is responsible for fulfilling pending tasks and processing the gathered data.
 */

// Import dependencies
import path from 'path';
import os from 'os';
import { Worker } from 'worker_threads';
import prisma from './db/prisma/prisma';
import logger from './utils/logger';
import WorkerData from './types/workerData';
import WorkerMessage from './types/workerMessage';

// Constants
const MAX_CONCURRENT_WORKERS = os.cpus().length - 1;

// Variables
let activeWorkers = 0;

export const crawlPendingTasks = async (): Promise<void> => {

    // Log starting message
    logger.info('Crawling pending tasks...');

    // Fetch pending tasks
    const pendingTasks = await prisma.crawlTasks.findMany({
        where: { status: 'PENDING' },
        include: {
            Sources: {
                include: {
                    SourceUrls: true, // Include SourceUrls for each Source
                },
            },
        },
        take: MAX_CONCURRENT_WORKERS - activeWorkers
    });

    // Loop though the tasks
    for (const task of pendingTasks) {
        // Get source urls for the task
        const source = task.Sources;

        // Check if source exists
        if (!source) {

            // Log info for the invalid task
            logger.info(`No source found for Task ID: ${task.id}`);

            // Skip the loop
            continue;
        }

        // Get the SourceUrls for the source
        const sourceUrls = source.SourceUrls;

        // Check if there are any URLs
        if (!sourceUrls || sourceUrls.length === 0) {

            // Log info for the invalid source
            logger.info(`No URLs found for Source ID: ${source.id}`);

            // Skip if no URLs are present
            continue;
        }

        // Prepare worker data
        const workerData: WorkerData[] = sourceUrls.map((sourceUrl) => ({
            sourceUrlId: sourceUrl.id,
            url: sourceUrl.url,
        }));


        // Create new worker thread
        const worker = new Worker(path.resolve(__dirname, `workers/${source.worker_name}.js`), { workerData });

        // Send message to the worker
        worker.postMessage({ command: 'run' });

        // Worker started
        worker.on('online', async () => {

            // Log message
            await logger.info(`Crawling task for ${source.site_name} with id ${source.id}...`);

            // Update task status to in-progress
            await prisma.crawlTasks.update({
                where: { id: task.id },
                data: { status: 'IN_PROGRESS' }
            });

        });

    }

}
