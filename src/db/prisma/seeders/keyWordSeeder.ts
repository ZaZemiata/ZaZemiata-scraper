import prisma from "../prisma";
import logger from "../../../utils/logger";

// Enum for priorities to ensure type correctness
enum Priority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL",
}

// Seeder class for the keyWords table
export default class KeyWordSeeder {

     //Drops all records from the keyWords table
    async drop() {

        // Prepare for errors
        try {

            // Drop all records from the keyWords table
            await prisma.keyWords.deleteMany();

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

        // Prepare data
        const data = [
            {
                word: "Отпадъци",
                priority: Priority.HIGH,
                active: true,
                created_at: new Date(),
            },
            {
                word: "Алтернативно гориво, Алтернативни горива",
                priority: Priority.CRITICAL,
                active: true,
                created_at: new Date(),
            },
            {
                word: "РДФ, RDF",
                priority: Priority.HIGH,
                active: true,
                created_at: new Date(),
            },
            {
                word: "Инсинератор",
                priority: Priority.MEDIUM,
                active: true,
                created_at: new Date(),
            },
            {
                word: "Изгаряне",
                priority: Priority.MEDIUM,
                active: true,
                created_at: new Date(),
            },
            {
                word: "Пиролиза",
                priority: Priority.LOW,
                active: true,
                created_at: new Date(),
            },
            {
                word: "Газификация",
                priority: Priority.HIGH,
                active: true,
                created_at: new Date(),
            },
            {
                word: "Плазма",
                priority: Priority.CRITICAL,
                active: true,
                created_at: new Date(),
            },
            {
                word: "Химическо рециклиране",
                priority: Priority.MEDIUM,
                active: true,
                created_at: new Date(),
            },
            {
                word: "Термично третиране",
                priority: Priority.LOW,
                active: true,
                created_at: new Date(),
            },
        ];
        try {

            // Seed the keyWords table with the prepared data
            await prisma.keyWords.createMany({ data });

            // Log success
            logger.info("keyWords table seeded successfully.");
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