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
                display_name: 'РИОСВ - Благоевград',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 200,
                site_name: 'Burgas',
                worker_name: 'burgas',
                display_name: 'РИОСВ - Бургас',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 300,
                site_name: 'Varna',
                worker_name: 'varna',
                display_name: 'РИОСВ - Варна',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 400,
                site_name: 'Vraca',
                worker_name: 'vraca',
                display_name: 'РИОСВ - Враца',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 500,
                site_name: 'Veliko Tarnovo',
                worker_name: 'velikoTarnovo',
                display_name: 'РИОСВ - Велико Търново',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 600,
                site_name: 'Montana',
                worker_name: 'montana',
                display_name: 'РИОСВ - Монтана',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 700,
                site_name: 'Pazardzhik',
                worker_name: 'pazardzhik',
                display_name: 'РИОСВ - Пазарджик',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 800,
                site_name: 'Pleven',
                worker_name: 'pleven',
                display_name: 'РИОСВ - Плевен',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 900,
                site_name: 'Plovdiv',
                worker_name: 'plovdiv',
                display_name: 'РИОСВ - Пловдив',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1000,
                site_name: 'Ruse',
                worker_name: 'ruse',
                display_name: 'РИОСВ - Русе',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1100,
                site_name: 'Smolyan',
                worker_name: 'smolyan',
                display_name: 'РИОСВ - Смолян',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1200,
                site_name: 'Sofia',
                worker_name: 'sofia',
                display_name: 'РИОСВ - София',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1300,
                site_name: 'Stara Zagora',
                worker_name: 'staraZagora',
                display_name: 'РИОСВ - Стара Загора',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1400,
                site_name: 'Haskovo',
                worker_name: 'haskovo',
                display_name: 'РИОСВ - Хасково',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1500,
                site_name: 'Shumen',
                worker_name: 'shumen',
                display_name: 'РИОСВ - Шумен',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1600,
                site_name: 'EEA',
                worker_name: 'eea',
                display_name: 'Изпълнителната агенция по околна среда (ИАОС)',
                scrape_frequency_seconds: 5,
                active: true,
                created_at: new Date(),
            },
            {
                id: 1700,
                site_name: 'MOEW',
                worker_name: 'moew',
                display_name: 'Министерството на околната среда и водите (МОСВ)',
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