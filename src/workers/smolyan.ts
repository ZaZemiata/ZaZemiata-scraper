/**
 * Smolyan adapter
 * 
 * @module smolyan.ts
 * @author vadiim <vadim123bg@gmail.com>
 */

// Import dependencies
import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";
import logger from "../utils/logger";

new class Smolyan extends BaseWorker {

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

            // Store the crawled data
            const crawledData = [];

            // Get the items
            const items = await page.$$('li.list-group-item');

            //Check if items not found
            if (items.length === 0)
                throw new Error('Items not found.');

            // Initialize the links array
            const links = [];

            // Loop through the items
            for (const item of items) {

                // Extract the link
                const link = await item.evaluate((el) => {

                    // Get the link element
                    if (!el)
                        throw new Error('Element not found.');

                    // Get the link
                    const link = el.querySelector('a')?.href;

                    //  Return the link
                    return link

                });

                // Skip if the link is not found
                if (!link)
                    throw new Error('Link not found.');

                // Push the link to the links array
                links.push(link)

            }

            // Loop through the links
            for (const link of links) {

                // Go to the link
                await page.goto(link, { waitUntil: 'domcontentloaded' });

                // Get the article
                const article = await page.$('article');

                // Skip if the article is not found
                if (!article)
                    throw new Error('Article not found.');

                // Extract the data
                const res = await article.evaluate((el) => {

                    // Get the date
                    const date = el.querySelector("p.small")?.textContent?.trim().split("Дата на публикуване: ")[1].trim().split(" ")[0].split(".");

                    // Get the spans
                    const spans = el.querySelectorAll("span")

                    // Get the divs
                    const divs = el.querySelectorAll(`div[style*="text-align"]`)

                    // initialize an array to store the text
                    const textInArray = []

                    if (spans.length !== 0) {

                        // Extract the text from the spans
                        for (const span of spans) {

                            if (span.textContent?.trim()) {

                                textInArray.push(span.textContent?.trim())

                            }

                        }

                    }

                    if (divs.length !== 0) {

                        // Extract the text from the divs
                        for (const div of divs) {

                            if (div.textContent?.trim()) {

                                textInArray.push(div.textContent?.trim())

                            }

                        }

                    }

                    // Skip if the text is empty
                    if (!date)
                        throw new Error('Date not found.');

                    // Return the extracted data
                    return { date: date, text: textInArray.join(" ") }

                });

                // Extract the text
                const text = res.text

                // Format the date
                const date = `${res.date[2]}-${res.date[1]}-${res.date[0]}`;

                // Create the crawled entity
                const crawledEntity = {
                    text: text.length > 3500 ? text.substring(0, 3500) : text,
                    date: new Date(date),
                    source_url_id: this.sourceId,
                    sourceArticle: link,
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