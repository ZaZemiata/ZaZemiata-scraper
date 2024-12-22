/**
 * Blagoevgrad adapter
 * 
 * @module blagoevgrads.ts
 * @author vadiim <vadim123bg@gmail.com>
 */

// Import dependencies
import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";

new class Blagoevgrad extends BaseWorker {

    //Parse the date
    private dataParser: { [key: string]: number } = {
        "Декември": 12,
        "Ноември": 11,
        "Октомври": 10,
        "Септември": 9,
        "Август": 8,
        "Юли": 7,
        "Юни": 6,
        "Май": 5,
        "Април": 4,
        "Март": 3,
        "Февруари": 2,
        "Януари": 1
    }

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
            await page.waitForNetworkIdle({ idleTime: 15000 });

            const crawledData = [];

            // Get the item container
            const container = await page.$('div.nopad');

            // Check if the container is found
            if (!container)
                throw new Error('Container not found');

            // Get the first item 
            const firstItem = await container.$('div.leading-0');

            //Check if the first item is found
            if (!firstItem)
                throw new Error('First item not found');

            let date: string[];
            let text: string;
            let contractor: string;

            // Evaluate the first item
            const res = await firstItem.evaluate((el) => {

                // Get the paragraphs
                const paragraphs = el.querySelectorAll('p');

                // Check if the paragraphs are not found
                if (paragraphs.length == 0)
                    throw new Error('Paragraphs not found');

                // Get the contractor
                const contractor = paragraphs[0].textContent;

                // Get the text
                const text = paragraphs[1].textContent;

                // Get the date
                const date = el.querySelector('.published')?.textContent;

                // Check if the contractor, text or date is not found
                if (!contractor || !text || !date)
                    throw new Error('Contractor or text not found or date not found');

                // Return the result
                return { contractor, text, date };

            })

            // Get the date & contractor & text from the result
            date = res.date.split(" ");
            contractor = res.contractor.split("Възложител:")[1].trim();
            text = res.text

            // Get the date
            const year = date[3]
            const month = this.dataParser[date[2]]
            const day = date[1]

            // Create a date string
            const dateSting = `${year}-${month}-${day}`;

            // Create the crawled entity
            const crawledEntity = {
                text,
                contractor,
                date: new Date(dateSting),
                source_url_id: this.sourceId,
            };

            // Push the crawled entity
            crawledData.push(crawledEntity);

            // Get the other items 
            const otherItems = await container.$$('.item.column-1');

            //Check if the other items are found
            if (otherItems.length === 0)
                throw new Error('Other items not found');

            // Loop through the other items
            for (const item of otherItems) {

                //evaluate the contractor, date and text
                const res = await item.evaluate((el) => {

                    // Get the paragraphs
                    const paragraphs = el.querySelectorAll('p');

                    // Get the contractor
                    const contractor = paragraphs[0].textContent

                    // Get the text
                    const text = paragraphs[1].textContent;

                    // Get the date
                    const date = el.querySelector('.published')?.textContent;

                    // Check if the contractor, text or date is not found
                    if (!contractor || !text || !date)
                        throw new Error('Contractor, text or date not found');

                    // Return the result
                    return { contractor, text, date };
                })

                // Get the date & contractor & text from the result
                let date: string[] = res.date.split(" ");
                let contractor: string = res.contractor.split("Възложител:")[1].trim();
                let text = res.text

                // Get the date
                const year = date[3]
                const month = this.dataParser[date[2]]
                const day = date[1]

                // Create a date string
                const dateSting = `${year}-${month}-${day}`;

                // Create the crawled entity
                const crawledEntity = {
                    text,
                    contractor,
                    date: new Date(dateSting),
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