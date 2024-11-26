import prisma from "../prisma";
import logger from "../../../utils/logger";

// Seeder class for the settings table
export default class SettingSeeder {

    // Drops all records from the settings table
    async drop() {

        // Prepare for errors
        try {

            // Drop all records from the settings table
            await prisma.settings.deleteMany();

            // Log success
            logger.info("All records in the settings table have been deleted.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error dropping records from settings table:", error);

            // Rethrow the error
            throw error;
        }
    }

    // Seeds the settings table with new records
    async seed() {

        // Prepare data
        const data = [
            {
                id: 1,
                name: "Site Maintenance",
                value: "enabled",
                active: true,
                created_at: new Date(),
                source_id: 100,
            },
            {
                id: 2,
                name: "Data Refresh Interval",
                value: "30 minutes",
                active: true,
                created_at: new Date(),
                source_id: 200,
            },
            {
                id: 3,
                name: "API Rate Limit",
                value: "100 requests per minute",
                active: true,
                created_at: new Date(),
                source_id: 300,
            },
            {
                id: 4,
                name: "Data Retention Period",
                value: "6 months",
                active: true,
                created_at: new Date(),
                source_id: 100,
            },
            {
                id: 5,
                name: "Notification Settings",
                value: "enabled",
                active: true,
                created_at: new Date(),
                source_id: 200,
            },
        ];

        // Prepare for errors
        try {

            // Seed the settings table with the prepared data
            await prisma.settings.createMany({ data });

            // Log success
            logger.info("Settings table seeded successfully.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error seeding settings table:", error);

            // Rethrow the error
            throw error;
        }
    }
}