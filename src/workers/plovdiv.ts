import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";

new class RiewWorker extends BaseWorker {

    async run() {

        // Get the source URL
        const url = this.context[0].url;;
        const sourceId = Number(this.context[0].sourceUrlId);

        // Initialize the browser
        let browser;

        try {
            // Launch the browser
            browser = await puppeteer.launch(browserOptions);

            // Create a new page
            const page = await browser.newPage();

            // Go to the source URL
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Get all entry links
            const entryLinks = await page.$$eval('.list-group-item > a', links => links.map(link => ({
                url: link.href,

                // Get the contractor from the url's inner text
                text: link.innerText.trim(),

                // Get the badge from the current list item being processed and extract the date
                date: link.parentElement?.querySelector('.badge.text-bg-secondary')?.textContent?.trim() || ''
            })));

            // Throw an error if no entries found
            if (entryLinks.length === 0) {
                throw new Error('Entries not found.');
            }

            // Store the crawled data
            const crawledData = [];

            for (const entry of entryLinks) {
                const { url: entryUrl, text: contractor, date: dateString } = entry;

                // Navigate to the entry URL
                await page.goto(entryUrl, { waitUntil: 'domcontentloaded' });

                // Wait for the page to load
                await page.waitForSelector('.container.py-4');

                // Get the main container
                const mainContainer = await page.$('.container.py-4');

                // Check if the container exists
                if (!mainContainer)
                    throw new Error('The main container that holds the text was not found.');

                // Extract text content from the main container
                const textContent = await mainContainer.evaluate(node => {

                    // Store the text.
                    const textParts: string[] = [];

                    // Iterate through all inner containers that contain text
                    const elements = node.querySelectorAll('div');
                    elements.forEach(el => {

                        // Check if the container contains text
                        if (el.textContent) {

                            // Trim surrounding white spaces from the text
                            const trimmed = el.textContent.trim();

                            // Add the trimmed text to the array if it's not empty
                            if (trimmed) {
                                textParts.push(trimmed);
                            }
                        }
                    });

                    // Join the extracted text parts into a single string
                    return textParts.join(' ');
                });

                // Format the date
                const dateRegex = /\d{2}\.\d{2}\.\d{4}/;
                const dateMatch = dateString.match(dateRegex);
                const date = dateMatch ? dateMatch[0] : null;

                // Date not found or invalid
                if (!date) {
                    throw new Error('Invalid date format.');
                }

                // Create crawled data entity with the new data
                const crawledEntity = {
                    text: textContent,
                    contractor,
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

        } catch (error) {

            if (!(error instanceof Error)) {
                throw new Error('An unknown error occurred.');
            }

            // Build error message
            const message: WorkerMessage = {
                status: 'error',
                error: error.message,
            };

            // Publish the error message
            this.publishMessage(message);

        } finally {
            if (browser) {
                await browser.close();
            }

            process.exit();
        }
    }
}
