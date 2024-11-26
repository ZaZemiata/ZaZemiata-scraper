import prisma from "../prisma";
import logger from "../../../utils/logger";

// Seeder class for the sourceUrls table
export default class SourceUrlSeeder {

    // Drops all records from the sourceUrls table
    async drop() {

        // Prepare for errors
        try {

            // Drop all records from the sourceUrls table
            await prisma.sourceUrls.deleteMany();

            // Log success
            logger.info("All records in the sourceUrls table have been deleted.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error dropping records from sourceUrls table:", error);

            // Rethrow the error
            throw error;
        }
    }

    // Seeds the sourceUrls table with new records
    async seed() {

        // Prepare data
        const data = [
            {
                id: 100,
                url: 'https://www.riosv-ruse.org/protzeduri/protzeduri-po-glava-shesta-ot-zoos/content/37-obyavleniya-po-chl-95-al-1-ot-zoos',
                active: true,
                created_at: new Date(),
                source_id: 100,
            },
            {
                id: 101,
                url: 'https://www.riosv-ruse.org/protzeduri/protzeduri-po-chl-31-ot-zbr/content/14-pisma-do-vazlozhitelya',
                active: true,
                created_at: new Date(),
                source_id: 100,
            },
            {
                id: 200,
                url: 'https://www.riew-sofia.org/index.php/2014-02-03-03-01-44/2000?layout=edit&id=702',
                active: true,
                created_at: new Date(),
                source_id: 200,
            },
            {
                id: 201,
                url: 'https://www.riew-sofia.org/index.php/11-2014-02-03-02-30-58/181-2014-02-03-20-02-26',
                active: true,
                created_at: new Date(),
                source_id: 200,
            },
            {
                id: 300,
                url: 'https://plovdiv.riew.gov.bg/main.php?module=news&object=category&action=list&nws_cat_id=3',
                active: true,
                created_at: new Date(),
                source_id: 300,
            },
            {
                id: 301,
                url: 'https://plovdiv.riew.gov.bg/main.php?module=documents&object=category&action=list&doc_cat_id=42',
                active: true,
                created_at: new Date(),
                source_id: 300,
            },
        ];

        // Prepare for errors
        try {

            // Seed the sourceUrls table
            await prisma.sourceUrls.createMany({ data });

            // Log success
            logger.info("sourceUrls table seeded successfully.");
        } 
        
        // Catch errors
        catch (error) {

            // Log the error
            logger.error("Error seeding sourceUrls table:", error);

            // Rethrow the error
            throw error;
        }
    }
}