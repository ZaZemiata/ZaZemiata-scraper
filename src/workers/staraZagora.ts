// This is a sample worker that demonstrates how to create a worker.
// This just sends a message to the main thread with mock data.

import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";
import CrawledDataEntry from "../types/crawledDataEntry";

new (class StaraZagora extends BaseWorker {
    async run() {
        // Get the source URL
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
            await page.goto(url, { waitUntil: "domcontentloaded" });

            // Wait for the container to load
            await page.waitForSelector(".text-modul");

            // Get the item container
            const itemContainer = await page.$(".text-modul ul");

            // Item container not found
            if (!itemContainer) throw new Error("Item container not found.");

            // Get the items
            const items = await itemContainer.$$("li");

            // Items not found
            if (items.length === 0) throw new Error("Items not found.");

            // Store the crawled data
            const crawledData: CrawledDataEntry[] = [];

            // Loop through the items
            for (const item of items) {
                const data = await item.evaluate((el) => {
                    // Extract the text and date from the item
                    const textContent = el.textContent?.trim();

                    // date pattern
                    const datePattern = /\/Публикувано на (\d{2})\.(\d{2})\.(\d{4}) г\.\//;

                    // Skip if the text is empty
                    if (!textContent) return null;

                    // Variables
                    let text = "";
                    let date = null;

                    // Extract the date
                    const dateMatch = textContent.match(datePattern);

                    // Remove the date from the text
                    text = textContent.replace(datePattern, "").trim();

                    // Parse the date
                    if (dateMatch && dateMatch[1] && dateMatch[2] && dateMatch[3]) {
                        const day = dateMatch[1];
                        const month = dateMatch[2];
                        const year = dateMatch[3];

                        date = `${year}-${month}-${day}`;
                    }

                    if (date && text) {
                        return {
                            text,
                            date,
                        };
                    }

                    return null;
                });

                if (data) {
                    // Push the data to the crawledData array
                    crawledData.push({
                        text: data.text,
                        date: new Date(data.date),
                        source_url_id: sourceId,
                        contractor: "Стара Загора",
                    });
                }
            }

            // Build the message
            const message: WorkerMessage = {
                status: "completed",
                data: crawledData,
            };

            // Publish the message
            this.publishMessage(message);
        } catch (error) {
            if (!(error instanceof Error)) throw new Error("An unknown error occurred.");

            // Build error message
            const message: WorkerMessage = {
                status: "error",
                error: error.message,
            };

            // Publish the message
            this.publishMessage(message);
        } finally {
            // Close the browser
            if (browser) await browser.close();

            // Exit the worker
            process.exit();
        }
    }
})();
