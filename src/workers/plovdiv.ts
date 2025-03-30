import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config/browserConfig";
import WorkerMessage from "../types/workerMessage";
import CrawledDataEntry from "../types/crawledDataEntry";

new class RiewWorker extends BaseWorker {

    async run() {

        for (const source of this.context) {

            // Get the source URL
            const url = source.url;;
            const sourceId = Number(source.sourceUrlId);

            // Initialize the browser
            let browser;

            try {

                // Launch the browser
                browser = await puppeteer.launch(browserOptions);

                // Create a new page
                const page = await browser.newPage();

                // Go to the source URL
                await page.goto(url, { waitUntil: 'domcontentloaded' });

                // Get all entry links
                const entryLinks = await page.$$eval('.list-group-item > a', links => links.map(link => ({
                    
                    // Get the content from the url's inner text
                    text: link.innerText.trim(),

                    // Get the badge from the current list item being processed and extract the date
                    date: link.parentElement?.querySelector('.badge.text-bg-secondary')?.textContent?.trim() || ''
                })));

                // Throw an error if no entries found
                if (entryLinks.length === 0) 
                    throw new Error('Entries not found.');

                // Store the crawled data
                const crawledData : CrawledDataEntry[] = [];

                // Iterate over the entry links
                for (const entry of entryLinks) {

                    // Extract text and date from the record
                    const { text: textContent, date: dateString } = entry;

                    // Define the regex to find the contractor and extract the associated text
                    const contractorRegex = /възложител(?:и)?:?\s*([^.\n]+.*?)(?:\s*\.$|$)/gmi;
                    const contractorMatch = textContent.match(contractorRegex);

                    // Store the contractor name
                    let contractor;

                    // If contractor is found, remove "възложител", dot at the end (if there is one) and keep the rest of the text
                    if (contractorMatch && contractorMatch.length > 0) {

                        // Extract the contractor name
                        contractor = contractorMatch[0].replace(/възложител(?:и)?:?\s*/i, '').replace(/\s*\.$/, '').trim();
                    }

                    // Format the date
                    const dateRegex = /\d{2}\.\d{2}\.\d{4}/;
                    const dateMatch = dateString.match(dateRegex);
                    const date = dateMatch ? dateMatch[0] : null;

                    // Date not found or invalid
                    if (!date) 
                        throw new Error('Invalid date format.');
                    
                    // Create crawled data entity with the new data
                    const crawledEntity: CrawledDataEntry = {
                        text: textContent,
                        ...(contractor && { contractor }),
                        date: new Date(date.split('.').reverse().join('-')),
                        source_url_id: sourceId,
                    }

                    // Push the crawled entity to the results array
                    crawledData.push(crawledEntity);
                };

                // Build the success message
                const message: WorkerMessage = {
                    status: 'completed',
                    data: crawledData,
                };

                // Publish the success message
                this.publishMessage(message);

            } 
            
            // Catch any errors
            catch (error) {

                if (!(error instanceof Error)) 
                    throw new Error('An unknown error occurred.');
                

                // Build error message
                const message: WorkerMessage = {
                    status: 'error',
                    error: error.message,
                };

                // Publish the error message
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
}
