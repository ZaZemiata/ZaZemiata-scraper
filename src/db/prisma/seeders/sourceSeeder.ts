import prisma from "../prisma";
import logger from "../../../utils/logger";

export default async function seedSources() {

    // Delete all records from sources table
    await prisma.sources.deleteMany();

    // Seed the database with new records
    await prisma.sources.createMany({
        data: [
            {
                id: 100,
                site_name: 'Ruse',
                worker_name: 'Ruse',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date()
            },
            {
                id: 200,
                site_name: 'Sofia',
                worker_name: 'Sofia',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date()
            },
            {
                id: 300,
                site_name: 'Plovdiv',
                worker_name: 'Plovdiv',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date()
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