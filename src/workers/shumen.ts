/**
 * Shumen adapter
 * 
 * @module shumen.ts
 * @author vadiim <vadim123bg@gmail.com>
 */

// Import dependencies
import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";

new class Shumen extends BaseWorker {

    // Get the source URL and source ID
    private url = this.context[0].url;
    private sourceId = Number(this.context[0].sourceUrlId);

    async run() {

        // Initialize the browser
        let browser;

        try {

            // Launch the browser
            browser = await puppeteer.launch(browserOptions)

            // Create a new page
            const page = await browser.newPage();

            // Go to the source URL
            await page.goto(this.url, { waitUntil: 'domcontentloaded' });

            // Wait for the page to load
            await page.waitForNetworkIdle({ idleTime: 1000 });

            const crawledData = [];

            // Get the paragraphs
            let paragraphs = await page.$$('p');

            // Remove paragraphs that are not needed
            paragraphs.splice(0, 2);

            // Check if the paragraphs are found
            if (paragraphs.length === 0) {
                throw new Error('No paragraphs found');
            }

            // Loop through the paragraphs
            for (const item of paragraphs) {

                let date
                let text
                let contractor

                const res = await item.evaluate((el) => {

                    // Check if the text content is null
                    if (el.textContent === null)
                        throw new Error('No text content found');

                    // Get the information
                    const information = el.textContent.split(" ")

                    const date = information.shift();

                    const text = information.join(" ")

                    const contractor = text.split(" с възложител")[1]

                    return { date, text, contractor }

                })

                date = res.date
                text = res.text
                contractor = res.contractor

                // Check if the result is null
                if (!date || !text || !contractor)
                    throw new Error('Invalid data or text or contractor');

                // Create the crawled entity
                const crawledEntity = {
                    text,
                    contractor,
                    date: new Date(date),
                    source_url_id: this.sourceId,
                };

                // Push the crawled entity
                crawledData.push(crawledEntity);

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