/**
 * Parse Crawled Elements
 *
 * @module parseCrawledElements.ts
 * @author Daniel Batanov <batanoff.s@protonmail.com>
 * @description This module is providing a helper function that group properly the crawled elements in one array.
 */

import { ElementHandle } from "puppeteer";
import { parseDateBurgas } from "./parseDateBurgas";
import { getContractor } from "./getContractor";
import CrawledDataEntry from "../../../types/crawledDataEntry";

export const parseCrawledElements = async (
    container: ElementHandle<Element>,
    sourceId: number
) => {

    // Define variables to store the parsed data
    let crawledDataEntry: CrawledDataEntry | null = null;
    const crawledData: CrawledDataEntry[] = [];
    
    // Define variable to temporarily store the current date
    let currentDate: Date | null = null;

    // If item container not found
    if (!container) throw new Error('Item container not found.');

    // Get the first hr element as divider
    const divider = await container.$('hr');

    // Get all elements
    const innerItems = await container.$$('*');

    // Find the index of the divider
    const dividerIndex = innerItems.findIndex(item => item === divider);

    // Get the elements after the first hr element
    const subsequentItems = innerItems.slice(dividerIndex + 1);

    // Validate input parameters
    if (!Array.isArray(subsequentItems) || subsequentItems.length === 0) {
        throw new Error('Not found: HTML elements are changed or deleted.');
    }

    // Loop through the elements
    for (const item of subsequentItems) {

        // Get the tag name to lower case
        const tagName = await item.evaluate((el) =>
            el.tagName.toLowerCase()
        );

        // If the tag name is empty, throw an error
        if (!tagName) throw new Error("Tag name is empty.");

        // Logic to retrieve the date from h5 elements
        if (tagName === "h5") {
            
            // Check if previous date is not null
            if (currentDate) currentDate = null;

            // Selector for the invalid date container element (span strong -> 2024)
            const invalidOnlyYearContainer = await item.$(
                "span strong span span span span span"
            );

            // If found, skip element
            if (invalidOnlyYearContainer) continue;

            // Get the date element, can be span or h5 with no children
            const dateContainer = await item.$("span") || item;

            // Span element not found
            if (!dateContainer)
                throw new Error("Date span container not found.");

            // Parse the date
            const parsedDate = await parseDateBurgas(dateContainer);

            // Assign the parsed date to the current date
            currentDate = parsedDate;
        }

        // Check for current entry and p element to extract the text
        if (tagName === "p" && currentDate) {

            // Get the announcement contract text content
            const announcementText = await item.evaluate((el) =>
                el.textContent?.trim()
            );

            // If both are empty, skip the element
            if (!announcementText) continue;

            // Ensure the text is not empty
            if (announcementText && announcementText.length > 0) {

                // Call utility function to extract contractor name
                const { contractor, remainingText } = getContractor(
                    announcementText,

                    // Search keywords
                    [
                        "с възложители:",
                        "с възложител:",
                        "възложители:",
                        "възложител:",
                        "възложители",
                        "възложител",
                    ]
                );

                // Check if contractor is not empty before adding the text
                if (contractor && contractor.length > 0 && crawledDataEntry) {

                    // Add the contractor and the remaining text
                    crawledDataEntry.contractor = contractor;
                    crawledDataEntry.text += remainingText;

                    // Push the grouped elements
                    crawledData.push(crawledDataEntry);

                    // Reset the current entry
                    crawledDataEntry = null;
                }

                // Add remaining text if contractor is not found
                if(!contractor && !crawledDataEntry) {

                    // Check if the announcementText includes date
                    if(announcementText.includes("ПД-")) {

                        // Check if the announcementText includes date in the id container
                        if(announcementText.includes("/")) {

                            // Retrieve the id and date
                            const [id, dateString] = announcementText.split("/");

                            // Check if date is valid
                            if(dateString && dateString.length > 0) {

                                // Parse the date
                                const parsedDate = await parseDateBurgas(dateString);

                                // If the parsed date is null or not a Date object, throw an error
                                if(!parsedDate) throw new Error("Date is invalid.");

                                // Create new entry if not found
                                crawledDataEntry = {
                                    date: parsedDate,
                                    contractor: '',
                                    text: id + " ",
                                    source_url_id: sourceId,
                                };

                                // Go to the next iteration
                                continue;
                            }
                        }

                        // Create new entry if not found
                        crawledDataEntry = {
                            date: currentDate,
                            contractor: '',
                            text: announcementText + " ",
                            source_url_id: sourceId,
                        };
                    }
                }
            }
        }
    }

    // Check if there is an ongoing group to push the content
    if (crawledDataEntry) {
        crawledData.push(crawledDataEntry);
    }

    // Return the grouped elements
    return crawledData;
};
