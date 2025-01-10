import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";
import CrawledDataEntry from "../types/crawledDataEntry";

new class Sofia extends BaseWorker {

    async run() {

        // Get the base URL and source ID from the context
        const baseUrl = this.context[0].url;
        const sourceId = Number(this.context[0].sourceUrlId);

        // Initialize the browser
        let browser;

        try {

            // Launch the browser
            browser = await puppeteer.launch(browserOptions);

            // Create a new page
            const page = await browser.newPage();

            // Navigate to the base URL
            await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

            // Wait briefly to ensure all content is loaded
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Define the selector for year links (first <a> within <h3>)
            const linkSelector = 'h3 > a';

            // Wait for the links to appear
            await page.waitForSelector(linkSelector, { timeout: 10000 });

            // Extract all the year links
            const yearLinks = await page.$$(linkSelector);

            if (yearLinks.length === 0)
                throw new Error("No year links found!");

            // Click the first year link
            const firstLink = yearLinks[0];
            await firstLink.click();

            try {
                // Wait for the page to load after clicking
                await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 });
            } catch (navError) {
                console.warn("Navigation took too long. Continuing...");
            }

            // Define the selector for the main content container
            const containerSelector = 'div.item-page';

            // Wait for the container to be available
            await page.waitForSelector(containerSelector, { timeout: 10000 });

            // Extract the announcements content within the container
            const sections = await page.evaluate(() => {
                const results: { text: string; style: string }[][] = [];
                const container = document.querySelector('div.item-page');

                if (!container) return results;

                let current: { text: string; style: string }[] = [];

                // Loop through all <p> and <hr> elements in the container
                container.querySelectorAll('p, hr').forEach((el) => {
                    if (el.tagName === 'HR') {
                        // Save the current section and start a new one
                        if (current.length > 0) {
                            results.push([...current]);
                            current = [];
                        }
                    } else {
                        // Collect the text content and style attributes
                        current.push({
                            text: el.textContent?.trim() || '',
                            style: el.getAttribute('style') || '',
                        });
                    }
                });

                if (current.length > 0) {
                    results.push([...current]);
                }

                return results;
            });

            // Initialize the array for storing crawled data
            const crawledData: CrawledDataEntry[] = [];

            // Process each section to extract relevant information
            for (const section of sections) {
                let contractor = '';
                let text = '';
                let date: Date | null = null;

                for (const data of section) {
                    if (!data.text) continue;

                    // Check for center-aligned text (date or contractor)
                    if (data.style.includes('text-align: center')) {
                        const dateMatch = data.text.match(/\d{2}\.\d{2}\.\d{4}/);
                        if (dateMatch) {
                            date = new Date(dateMatch[0].split('.').reverse().join('-'));
                        } else {
                            contractor = data.text.replace(/[„”"]/g, '').trim();
                        }
                    } else if (data.style.includes('text-align: justify')) {
                        // Collect justified text content
                        text += (text ? '\n' : '') + data.text;
                    }
                }

                // Default to the current date if no date was found
                if (!date) {
                    date = new Date();
                }

                // Add the entry if text content exists
                if (text) {
                    crawledData.push({
                        text,
                        contractor,
                        date,
                        source_url_id: sourceId,
                    });
                }
            }

            // Throw an error if no valid data was collected
            if (crawledData.length === 0) {
                throw new Error("No valid data found!");
            }

            // Build and publish a success message
            const message: WorkerMessage = {
                status: 'completed',
                data: crawledData,
            };

            this.publishMessage(message);

        } catch (error) {
            // Build and publish an error message
            const message: WorkerMessage = {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error occurred.',
            };

            this.publishMessage(message);

        } finally {
            // Close the browser
            if (browser) await browser.close();

            // Exit the worker
            process.exit();
        }
    }
};
