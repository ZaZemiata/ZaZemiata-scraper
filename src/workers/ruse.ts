import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";

new class Ruse extends BaseWorker {

    async run() {

        // Get the source URL
        const url = this.context[0].url;
        const sourceId = Number(this.context[0].sourceUrlId);

        // Initialize the browser
        let browser;

        try {

            // Launch the browser
            browser = await puppeteer.launch(browserOptions)

            // Create a new page
            const page = await browser.newPage();

            // Go to the source URL
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Wait for the page to load
            await page.waitForNetworkIdle({ idleTime: 15000 });

            // Get the item container
            const itemContainer = await page.$('.itemList');

            // Item container not found
            if (!itemContainer)
                throw new Error('Item container not found.');

            // Get the items
            const items = await itemContainer.$$('[id^="itemList"]');

            // Items not found
            if (items.length === 0)
                throw new Error('Items not found.');

            // Store the crawled data
            const crawledData = [];

            // Loop through the items
            for (const item of items) {

                // Get the inner items
                const innerItems = await item.$$('.itemContainer');

                // Inner items not found
                if (innerItems.length === 0)
                    throw new Error('Inner items not found.');

                // Loop through the inner items
                for (const innerItem of innerItems) {

                    // Variables
                    let contractor;
                    let text;
                    let date;

                    // Evaluate the inner item
                    const res = await innerItem.evaluate((el) => {

                        // Get the title
                        const titleElement = el.querySelector('h1');
                        const title = titleElement ? titleElement.textContent : '';

                        // Get the text
                        const textElement = el.querySelector('p');
                        const text = textElement ? textElement.textContent : '';

                        // Return the result
                        return { title, text };
                    });

                    // Set the contractor and text
                    contractor = res.title?.trim();
                    text = res.text?.trim();

                    // Clean the date
                    const cleanDateRegex = / г\.?|-/g;

                    // Format the date, remove the contractor and clean the date
                    date = contractor?.split('/').pop()?.trim().replace(cleanDateRegex, '');

                    // Get the date parts
                    const dateParts = date?.split('.');

                    // Date parts not found or invalid
                    if (!dateParts || dateParts.length !== 3)
                        throw new Error('Invalid date format.');

                    // Deconstruct the date parts
                    const [day, month, year] = dateParts;

                    // Create a date string
                    const dateSting = `${year}-${month}-${day}`;

                    // Create the crawled entity
                    const crawledEntity = {
                        text,
                        contractor,
                        date: new Date(dateSting),
                        source_url_id: sourceId,
                    };

                    // Push the crawled entity
                    crawledData.push(crawledEntity);
                }
            }

            // Build the message
            const message: WorkerMessage = {
                status: 'completed',
                data: crawledData,
            };

            // Publish the message
            this.publishMessage(message);
        }

        // Catch the error
        catch (error) {

            if (!(error instanceof Error))
                throw new Error('An unknown error occurred.');

            // Build error message
            const message: WorkerMessage = {
                status: 'error',
                error: error.message,
            };

            // Publish the message
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