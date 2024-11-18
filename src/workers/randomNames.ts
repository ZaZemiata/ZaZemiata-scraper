/**
 * RandomNames
 * 
 * @module randomNames.ts
 * @author Daniel Dimitrov <danieldimitrov2304@gmail.com>
 */

// Import dependencies
import BaseWorker from "./baseWorker";
import puppeteer from 'puppeteer';
import WorkerMessage from "../types/workerMessage";
import { browserOptions } from '../config';

// RandomNames class initialization
new class RandomNames extends BaseWorker {

    // Run
    public async run() {

        // Destructure the context
        const { url, sourceId } = this.context;

        // Initialize the browser
        let browser;

        // Prepare for errors
        try {

            // Launch the browser with options
            browser = await puppeteer.launch(browserOptions);

            // Create a new page
            const page = await browser.newPage();

            // Go to the URL
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Initialize variable
            let name = '';

            // Loop until name is found
            while (!name || name === '...') {

                // Query the name
                name = await page.evaluate(() => {
                    return document.querySelector('#user_value')?.textContent || '';
                });
            }

            // Build a message
            const message: WorkerMessage = {
                status: 'completed',
                data: {
                    text: name,
                    publication_date: new Date(),
                    sourceId,
                },
            };

            // Publish the message
            await this.publishMessage(message);
        }

        // Catch errors
        catch (error) {

            // Build error message
            const message: WorkerMessage = { status: 'error', error: (error as Error).message };

            // Publish the message
            await this.publishMessage(message);
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