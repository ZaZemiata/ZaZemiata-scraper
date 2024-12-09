import prisma from '../../db/prisma/prisma';

// Helper function to filter crawled data
const filterEntriesByKeywords = async (entry: CrawledDataEntry): Promise<boolean> => {

    // Fetch active keywords
    const keywords = await prisma.keyWords.findMany({ where: { active: true } });

    // Normalize keywords and entry text to lowercase for case-insensitive comparison
    const normalizedKeywords = keywords.map(keyword => keyword.word.toLowerCase());
    const normalizedText = entry.text.toLowerCase();

    // Check if the normalized text matches any of the keywords
    return normalizedKeywords.some(keyword => normalizedText.includes(keyword));
};

export default filterEntriesByKeywords;