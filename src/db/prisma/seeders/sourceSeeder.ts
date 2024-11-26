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
                site_name: 'Ruse',
                worker_name: 'Ruse',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 200,
                site_name: 'Sofia',
                worker_name: 'Sofia',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 300,
                site_name: 'Plovdiv',
                worker_name: 'Plovdiv',
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