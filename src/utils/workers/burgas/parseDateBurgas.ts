/**
 * Parse Date Burgas
 *
 * @module parseDateBurgas.ts
 * @author Daniel Batanov <batanoff.s@protonmail.com>
 * @description This module is providing a helper function to parse the date for Burgas worker.
 */

import { ElementHandle } from "puppeteer";
import logger from "../../logger";

export const parseDateBurgas = async (element: string | ElementHandle<Element>): Promise<Date | null> => {
    
    // Define variable to store the date string
    let dateText: string = "";

    // Check if the element is a string
    if(element instanceof ElementHandle) {

        // Get the text content and clean the format
        const dateTextContent = await element.evaluate(el => el.textContent?.trim());
        
        // Span text not found
        if (!dateTextContent) throw new Error("No text found in the date container.");

        // Assign the text to the dateText
        dateText = dateTextContent;
    } else {

        // Clean the date format
        const cleanDateRegex = / г\.?|-/g;

        // Format the date, remove the contractor and clean the date
        dateText = element?.trim().replace(cleanDateRegex, '');
    }

    // split the date parts
    const dateParts = dateText.split(".");

    // Date parts not found or invalid
    if (!Array.isArray(dateParts) || dateParts.length !== 3) throw new Error("Date parts not found or invalid format. Date: " + element);

    // Deconstruct the date parts
    const [day, month, year] = dateParts;

    // Convert date parts to integers
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    // Edge case to correct single entry with value = 20201
    const correctedYearNum = (yearNum === 20201) ? 2021 : yearNum;

    // Validate the date ranges
    if (dayNum < 1 || dayNum > 31) logger.warn("Day is out of range for date: " + dateText);
    if (monthNum < 1 || monthNum > 12) logger.warn("Month is out of range for date: " + dateText);
    if (correctedYearNum < 1000 || correctedYearNum > 9999) logger.warn("Year is out of range for date: " + dateText);

    // Build the date object
    const buildDate = new Date(`${correctedYearNum}-${monthNum}-${dayNum}`);

    // If the parsed date is null or not a Date object, throw an error
    if (!buildDate || !(buildDate instanceof Date)) throw new Error("Date is invalid.");
    
    // Create a new date and return it
    return buildDate;
};