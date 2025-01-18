import prisma from "../prisma";
import logger from "../../../utils/logger";

// Seeder class for the keyWords table
export default class CrawlTaskSeeder {

    //Drops all records from the keyWords table
    async drop() {

        // Prepare for errors
        try {

            // Drop all records from the keyWords table
            await prisma.crawlTasks.deleteMany();

            // Log success
            logger.info("All records in the keyWords table have been deleted.");
        }

        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error dropping records from keyWords table:", error);

            // Rethrow the error
            throw error;
        }
    }

    // Seeds the keyWords table with new records
    async seed() {

        try {
            
            // Log success
            //logger.info("keyWords table seeded successfully.");
        }

        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error seeding keyWords table:", error);

            // Rethrow the error
            throw error;
        }
    }
}