import prisma from '../../db/prisma/prisma';

const filterEntriesByKeywords = async (entries: CrawledDataEntry[]): Promise<CrawledDataEntry[]> => {

    // Fetch active keywords
    const keywords = await prisma.keyWords.findMany({ where: { active: true } });

    // Normalize keywords for case-insensitive comparison
    const normalizedKeywords = keywords.map(keyword => keyword.word.toLowerCase());

    // Filter entries by checking if their text matches any keyword
    return entries.filter(entry => {
        const normalizedText = entry.text.toLowerCase();
        return normalizedKeywords.some(keyword => normalizedText.includes(keyword));
    });
};

export default filterEntriesByKeywords;