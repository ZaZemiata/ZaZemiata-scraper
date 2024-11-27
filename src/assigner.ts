/**
 * Assigner
 *
 * @module assigner.ts
 * @author Daniel Batanov <batanoff.s@protonmail.com>
 * @description This module is responsible for assigning crawl tasks for the bot.
 */

// Import dependencies
import prisma from "./db/prisma/prisma";
import logger from "./utils/logger";

// Declare and define constant for crawl task status.
// Better to move it but where to? Suggestion db/prisma/constants - file constants.ts
const CRAWL_TASK_STATUS = {
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
};

export const assignCrawlTasks = async (): Promise<void> => {

    // Fetch all sources
    const sources = await prisma.sources.findMany({ where: { active: true } });

    // Loop through each source and assign new crawl task if required
    for (const source of sources) {

        // Get current time
        const now = new Date();

        // Calculate time since last scrape
        const timeSinceLastScrape = source.last_scrape_time
            ? (now.getTime() - new Date(source.last_scrape_time).getTime()) /
              1000
            : Infinity;

        // Check if it's time to scrape again
        if (timeSinceLastScrape >= source.scrape_frequency_seconds) {

            // Check if crawl task is created for current source
            const getTask = await prisma.crawlTasks.findFirst({
                where: {
                    source: {
                        id: source.id,
                    },
                },
            });

            // If task is found
            if (getTask) {

                // Check if status is NOT pending or in-progress and create new one
                if (
                    getTask.status !== CRAWL_TASK_STATUS.PENDING ||
                    getTask.status !== CRAWL_TASK_STATUS.IN_PROGRESS
                ) {

                    // Create new task
                    await prisma.crawlTasks.create({
                        data: {
                            status: "PENDING",
                            source: { connect: { id: source.id } },
                            created_at: now,
                        },
                    });

                    // Log message
                    logger.info(`Assigning new crawl task for ${source.site_name}`);
                } else {
                    
                    // Log message
                    logger.info(`A task is already in progress or pending for ${source.site_name}`);
                }
            }

            if (!getTask) {

                // Create new task
                await prisma.crawlTasks.create({
                    data: {
                        status: "PENDING",
                        source: { connect: { id: source.id } },
                        created_at: now,
                    },
                });

                // Log message
                logger.info(`Assigning new crawl task for ${source.site_name}`);
            }
        }
    }
};
