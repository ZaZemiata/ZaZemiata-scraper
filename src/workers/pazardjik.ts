import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";
import logger from "../utils/logger";

new class RiewWorker extends BaseWorker {

    async run() {

        for (const source of this.context) {

            // Get the source URL
            const url = source.url;;
            const sourceId = Number(source.sourceUrlId);

            // Initialize the browser
            let browser;

            try {

                // Launch the browser
                browser = await puppeteer.launch(browserOptions);

                // Create a new page
                const page = await browser.newPage();

                // Go to the source URL
                await page.goto(url, { waitUntil: 'domcontentloaded' });

                // Extract data from all `accordion-inner` divs on the page
                const entries = await page.$$eval(".accordion-inner", (innerDivs) => {
                    return innerDivs.flatMap(innerDiv => {

                        // Get all list items inside the current `accordion-inner` div
                        const listItems = innerDiv.querySelectorAll("ul li");

                        // Process each list item to extract relevant data
                        return Array.from(listItems).map(li => {

                            // Find the span containing the date information within the list item
                            const dateSpan = li.querySelector(".label.pull-left");

                            // Extract and clean the date text from the span tag
                            const date = dateSpan?.textContent?.trim() || "";

                            // Locate the anchor tag inside the list item, which links to the full article
                            const aTag = li.querySelector("a");

                            // Get the title from the achor tag
                            const title = aTag?.textContent?.trim() || "";

                            // Extract the main text content of the list item, excluding the date
                            const text = li.textContent
                                ?.replace(date, "") // Remove the date text
                                .trim() || "";

                            // Return the extracted values
                            return { date, text, title };
                        });
                    });
                });

                // Store the crawled data
                const crawledData = [];

                // Iterate over the entries
                for (const entry of entries) {
                    const { text: textContent, date: dateString, title: title } = entry;

                    // Define the main regex for contractors
                    const contractorRegex = /от\s(.+)/;

                    // Define the fallback regex
                    const contractorFallbackRegex = /възложител(?:и)?:?\s*([^.\n]+.*?)(?:\s*\.$|$)/gmi;

                    // Store the contractor
                    let contractor;

                    // Attempt to extract the contractor's name using the main regex on the title
                    const fromMatch = title.match(contractorRegex);

                    // If a match is found, clean and store the contractor's name
                    if (fromMatch) {
                        contractor = fromMatch[1].trim();
                    } else {

                        // If no match is found, fall back to the second regex on the main text content
                        const contractorMatch = textContent.match(contractorFallbackRegex);

                        // If a match is found, clean and store the contractor's name
                        if (contractorMatch && contractorMatch.length > 0) {
                            contractor = contractorMatch[0]
                                .replace(/възложител(?:и)?:?\s*/i, '')
                                .replace(/\s*\.$/, '')
                                .trim();
                        }
                    }

                    // Format the date
                    const dateRegex = /\d{2}\.\d{2}\.\d{4}/;
                    const dateMatch = dateString.match(dateRegex);
                    const date = dateMatch ? dateMatch[0] : null;

                    // Date not found or invalid
                    if (!date) throw new Error('Invalid date format.');

                    // Create crawled data entity with the new data
                    const crawledEntity = {
                        text: textContent,
                        ...(contractor && { contractor }),
                        date: date ? new Date(date.split('.').reverse().join('-')) : null,
                        source_url_id: sourceId,
                    };

                    // Push the crawled entity to the results array
                    crawledData.push(crawledEntity);
                }

                // Build the success message
                const message: WorkerMessage = {
                    status: 'completed',
                    data: crawledData,
                };

                // Publish the success message
                this.publishMessage(message);

            }

            // Catch any errors
            catch (error) {

                if (!(error instanceof Error))
                    throw new Error('An unknown error occurred.');


                // Build error message
                const message: WorkerMessage = {
                    status: 'error',
                    error: error.message,
                };

                // Publish the error message
                this.publishMessage(message);
            }

            // Finally
            finally {

                // Close the browser
                if (browser)
                    await browser.close();

                // Exit the worker
                process.exit();
            }
        }
    }
}
