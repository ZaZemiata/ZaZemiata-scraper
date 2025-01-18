import prisma from "../prisma";
import logger from "../../../utils/logger";

// Seeder class for the triggers
export default class TriggerSeeder {

    // Drops the trigger and associated function
    async drop() {

        // Prepare for errors
        try {

            // Drop the trigger first
            await prisma.$executeRawUnsafe(`
                DROP TRIGGER IF EXISTS "CrawlTasksBeforeUpdate" ON "CrawlTasks";
            `);
    
            // Drop the associated function
            await prisma.$executeRawUnsafe(`
                DROP FUNCTION IF EXISTS crawl_tasks_before_update_function CASCADE;
            `);

            // Log success
            logger.info("Trigger and function dropped successfully.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error dropping trigger or function:", error);

            // Rethrow the error
            throw error;
        }
    }

    // Seeds the trigger and associated function
    async seed() {
        try {
            
            // Create the trigger function
            await prisma.$executeRawUnsafe(`
                CREATE OR REPLACE FUNCTION crawl_tasks_before_update_function()
                RETURNS TRIGGER AS $$
                BEGIN
                    IF NEW.status = 'COMPLETED' THEN
                        NEW.crawl_duration_seconds := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.created_at));
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `);

            // Create the trigger
            await prisma.$executeRawUnsafe(`
                CREATE TRIGGER CrawlTasksBeforeUpdate
                BEFORE UPDATE ON "CrawlTasks"
                FOR EACH ROW
                EXECUTE FUNCTION crawl_tasks_before_update_function();
            `);

            logger.info("Trigger and function created successfully.");
        } catch (error) {
            logger.error("Error creating trigger or function:", error);
            throw error;
        }
    }
}
