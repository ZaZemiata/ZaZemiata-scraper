// Type guard function to validate CrawledDataEntry in the worker message
export default function isWorkerMessageDataCrawledDataArray(data: unknown): data is CrawledDataEntry[] {
    if (!Array.isArray(data)) return false;

    return data.every(entry => {
        
        // Ensure entry is a non-null object before checking properties
        if (typeof entry !== 'object' || entry === null) return false;

        const { text, sourceUrlId, date, contractor } = entry as CrawledDataEntry;

        // Perform the checks for the required properties
        return (
            typeof text === 'string' &&
            typeof sourceUrlId === 'bigint' &&
            date instanceof Date &&
            typeof contractor === 'string'
        );
    });
}