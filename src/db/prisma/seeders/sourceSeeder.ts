import prisma from "../prisma";
import logger from "../../../utils/logger";

// Seeder class for the sources table
export default class SourceSeeder {

    // Drops all records from the sources table
    async drop() {

        // Prepare for errors
        try {

            // Drop all records from the sources table
            await prisma.sources.deleteMany();

            // Log success
            logger.info("All records in the sources table have been deleted.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error dropping records from sources table:", error);

            // Rethrow the error
            throw error;
        }
    }

    // Seeds the sources table with new records
    async seed() {

        // Prepare data
        const data = [
            {
                id: 100,
                site_name: 'Blagoevgrad',
                worker_name: 'blagoevgrad',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 200,
                site_name: 'Burgas',
                worker_name: 'burgas',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 300,
                site_name: 'Varna',
                worker_name: 'varna',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 400,
                site_name: 'Vraca',
                worker_name: 'vraca',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 500,
                site_name: 'Veliko Turnovo',
                worker_name: 'veliko turnovo',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 600,
                site_name: 'Montana',
                worker_name: 'montana',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 700,
                site_name: 'Pzarardjik',
                worker_name: 'pazardjik',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 800,
                site_name: 'Pleven',
                worker_name: 'pleven',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 900,
                site_name: 'Plovdiv',
                worker_name: 'plovdiv',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1000,
                site_name: 'Ruse',
                worker_name: 'ruse',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1100,
                site_name: 'Smolyan',
                worker_name: 'smolyan',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1200,
                site_name: 'Sofia',
                worker_name: 'sofia',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1300,
                site_name: 'Stara Zagora',
                worker_name: 'stara zagora',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1400,
                site_name: 'Haskovo',
                worker_name: 'haskovo',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1500,
                site_name: 'Shumen',
                worker_name: 'shumen',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1600,
                site_name: 'EEA',
                worker_name: 'eea',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1700,
                site_name: 'MOEW',
                worker_name: 'moew',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            
        ];

        // Prepare for errors
        try {

            // Seed the sources table
            await prisma.sources.createMany({ data });

            // Log success
            logger.info("Sources table seeded successfully.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error seeding sources table:", error);

            // Rethrow the error
            throw error;
        }
    }
}