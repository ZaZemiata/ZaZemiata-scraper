import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import { monthsEnum, MonthName } from "../enums/monthsEnum";
import CrawledDataEntry from "../types/crawledDataEntry";
import WorkerMessage from "../types/workerMessage";

new class VracaWorker extends BaseWorker {

    async run() {

        // Iterate over all sources
        for (const source of this.context) {

            // Get the source URL
            const { url, sourceUrlId } = source;
            const sourceId = Number(sourceUrlId);

            // Initialize the browser
            let browser;

            try {

                // Launch the browser                
                browser = await puppeteer.launch(browserOptions);

                // Create a new page
                const page = await browser.newPage();

                // Go to the source URL
                await page.goto(url, { waitUntil: "domcontentloaded" });

                // Iterate though all entry links
                const entryLinks = await page.$$eval(
                    "div.subarticles ul.list-group > a",
                    links => links.map(link => ({

                        // Store the link
                        link: link.href,
                    }))
                );

                // Throw an error if no entrie links found
                if (!entryLinks.length) throw new Error("No entries found.");

                // Store the crawled data
                const crawledData: CrawledDataEntry[] = [];

                // Iterate over the entry links
                for (const { link } of entryLinks) {

                    // Open current link
                    await page.goto(link, { waitUntil: "domcontentloaded" });

                    // Iterate over all articles
                    const articles = await page.$$eval(
                        "div.panel.panel-default div.downllll",
                        panels => panels.map(panel => ({

                            // Store their text
                            articleText: panel.querySelector("div.col-md-9.col-sm-9.col-xs-8")?.textContent?.trim() || null,
                        }))
                    );

                    // Iterate though all articles
                    for (const { articleText } of articles) {

                        // Get the date from the header
                        const dateFromHeader = await page.$eval(
                            "div.col-md-12 > h1",
                            header => header.textContent?.trim() || ''
                        );

                        // Format the date
                        const formattedDate = this.parseDate(dateFromHeader);

                        // Create crawled data entity with the new data
                        const crawledEntry: CrawledDataEntry = {
                            text: articleText || '',
                            date: formattedDate,
                            source_url_id: sourceId,
                        };

                        // Push the crawled entity to the results array
                        crawledData.push(crawledEntry);
                    }
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

    // Parse date helper function
    private parseDate(headerText: string | null): Date {

        // Date header text not found
        if (!headerText) {
            throw new Error("Date header not found.");
        }

        // Extract and validate the date from the header
        const dateRegex = /([А-Яа-я]+)\s(\d{4})\s?г\./;
        const match = headerText.match(dateRegex);

        // Date header text invalid
        if (!match) {
            throw new Error("Invalid date format.");
        }

        // Extract the month and get it's integer value from the enum
        const [, monthName, year] = match;
        const month = monthsEnum[monthName as MonthName];

        // Invalid month
        if (!month) {
            throw new Error(`'${monthName}' is not a recognized month.`);
        }

        // Return the formated date
        return new Date(Number(year), month, 1);
    }
}