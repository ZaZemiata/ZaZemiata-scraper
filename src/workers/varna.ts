import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";

// Define the type for the crawled data entries
type CrawledDataEntry = {
    text: string;
    source_url_id: number | bigint;
    date: Date;
    contractor: string;
};

new class Varna extends BaseWorker {
    async run() {
        // Get the source URL and source ID
        const url = this.context[0].url;
        const sourceId = Number(this.context[0].sourceUrlId);

        let browser;

        try {
            // Launch the browser
            browser = await puppeteer.launch(browserOptions);

            // Create a new page
            const page = await browser.newPage();

            // Go to the source URL
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Wait for the container to load
            await page.waitForSelector('div.bialty-container');

            // Get the container with the list of announcements
            const announcementsContainer = await page.$('div.bialty-container');

            if (!announcementsContainer) {
                throw new Error('Announcements container not found.');
            }

            // Get all list items (<li>) within the container
            const listItems = await announcementsContainer.$$('li');

            if (listItems.length === 0) {
                throw new Error('No announcements found.');
            }

            // Store the crawled data
            const crawledData: CrawledDataEntry[] = [];

            for (const listItem of listItems) {
                // Extract the data
                const data = await listItem.evaluate((el) => {
                    const linkElement = el.querySelector('a');
                    const textContent = el.textContent?.trim();
                    const href = linkElement?.getAttribute('href');
                    const title = linkElement?.textContent?.trim();

                    return {
                        title: title || '',
                        text: textContent || '',
                        href: href ? new URL(href, window.location.origin).href : '',
                    };
                });

                if (!data.text || !data.href) continue;

                // Extract the contractor from the text using regex
                const contractorMatch = data.text.match(/възложител[:\s]*(.*?)(?=[\n.,]|\s*$)/i);
                const contractor = contractorMatch ? contractorMatch[1].replace(/[„”"]/g, '').trim() : '';

                // Parse the date (defaulting to the current date if not found in the text)
                const dateMatch = data.text.match(/\d{2}\.\d{2}\.\d{4}/);
                const date = dateMatch ? new Date(dateMatch[0].split('.').reverse().join('-')) : new Date();

                // Add to crawledData
                crawledData.push({
                    text: data.text,
                    contractor,
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
        } catch (error) {
            const message: WorkerMessage = {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error occurred.',
            };
            this.publishMessage(message);
        } finally {
            if (browser) {
                await browser.close();
            }
            process.exit();
        }
    }
};
