import prisma from "../prisma";
import logger from "../../../utils/logger";

async function seedSources() {

    // Delete all crawled data
    await prisma.crawledData.deleteMany();

    // Delete all crawl tasks
    await prisma.crawlTask.deleteMany();

    // Delete all sources
    await prisma.source.deleteMany();

    // Seed sources
    await prisma.source.createMany({
        data: [
            {
                site_name: 'Random Names',
                url: 'https://randomuser.me',
                worker_name: 'randomNames',
                scrape_frequency_seconds: 5,
                active: true
            },
            {
                site_name: 'YouTube',
                url: 'https://www.youtube.com/',
                worker_name: 'youTube',
                scrape_frequency_seconds: 5,
                active: true
            },
            {
                site_name: 'Mobile.bg',
                url: 'https://www.mobile.bg/',
                worker_name: 'mobileBg',
                scrape_frequency_seconds: 5,
                active: true
            }
        ]
    });
}

// Seed sources
seedSources().catch((error) => {

    // Log error
    logger.error('Error seeding sources:', error);
}).finally(() => {

    // Disconnect from database
    prisma.$disconnect();
})