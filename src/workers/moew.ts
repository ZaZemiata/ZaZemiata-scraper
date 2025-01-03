import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";

new class MoewWorker extends BaseWorker {

    async run() {

        for (const source of this.context) {

            // Get the source URL
            const url = source.url;
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

                // Get all entry elements within the document list
                const entries = await page.$$eval('ul.document-list > li', items => {
                    return items.map(item => {
                        const titleElement = item.querySelector('h3.document-title');
                        const descriptionElement = item.querySelector('p.document-description');
                        return {
                            text: titleElement ? titleElement.textContent?.trim() : '',
                            description: descriptionElement ? descriptionElement.textContent?.trim() : ''
                        };
                    }).filter(entry => entry.text && entry.description);
                });

                // Throw an error if no entries found
                if (entries.length === 0)
                    throw new Error('Entries not found.');

                // Store the crawled data
                const crawledData = [];

                // Iterate over the entries
                for (const entry of entries) {

                    const { text, description } = entry;

                    // Extract date using regex
                    const dateRegex = /\b\d{2}\.\d{2}\.\d{4}\b/;
                    const dateMatch = description?.match(dateRegex);
                    const date = dateMatch ? dateMatch[0] : null;

                    // Date not found or invalid
                    if (!date)
                        throw new Error('Invalid date format.');

                    // Create crawled data entity with the new data
                    const crawledEntity = {
                        text,
                        date: date ? new Date(date.split('.').reverse().join('-')) : null,
                        source_url_id: sourceId,
                    };

                    // Push the crawled entity to the results array
                    crawledData.push(crawledEntity);
                };

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
