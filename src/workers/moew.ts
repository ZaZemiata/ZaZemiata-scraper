import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config/browserConfig";
import WorkerMessage from "../types/workerMessage";
import CrawledDataEntry from "../types/crawledDataEntry";

new class MoewWorker extends BaseWorker {

    async run() {

        for (const source of this.context) {

            // Extract the source URL and ID
            const url = source.url;
            const sourceId = Number(source.sourceUrlId);

            // Declare a variable to hold the browser instance
            let browser;

            try {

                // Launch a new Puppeteer browser instance with specified options
                browser = await puppeteer.launch(browserOptions);

                // Open a new browser tab
                const page = await browser.newPage();

                // Navigate to the source URL and wait for the DOM to fully load
                await page.goto(url, { waitUntil: 'domcontentloaded' });

                // Extract all entry articles from the page
                const entries = await page.$$eval('ul.document-list > li', items => {

                    // Map each entry article to an object with essential details
                    return items.map(item => {

                        // Extract the article's title
                        const titleElement = item.querySelector('h3.document-title');

                        // Extract the link to the full article
                        const linkElement = item.querySelector('a');

                        // Extract the article's description
                        const descriptionElement = item.querySelector('p.document-description');

                        // Return the entry details as an object
                        return {
                            text: titleElement ? titleElement.textContent?.trim() : '',
                            link: linkElement ? linkElement.href : '',
                            description: descriptionElement ? descriptionElement.textContent?.trim() : ''
                        };

                        // Filter entries to exclude those missing essential information
                    }).filter(entry => entry.text && entry.description && entry.link);
                });

                // Handle the case where no valid entries are found
                if (entries.length === 0) throw new Error('Entries not found.');

                // Prepare an array to store the crawled data
                const crawledData : CrawledDataEntry[] = [];

                // Process each entry article
                for (const entry of entries) {

                    // Deconstruct entry details
                    const { text, description, link } = entry;

                    // Extract and validate the date from the description
                    const dateRegex = /\b\d{2}\.\d{2}\.\d{4}\b/;
                    const dateMatch = description?.match(dateRegex);
                    const date = dateMatch ? dateMatch[0] : null;

                    // Throw an error if the date is missing or invalid
                    if (!date) 
                        throw new Error('Invalid date format.');

                    // Navigate to the full article page
                    await page.goto(link, { waitUntil: 'domcontentloaded' });

                    // Extract contractor information from the article's content
                    const contractor = await page.$$eval('div.content-box p', (paragraphs) => {

                        // Define phrases and endings used to identify the contractor
                        const keyPhrases = ["заявление за издаване на комплексно разрешително", "с възложител"];
                        const validEndings = ["ЕАД", "ЕООД", "ЕТ", "ООД", "АД"];

                        // Search paragraphs for a contractor match
                        for (const paragraph of paragraphs) {

                            // Extract and normalize the text content
                            const text = paragraph.textContent?.trim().toLowerCase();

                            // Use a regex to find contractor details
                            if (keyPhrases.some(phrase => text?.includes(phrase))) {

                                // Construct a regex pattern to match the contractor name
                                const regex = new RegExp(`(${keyPhrases.join('|')}).*?(„[^“]+“\\s*(${validEndings.join('|')}))[.,]?`, 'i');

                                // Extract the contractor name from the text
                                const match = text?.match(regex);

                                // Return the contractor name if found, with trailing punctuation removed
                                if (!match) 
                                    return null;

                                return match[2].replace(/[.,]$/, '').trim();
                            }
                        }
                    });

                    // Construct an object to store the crawled data for this entry
                    const crawledEntity : CrawledDataEntry = {
                        text: text || '',
                        date: new Date(date.split('.').reverse().join('-')),
                        ...(contractor && { contractor }),
                        source_url_id: sourceId,
                        sourceArticle: link,
                    };

                    // Add the crawled entity to the results array
                    crawledData.push(crawledEntity);
                }

                // Prepare a success message with the crawled data
                const message: WorkerMessage = {
                    status: 'completed',
                    data: crawledData,
                };

                // Publish the success message
                this.publishMessage(message);
            } 
            
            // Catch errors
            catch (error) {

                // Handle errors during processing
                if (!(error instanceof Error))
                    throw new Error('An unknown error occurred.');

                // Prepare an error message with details
                const message: WorkerMessage = {
                    status: 'error',
                    error: error.message,
                };

                // Publish the error message
                this.publishMessage(message);
            } 
            
            // Finally block
            finally {

                // Ensure the browser is closed to free resources
                if (browser)
                    await browser.close();

                // Terminate the worker process
                process.exit();
            }
        }
    }
}
