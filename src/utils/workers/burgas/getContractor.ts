/**
 * getContractor
 *
 * @module getContractor.ts
 * 
 * @author Daniel Batanov <batanoff.s@protonmail.com>
 * @description This module is providing a helper function to parse the contractor string.
 * @param {text: string, keywords: string[]} - The text to parse and the keywords to search for.
 * @returns {contractor: string, remainingText: string} Returns the contractor name and the remaining text.
 */

export const getContractor = (text: string, keywords: string[]) => {

    // Convert the content text to lower case
    const textLower = text.toLowerCase();
    
    // Find the keyword that exists in the content text
    const keyword = keywords.find((kw) =>
        textLower.includes(kw)
    );

    // Check if keyword is found
    if (!keyword) 
        return {
            contractor: null,
            text,
        };

    // Extract the contractor and remaining text based on the found keyword
    const [remainingText, contractor] = textLower.split(keyword);

    // Check if contractor is found
    if(!contractor) {

        // Log the text where the contractor is not found for debugging purposes
        // logger.info('Contractor not found in text: ', text);

        // Return the text if contractor is not found
        return {
            contractor: null,
            text: text,
        };
    }

    /**
     * Debug logs for the text parts used for testing
     * 
     * logger.info(`Text found for validation: ${textLower}`);
     * console.table([{ keyword, contractor }], ['keyword', 'contractor']);
    */

    // Return the contractor name and the remaining text
    return {
        contractor: contractor.trim(),
        remainingText: remainingText.trim() || text,
    };
}
