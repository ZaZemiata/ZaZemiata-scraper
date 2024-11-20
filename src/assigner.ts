/**
 * Assigner
 * 
 * @module bot.ts
 * @author Daniel Dimitrov <danieldimitrov2304@gmail.com>
 * @description This module is responsible for assigning crawl tasks for the bot.
 */

// Import dependencies
import { CrawlTaskStatus } from "@prisma/client";
import prisma from "./db/prisma/prisma";
import logger from "./utils/logger";

export const assignCrawlTasks = async (): Promise<void> => {

    // Fetch all sources
    const sources = await prisma.source.findMany({ where: { active: true } });

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

            // Log message
            logger.info(`Assigning new crawl task for ${source.site_name}`);

            // Create new crawl task
            await prisma.crawlTask.create({
                data: {
                    status: CrawlTaskStatus.PENDING,
                    source: { connect: { id: source.id } },
                    created_at: now
                }
            });

            // Update last scrape time
            await prisma.source.update({
                where: { id: source.id },
                data: { last_scrape_time: now }
            });
        }
    }
}