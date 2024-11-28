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
import { CrawlTaskStatus } from "@prisma/client";

export const assignCrawlTasks = async (): Promise<void> => {

    // Prepare for errors
    try {
        
        // Fetch all sources
        const sources = await prisma.sources.findMany({ where: { active: true } });

        // Loop through each source and assign new crawl task if required
        for (const source of sources) {

            // Get current time
            const now = new Date();

            // Calculate time since last scrape
            const timeSinceLastScrape = source.last_scrape_time
                ? (now.getTime() - new Date(source.last_scrape_time).getTime()) / 1000
                : Infinity;

            // Check if it's time to scrape again
            if (timeSinceLastScrape >= source.scrape_frequency_seconds) {

                // Get crawl tasks for current source with status either pending or in progress
                const getTask = await prisma.crawlTasks.findFirst({
                    where: {
                        status: CrawlTaskStatus.PENDING || CrawlTaskStatus.IN_PROGRESS,
                        source_id: source.id,
                    },
                });

                // If task is found with that source id
                if (!getTask) {

                    // Create new task
                    await prisma.crawlTasks.create({
                        data: {
                            status: CrawlTaskStatus.PENDING,
                            source_id: source.id,
                            created_at: now,
                        },
                    });

                    // Log create message
                    logger.info(`Assigning new crawl task for ${source.site_name}`);
                }
            }
        }
    }
    
    // Catch errors
    catch (error) {

        // Log the error
        logger.error("Error assigning crawl tasks:", error);
    }
};
