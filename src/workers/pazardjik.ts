import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";
import logger from "../utils/logger";

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

                // Directly get data from all `accordion-inner` divs
                const entries = await page.$$eval(".accordion-inner", (innerDivs) => {
                    return innerDivs.flatMap(innerDiv => {
                        const listItems = innerDiv.querySelectorAll("ul li");
                        return Array.from(listItems).map(li => {
                            const dateSpan = li.querySelector(".label.pull-left");
                            const date = dateSpan?.textContent?.trim() || "";
                            const aTag = li.querySelector("a");
                            const text = li.textContent?.replace(date, "").trim() || "";

                            return { date, text, aText: aTag?.textContent?.trim() || "" };
                        });
                    });
                });

                const crawledData = [];

                for (const entry of entries) {
                    const { text: textContent, date: dateString, aText } = entry;

                    // Define the fallback regex for "от"
                    const fromRegex = /от\s(.+)/;

                    // Define the main regex for contractors
                    const contractorRegex = /възложител(?:и)?:?\s*([^.\n]+.*?)(?:\s*\.$|$)/gmi;

                    // Contractor extraction logic
                    let contractor;
                    const fromMatch = aText.match(fromRegex);

                    if (fromMatch) {
                        // If the new regex finds a match, use it
                        contractor = fromMatch[1].trim();
                    } else {
                        // Fall back to the main regex
                        const contractorMatch = textContent.match(contractorRegex);
                        if (contractorMatch && contractorMatch.length > 0) {
                            contractor = contractorMatch[0]
                                .replace(/възложител(?:и)?:?\s*/i, '')
                                .replace(/\s*\.$/, '')
                                .trim();
                        }
                    }

                    // Format the date
                    const dateRegex = /\d{2}\.\d{2}\.\d{4}/;
                    const dateMatch = dateString.match(dateRegex);
                    const date = dateMatch ? dateMatch[0] : null;

                    if (!date) throw new Error('Invalid date format.');

                    const crawledEntity = {
                        text: textContent,
                        ...(contractor && { contractor }),
                        date: date ? new Date(date.split('.').reverse().join('-')) : null,
                        source_url_id: sourceId,
                    };
                    logger.info(crawledEntity.contractor);
                    crawledData.push(crawledEntity);
                }

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
