import prisma from '../../db/prisma/prisma';

// Helper function to filter crawled data
const filterEntriesByKeywords = async (entry: CrawledDataEntry): Promise<boolean> => {
    
    // Fetch active keywords
    const keywords = await prisma.keyWords.findMany({ where: { active: true } });

    // Normalize keywords and entry text to lowercase for case-insensitive comparison
    const normalizedKeywords = keywords.map(keyword => keyword.word.toLowerCase());
    const normalizedText = entry.text.toLowerCase();

    // Check if the entry matches any of the keywords
    const matchesKeywords = normalizedKeywords.some(keyword => normalizedText.includes(keyword));

    // If the entry doesn't match keywords, return false early
    if (!matchesKeywords) return false;

    // Check if the entry already exists in the database
    const exists = await prisma.crawledData.findFirst({
        where: {
            text: entry.text,
            contractor: entry.contractor,
            source_url_id: entry.source_url_id,
        },
    });

    // Return true if it matches keywords and doesn't exist in the database
    return !exists;
};

export default filterEntriesByKeywords;
