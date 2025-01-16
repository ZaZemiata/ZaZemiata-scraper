/**
 * Veliko Tarnovo adapter
 * 
 * @module velikoTarnovo.ts
 * @author Icona <hristogeorgiew@yahoo.com>
 */

import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";
import CrawledDataEntry from "../types/crawledDataEntry";

new class VelikoTarnovo extends BaseWorker {

    async run() {
        // Get the source URL and source ID
        const url = this.context[0].url;
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

            // Wait for the container to load
            await page.waitForSelector('div.art-postcontent');

            // Get the container with the list of announcements
            const announcementsContainer = await page.$('div.art-postcontent');

            if (!announcementsContainer)
                throw new Error('Announcements container not found.');

            // Get all list items (<li>) within the container
            const listItems = await announcementsContainer.$$('ol li');

            if (listItems.length === 0)
                throw new Error('No announcements found.');

            // Store the crawled data
            const crawledData: CrawledDataEntry[] = [];

            // Loop through each list item
            for (const listItem of listItems) {
                // Extract the data
                const data = await listItem.evaluate((el) => {
                    // Extract the link, text, and title from the list item
                    const linkElement = el.querySelector('a');
                    const textContent = el.textContent?.trim();
                    const href = linkElement?.getAttribute('href');
                    const title = linkElement?.textContent?.trim();

                    // Return the extracted data
                    return {
                        title: title || '',
                        text: textContent || '',
                        href: href ? new URL(href, window.location.origin).href : '',
                    };
                });

                // Skip if the text or href is empty
                if (!data.text || !data.href)
                    continue;

                // Extract the contractor from the text using regex
                const contractorMatch = data.text.match(/възложител\s+(.*?)(\/отг\. на\s+\d{2}\.\d{2}\.\d{4}\s+г\.\/?)$/im);
                const contractor = contractorMatch ? contractorMatch[1].trim() : '';


                // Parse the date (defaulting to the current date if not found in the text)
                const dateMatch = data.text.match(/\d{2}\.\d{2}\.\d{4}/);
                const date = dateMatch ? new Date(dateMatch[0].split('.').reverse().join('-')) : new Date();

                // Add to crawledData
                crawledData.push({
                    text: data.text,
                    ...(contractor && { contractor }),
                    date,
                    source_url_id: sourceId,
                });
            }

            // Build the message
            const message: WorkerMessage = {
                status: 'completed',
                data: crawledData,
            };

            // Publish the message
            this.publishMessage(message);
        }

        // Catch errors
        catch (error) {
            // Build an error message
            const message: WorkerMessage = {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error occurred.',
            };

            // Publish the error message
            this.publishMessage(message);
        }

        // Close the browser
        finally {
            if (browser)
                await browser.close();

            process.exit();
        }
    }
};
