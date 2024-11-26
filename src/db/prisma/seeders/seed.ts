import prisma from "../prisma";
import logger from "../../../utils/logger";

// Import individual seeders
import seedKeyWords from "./keyWordsSeeder";
import seedSettings from "./settingsSeeder";
import seedSources from "./sourceSeeder";
import seedSourceUrls from "./sourceUrlSeeder";
import seedCrawledData from "./crawledDataSeeder";

async function seed() {
    try {
        // Clear all tables
        logger.info("Clearing all tables...");

        await prisma.keyWords.deleteMany();
        await prisma.settings.deleteMany();
        await prisma.crawledData.deleteMany();
        await prisma.sourceUrls.deleteMany();
        await prisma.sources.deleteMany();

        logger.info("All tables cleared successfully.");

        // Run each seeder in sequence
        logger.info("Seeding data...");

        await seedKeyWords();
        await seedSettings();
        await seedSources();
        await seedSourceUrls();
        await seedCrawledData();

        logger.info("Database seeded successfully!");
    } catch (error) {
        logger.error("Error during seeding:", error);
    } finally {
        // Disconnect from the database
        await prisma.$disconnect();
    }
}

// Run the seed function
seed();
