import prisma from "../prisma";
import logger from "../../../utils/logger";

import SourceSeeder from "./sourceSeeder";
import SourceUrlSeeder from "./sourceUrlSeeder";
import SettingsSeeder from "./settingSeeder";
import CrawledDataSeeder from "./crawledDataSeeder";
import KeyWordSeeder from "./keyWordSeeder";
import UserSeeder from "./userSeeder";
import CrawlTaskSeeder from "./crawlTaskSeeder";
import TriggerSeeder from "./triggerSeeder";

// Seeder class for the global seeding process
class Seeder {

    // Create instances of individual seeders
    sourceSeeder = new SourceSeeder();
    sourceUrlSeeder = new SourceUrlSeeder();
    settingsSeeder = new SettingsSeeder();
    crawledDataSeeder = new CrawledDataSeeder();
    keyWordSeeder = new KeyWordSeeder();
    userSeeder = new UserSeeder();
    triggerSeeder = new TriggerSeeder();
    crawlTaskSeeder = new CrawlTaskSeeder();

    // Drops all data in the correct order by calling drop methods of individual seeders.
    async drop() {

        // Log the start of the process
        logger.info("Starting to drop data...");

        try {
            // Call drop methods in the correct order
            await this.crawlTaskSeeder.drop();
            await this.crawledDataSeeder.drop();
            await this.sourceUrlSeeder.drop();
            await this.settingsSeeder.drop();
            await this.sourceSeeder.drop();
            await this.keyWordSeeder.drop();
            await this.userSeeder.drop();
            await this.triggerSeeder.drop();
        }
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error while dropping data:", error);

            // Rethrow the error
            throw error;
        }
    }

    // Seeds all data in the correct order by calling seed methods of individual seeders.
    async seed() {

        // Log the start of the process
        logger.info("Starting to seed data...");

        // Prepare for errors
        try {

            // Call seed methods in the correct order
            await this.sourceSeeder.seed();
            await this.sourceUrlSeeder.seed();
            await this.settingsSeeder.seed();
            await this.keyWordSeeder.seed();
            await this.crawledDataSeeder.seed();
            await this.crawlTaskSeeder.seed();
            await this.userSeeder.seed();
            await this.triggerSeeder.seed();
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error while seeding data:", error);

            // Rethrow the error
            throw error;
        }
    }

    // Executes the full seeding process: drop and then seed.
    async execute() {

        // Log the start of the process
        logger.info("Starting global seeding process...");

        try {

            // Call drop and seed methods
            await this.drop();
            await this.seed();

            // Log success
            logger.info("Global seeding process completed successfully.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error during global seeding process:", error);
        } 
        
        // Finally
        finally {

            // Disconnect from the database
            await prisma.$disconnect();
        }
    }
}

// Execute the global seeder
(async () => {

    // Create an instance of the global seeder
    const globalSeeder = new Seeder();

    // Execute
    await globalSeeder.execute();
})();