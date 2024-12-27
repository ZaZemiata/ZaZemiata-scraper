import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";
import CrawledDataEntry from "../types/crawledDataEntry";

new class Sofia extends BaseWorker {
    async run() {
        // Extract the URL and source ID from the context
        const url = this.context[0].url;
        const sourceId = Number(this.context[0].sourceUrlId);

        let browser;

        try {
            // Launch the Puppeteer browser instance
            browser = await puppeteer.launch(browserOptions);
            const page = await browser.newPage();

            // Navigate to the provided URL with an extended timeout to ensure full loading
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });

            // Add an additional wait time for the page to load completely
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Click on the link that contains "id=702" to navigate to the 2024 section
            const linkSelector = 'a[href*="id=702"]';
            await page.waitForSelector(linkSelector, { timeout: 10000 });
            await page.click(linkSelector);

            // Wait for the navigation to the new page to complete
            try {
                await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });
            } catch (navError) {
                // If navigation takes too long, continue without waiting for it to finish
                console.warn("Navigation took too long. Continuing...");
            }

            // Ensure the new page contains the required container for announcements
            const containerSelector = 'div.item-page';
            await page.waitForSelector(containerSelector, { timeout: 10000 });

            const announcementsContainer = await page.$(containerSelector);
            if (!announcementsContainer) throw new Error("Announcements container not found!");

            // Get all paragraphs within the container to extract the announcement data
            const paragraphs = await announcementsContainer.$$('p');
            if (paragraphs.length === 0) throw new Error("No announcements found in paragraphs!");

            const crawledData: CrawledDataEntry[] = [];

            // Iterate over each paragraph to extract relevant data
            for (const paragraph of paragraphs) {
                const data = await paragraph.evaluate((el) => {
                    // Extract the text content from the paragraph
                    const textContent = el.textContent?.trim();
                    return { text: textContent || '' };
                });

                // Skip if there is no text content in the paragraph
                if (!data.text) continue;

                // Extract the contractor name using regex (if available)
                const contractorMatch = data.text.match(/Възложител[:\s]*(.*?)(?=[\n.,]|\s*$)/i);
                const contractor = contractorMatch ? contractorMatch[1].replace(/[„”"]/g, '').trim() : '';

                // Extract the date from the text using regex, defaulting to the current date if not found
                const dateMatch = data.text.match(/\d{2}\.\d{2}\.\d{4}/);
                const date = dateMatch ? new Date(dateMatch[0].split('.').reverse().join('-')) : new Date();

                // Push the extracted data into the crawledData array
                crawledData.push({
                    text: data.text,
                    // Only add contractor if it was found
                    ...(contractor && { contractor }),
                    date,
                    source_url_id: sourceId,
                });
            }

            // Send the crawled data as a message once all data has been processed
            const message: WorkerMessage = {
                status: 'completed',
                data: crawledData,
            };
            // Publish the message containing crawled data
            this.publishMessage(message);
        } catch (error) {
            // Send an error message if something goes wrong during the crawling process
            const message: WorkerMessage = {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error occurred.',
            };
            // Publish the error message
            this.publishMessage(message);
        } finally {
            // Close the browser to free up resources and exit the process
            if (browser) await browser.close();
            process.exit();
        }
    }
};
