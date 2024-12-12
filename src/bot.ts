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
import { CrawlTaskStatus } from '@prisma/client';
import WorkerMessage from './types/workerMessage';
import filterEntriesByKeywords from './utils/botUtils/filterEntriesByKeywords';

// Constants
const MAX_CONCURRENT_WORKERS = os.cpus().length - 1;

// Variables
let activeWorkers = 0;

export const crawlPendingTasks = async (): Promise<void> => {

    // Log starting message
    logger.info('Crawling pending tasks...');

    // Fetch pending tasks
    const pendingTasks = await prisma.crawlTasks.findMany({
        where: { status: CrawlTaskStatus.PENDING },
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

            // Increment worker count
            activeWorkers++;

            // Log message
            logger.info(`Crawling task for ${source.site_name} with id ${source.id}...`);

            // Update task status to in-progress
            await prisma.crawlTasks.update({
                where: { id: task.id },
                data: { status: CrawlTaskStatus.IN_PROGRESS },
            });

        });

        // Listen for messages from worker
        worker.on('message', async (message: WorkerMessage) => {

            // Prepare for errors
            try {

                // Check if the message indicates a completed task
                if (message.status === 'completed') {

                    // Validate that the message data is an array
                    if (!Array.isArray(message.data)) {
                        throw new Error('Message data is not an array.');
                    }

                    // Loop though each entry of message.data and check if it is of type CrawledDataEntry
                    const crawledDataEntries: CrawledDataEntry[] = message.data.map((entry, index) => {

                        // Check if the entry is either object or null
                        if (typeof entry !== 'object' || entry === null)
                            throw new Error(`Entry at index ${index} is not a valid object.`);

                        // Separate required fields from the entry
                        const { text, source_url_id, date, contractor } = entry;

                        // Check if text field is of type string
                        if (typeof text !== 'string')
                            throw new Error(`Entry at index ${index} has invalid 'text' property.`);


                        // Check if sourceUrlId field is of type bigint
                        if (typeof source_url_id !== 'bigint')
                            throw new Error(`Entry at index ${index} has invalid 'sourceUrlId' property.`);


                        // Check if date field is of type Date
                        if (!(date instanceof Date))
                            throw new Error(`Entry at index ${index} has invalid 'date' property.`);


                        // Check if contractor field is of type string
                        if (typeof contractor !== 'string')
                            throw new Error(`Entry at index ${index} has invalid 'contractor' property.`);

                        // Save the new validated CrawledData object
                        return { text, source_url_id, date, contractor };
                    });

                    // Filter entries to include only those that match keywords
                    const filteredEntries: CrawledDataEntry[] = await filterEntriesByKeywords(crawledDataEntries);

                    await prisma.crawledData.createMany({ data: filteredEntries, skipDuplicates: true });

                    // Update task status to completed
                    await prisma.crawlTasks.update({
                        where: { id: task.id },
                        data: { status: CrawlTaskStatus.COMPLETED, completed_at: new Date() },
                    });

                    // Log success
                    logger.info(`Task completed for ${source.site_name} with id ${source.id}.`);

                } else if (message.status === 'error') {

                    // Handle worker error
                    throw new Error(message.error || 'Worker task error.');
                }

                // Proceed if error
            } catch (error) {

                // Use a type guard to handle 'unknown'
                if (error instanceof Error) {
                    logger.error(`Error in task for ${source.site_name} with id ${source.id}: ${error.message}`);

                    // Update crawl task status to 'FAILED'
                    await prisma.crawlTasks.update({
                        where: { id: task.id },
                        data: {
                            status: CrawlTaskStatus.FAILED,
                            error: error.message,
                        },
                    });
                } else {

                    // Handle non-Error cases
                    logger.error(`Unknown error in task for ${source.site_name} with id ${source.id}`);
                }
            }
        });

        // Listen for worker exit
        worker.on('exit', async (code) => {

            // Decrement active worker count
            activeWorkers--;

            // Log message if worker didn't exit properly
            if (code !== 0) logger.error(`Worker stopped with exit code ${code}`);

        });

    }

}
