import prisma from "../prisma";
import logger from "../../../utils/logger";

async function seedSources() {

    // Seeder not implemented
    throw new Error('Method not implemented.');
}

// Seed sources
seedSources().catch((error) => {

    // Log error
    logger.error('Error seeding sources:', error);
}).finally(() => {

    // Disconnect from database
    prisma.$disconnect();
})