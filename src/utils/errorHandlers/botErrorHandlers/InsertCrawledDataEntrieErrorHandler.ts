import logger from "../../logger";

const insertCrawledDataEntrieErrorHadler = (entry: CrawledDataEntry, errorMessage: string) => {

    // Ensure all BigInt values are converted to strings
    const sanitizedEntry = {
        ...entry,
        source_url_id: entry.source_url_id.toString(), // Convert BigInt to string
    };

    // Log the conflict entry
    logger.warn(`Failed to insert entry: ${JSON.stringify(sanitizedEntry)}. Skipping`);
};

export default insertCrawledDataEntrieErrorHadler;
