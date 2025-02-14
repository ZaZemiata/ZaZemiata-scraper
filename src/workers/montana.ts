import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";
import CrawledDataEntry from "../types/crawledDataEntry";
import logger from "../utils/logger";
 
new class Montana extends BaseWorker {

    async run() {

        // Extracting url from the worker's context
        const url = this.context[0]?.url;

        // Extracting source url id and converting it to a number
        const sourceId = Number(this.context[0]?.sourceUrlId);
 
        // if url is missing
        if (!url) {
            logger.error("URL not found in context!");
            return this.publishMessage({ status: "error", error: "URL not provided." });
        }
 
        // Declare browser variable for later use
        let browser;
 
        try {

            // Launch Puppeteer browser with predefined options
            browser = await puppeteer.launch(browserOptions);

            // Open a new browser page
            const page = await browser.newPage();
 
            page.on("console", (msg) => logger.debug(`Browser log: ${msg.text()}`));
            page.on("error", (err) => logger.error(`Page error: ${err}`));
 
            // Navigate to the given url and wait until DOM is loaded
            await page.goto(url, { waitUntil: "domcontentloaded" });
 
            try {

                // Wait for main content to load
                await page.waitForSelector("div.dm_docs, div.dm_row", { timeout: 10000 });
            
            } catch (error) {

                logger.error("Main content selector not found, logging page HTML...");
                
                // Get page content for debugging
                const html = await page.content();

                logger.error(`Page HTML:\n${html.substring(0, 2000)}`);

                throw new Error("Failed to find the announcements section.");
            }
 
            // Select all announcement elements
            const announcements = await page.$$("div.dm_row");
 
            // If no announcements, throw an error
            if (announcements.length === 0) 
                throw new Error("No announcements found.");
            
 
             // Initialize array to store extracted data
            const crawledData: CrawledDataEntry[] = [];
 
            // Loop through all announcements
            for (const [index, item] of announcements.entries()) {
 
                try {

                    // Extract data from the announcement element
                    const data = await item.evaluate((el) => {

                        // Extract all data
                        const titleEl = el.querySelector("h3.dm_title a");
                        const textEl = el.querySelector("div.dm_description");
                        const dateEl = el.querySelector("div.dm_details table tbody tr td:nth-child(2)");
                        
                        // Extract text content from elements
                        const title = titleEl?.textContent?.trim() || "";
                        const text = textEl?.textContent?.trim() || "";
                        const rawDate = dateEl?.textContent?.trim() || "";
 
                        // Initialize date variable
                        let date = '';

                        // Regex pattern to match date formats
                        const regex = /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/;
                        const match = regex.exec(rawDate);

                        // If date is found
                        if (match) {

                            // Extract day, month and year from the match
                            const [, day, month, year] = match;

                            // Convert extracted date to ISO format
                            const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

                            // Convert the parsed date to ISO 8601 format for consistency in data storage
                            date = parsedDate.toISOString();
                        } 
                        
                        // Return extracted data
                        return { title, text, date };
                        
                    });
 
                    // If no text is found
                    if (!data.text) {
                        logger.warn(`Skipping announcement ${index + 1} due to missing text.`);
                        continue;
                    }
 
                    // Regex to find contractor information
                    const contractorMatch = data.text.match(/възложител(и)?:\s*(.*)/i);
                    
                    // Extract contractor name and clean up text
                    const contractor = contractorMatch ? contractorMatch[2].replace(/[„”"]/g, "").trim() : "";
 
                    // Push the crawled entity to the results array
                    crawledData.push({
                        text: data.text,

                        // Include contractor only if it exists
                        ...(contractor && { contractor }),

                        // Parse date or use default date
                        date: data.date ? new Date(data.date) : new Date(0),

                        source_url_id: sourceId,
                    });
                } 
                
                // Catch any errors
                catch (error) {
                    logger.error(`Error processing announcement ${index + 1}: ${error}`);
                }
            }
 
            // Prepare final message with collected data
            const message: WorkerMessage = { status: "completed", data: crawledData };
            
            // Publish the message
            this.publishMessage(message);

        } 
        
        // Catch any errors
        catch (error) {

            // Log any encountered errors
            logger.error(`Error: ${error instanceof Error ? error.message : "Unknown error."}`);
            
            // Publish error message
            this.publishMessage({ status: "error", error: error instanceof Error ? error.message : "Unknown error." });
        
        } 
        
        // Finally
        finally {

            // Close the browser
            if (browser) 
                await browser.close();

            // Exit the process
            process.exit();
        }
    }
};