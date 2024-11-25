import prisma from "../prisma";
import logger from "../../../utils/logger";
import { SOURCE_IDS } from "../constants";

async function seedSourceUrls() {

    // Delete all records from source urls table
    await prisma.sourceUrls.deleteMany();

    // Find the existing sources with their id's
    const existingSourceRuse = await findSourceOrFail(BigInt(SOURCE_IDS.RUSE));
    const existingSourceSofia = await findSourceOrFail(BigInt(SOURCE_IDS.SOFIA));
    const existingSourcePlovdiv = await findSourceOrFail(BigInt(SOURCE_IDS.PLOVDIV));

    // Seed the database with new records
    await prisma.sourceUrls.createMany({
        data: [
            {
                id: 101,
                url: 'https://www.riosv-ruse.org/protzeduri/protzeduri-po-glava-shesta-ot-zoos/content/37-obyavleniya-po-chl-95-al-1-ot-zoos',
                active: true,
                created_at: new Date(),
                source_id: existingSourceRuse.id,
            },
            {
                id: 102,
                url: 'https://www.riosv-ruse.org/protzeduri/protzeduri-po-chl-31-ot-zbr/content/14-pisma-do-vazlozhitelya',
                active: true,
                created_at: new Date(),
                source_id: existingSourceRuse.id,
            },
            {
                id: 201,
                url: 'https://www.riew-sofia.org/index.php/2014-02-03-03-01-44/2000?layout=edit&id=702',
                active: true,
                created_at: new Date(),
                source_id: existingSourceSofia.id,
            },
            {
                id: 202,
                url: 'https://www.riew-sofia.org/index.php/11-2014-02-03-02-30-58/181-2014-02-03-20-02-26',
                active: true,
                created_at: new Date(),
                source_id: existingSourceSofia.id,
            },
            {
                id: 301,
                url: 'https://plovdiv.riew.gov.bg/main.php?module=news&object=category&action=list&nws_cat_id=3',
                active: true,
                created_at: new Date(),
                source_id: existingSourcePlovdiv.id,
            },
            {
                id: 302,
                url: 'https://plovdiv.riew.gov.bg/main.php?module=documents&object=category&action=list&doc_cat_id=42',
                active: true,
                created_at: new Date(),
                source_id: existingSourcePlovdiv.id,
            }
        ]
    });

}

// Helper to find source and ensure it exists
const findSourceOrFail = async (id: bigint) => {

    // Try to find the source associated with the provided id
    const source = await prisma.sources.findUnique({ where: { id } });

    // Check if the source is found
    if (!source) {
        throw new Error(`Source with ID ${id.toString()} does not exist.`);
    }

    // Return the source if found
    return source;
};

// Seed source urls
seedSourceUrls().catch((error) => {

    // Log error
    logger.error('Error seeding source urls:', error);
}).finally(() => {

    // Disconnect from database
    prisma.$disconnect();
})
