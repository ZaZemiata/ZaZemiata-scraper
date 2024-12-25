import prisma from "../prisma";
import logger from "../../../utils/logger";

// Seeder class for the sourceUrls table
export default class UserSeeder {

    // Drops all records from the sourceUrls table
    async drop() {

        // Prepare for errors
        try {

            // Drop all records from the sourceUrls table
            await prisma.users.deleteMany();

            // Log success
            logger.info("All records in the users table have been deleted.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error dropping records from users table:", error);

            // Rethrow the error
            throw error;
        }
    }

    // Seeds the sourceUrls table with new records
    async seed() {

        // Prepare data
        const data = [
            {
                email: 'admin@abv.bg',
                password: '$2b$10$fK3rEgBNocBhuxuiRX7Jv.WWuEmq5YI9m5CW88qkCSOh1QjFKZnBS', // 'admin'
                is_admin: true,
                created_at: new Date(),
            },
            {
                email: 'user@abv.bg',
                password: '$2b$10$fK3rEgBNocBhuxuiRX7Jv.WWuEmq5YI9m5CW88qkCSOh1QjFKZnBS', // 'admin'
                is_admin: false,
                created_at: new Date(),
            }
        ];

        // Prepare for errors
        try {

            // Seed the sourceUrls table
            await prisma.users.createMany({ data });

            // Log success
            logger.info("Users table seeded successfully.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error seeding Users table:", error);

            // Rethrow the error
            throw error;
        }
    }
}