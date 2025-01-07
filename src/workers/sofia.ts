import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";
import CrawledDataEntry from "../types/crawledDataEntry";

new class Sofia extends BaseWorker {
    async run() {
        const baseUrl = this.context[0].url;
        const sourceId = Number(this.context[0].sourceUrlId);

        let browser;

        try {
            // Launch the browser
            browser = await puppeteer.launch(browserOptions);
            const page = await browser.newPage();

            // Go to the URL
            await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Select all the links that lead to the years (first link from <h3>)
            const linkSelector = 'h3 > a';

            // Wait for the links to be available
            await page.waitForSelector(linkSelector, { timeout: 10000 });

            // Extract all the year links
            const yearLinks = await page.$$(linkSelector);

            if (yearLinks.length === 0) throw new Error("No year links found!");

            const crawledData: CrawledDataEntry[] = [];

            // Click only the first link
            const firstLink = yearLinks[0];
            await firstLink.click();

            try {
                // Wait for navigation after the click
                await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 });
            } catch (navError) {
                console.warn("Navigation took too long. Continuing...");
            }

            // Select the container with the announcements
            const containerSelector = 'div.item-page';
            await page.waitForSelector(containerSelector, { timeout: 10000 });

            // Get the container with the content
            const announcementsContainer = await page.$(containerSelector);
            if (!announcementsContainer) throw new Error("Announcements container not found!");

            // Get all paragraphs (<p>) in the container
            const paragraphs = await announcementsContainer.$$('p');
            if (paragraphs.length === 0) throw new Error("No announcements found in paragraphs!");

            let contractor = ''; // Store contractor information
            let text = ''; // Store the main text
            let date: Date | null = null; // Store the date

            // Loop through all paragraphs
            for (const paragraph of paragraphs) {
                const data = await paragraph.evaluate((el) => {
                    const textContent = el.textContent?.trim();
                    const style = el.getAttribute('style') || '';
                    return { text: textContent || '', style };
                });

                if (!data.text) continue;

                // Check if the paragraph is for contractor, text, or date based on style
                if (data.style.includes('text-align: center')) {
                    // Extract contractor or date from centered paragraphs
                    const dateMatch = data.text.match(/\d{2}\.\d{2}\.\d{4}/);
                    if (dateMatch) {
                        // If a date is found, save it
                        date = new Date(dateMatch[0].split('.').reverse().join('-'));
                    } else {
                        // Otherwise, extract the contractor
                        contractor = data.text.replace(/[„”"]/g, '').trim();
                    }
                } else if (data.style.includes('text-align: justify')) {
                    // Extract the main text from justified paragraphs
                    text += (text ? '\n' : '') + data.text;
                }
            }

            // If no main text is found, throw an error
            if (!text) throw new Error("No main text found!");
            if (!contractor) console.warn("No contractor information found!");
            if (!date) date = new Date(); // Default to current date if no date is found

            // Add the data to the crawled data array
            crawledData.push({
                text,
                contractor,
                date,
                source_url_id: sourceId,
            });

            // Build the message
            const message: WorkerMessage = {
                status: 'completed',
                data: crawledData,
            };

            // Publish the message
            this.publishMessage(message);
        } catch (error) {
            // Build an error message
            const message: WorkerMessage = {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error occurred.',
            };

            // Publish the error message
            this.publishMessage(message);
        } finally {
            // Close the browser
            if (browser) await browser.close();
            // Exit the process
            process.exit();
        }
    }
};