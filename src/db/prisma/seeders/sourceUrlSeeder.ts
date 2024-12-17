import prisma from "../prisma";
import logger from "../../../utils/logger";
import { url } from "inspector";

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
                url: 'https://riosvbl.org/index.php/2013-10-16-16-09-59/first-note',
                active: true,
                created_at: new Date(),
                source_id: 100,
            },
            {
                id: 200,
                url: 'https://riosvbs.com/home/menu/1252',
                active: true,
                created_at: new Date(),
                source_id: 200,
            },
            {
                id: 300,
                url: 'https://riosv-varna.bg/prevenciya/saobshteniya-za-parvo-uvedomyavane-za-investicionni-predlozheniya/',
                active: true,
                created_at: new Date(),
                source_id: 300,
            },
            {
                id: 400,
                url: 'https://riosv.vracakarst.com/bg/uvedomleniya-za-investitsionni-namereniya',
                active: true,
                created_at: new Date(),
                source_id: 400,
            },
            {
                id: 500,
                url: 'https://www.riosvt.org/ovos/uvedomlenia/',
                active: true,
                created_at: new Date(),
                source_id: 500,
            },
            {
                id: 600,
                url: 'https://www.riosvt.org/ovos/uvedomlenia/',
                active: true,
                created_at: new Date(),
                source_id: 600,
            },
            {
                id: 700,
                url: 'https://new.riewpz.org/main.php?module=info&object=info&action=view&inf_id=169',
                active: true,
                created_at: new Date(),
                source_id: 700,
            },
            {
                id: 800,
                url: 'https://riew-pleven.eu/OVOS_IP.html',
                active: true,
                created_at: new Date(),
                source_id: 800,
            },
            {
                id: 900,
                url: 'https://plovdiv.riew.gov.bg/main.php?module=documents&object=category&action=list&doc_cat_id=42',
                active: true,
                created_at: new Date(),
                source_id: 900,
            },
            {
                id: 1000,
                url: 'https://www.riosv-ruse.org/protzeduri/protzeduri-po-glava-shesta-ot-zoos/content/40-saobshteniya-po-chl-8-al-4-ot-naredbata-za-eo',
                active: true,
                created_at: new Date(),
                source_id: 1000,
            },
            {
                id: 1001,
                url: 'https://www.riosv-ruse.org/protzeduri/protzeduri-po-glava-shesta-ot-zoos/content/8-eo',
                active: true,
                created_at: new Date(),
                source_id: 1000,
            },
            {
                id: 1100,
                url: 'https://smolyan.riosv.com/main.php?module=news&object=category&action=list&nws_cat_id=4',
                active: true,
                created_at: new Date(),
                source_id: 1100,
            },
            {
                id: 1200,
                url: 'https://www.riew-sofia.org/index.php/2014-02-03-03-01-44/2000?layout=edit&id=521',
                active: true,
                created_at: new Date(),
                source_id: 1200,
            },
            {
                id: 1300,
                url: 'https://stz.riew.gov.bg/2024_godina-c484',
                active: true,
                created_at: new Date(),
                source_id: 1300,
            },
            {
                id: 1400,
                url: 'https://haskovo.riosv.com/main.php?module=content&cnt_id=1',
                active: true,
                created_at: new Date(),
                source_id: 1400,
            },
            {
                id: 1500,
                url: 'https://riosv-shumen.eu/index.php?homepage=7&subnavy=1&act=116',
                active: true,
                created_at: new Date(),
                source_id: 1500,
            },
            {
                id: 1600,
                url: 'https://eea.government.bg/bg/obyavi/notices',
                active: true,
                created_at: new Date(),
                source_id: 1600,
            },
            {
                id: 1700,
                url: 'https://www.moew.government.bg/bg/prevantivna-dejnost/ovos/obyavleniya-po-chl-16-al-3-ot-naredbata-za-ovos-vuv-vruzka-s-chl-94-al-1-t-9-ot-zoos/',
                active: true,
                created_at: new Date(),
                source_id: 1700,
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