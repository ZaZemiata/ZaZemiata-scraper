/**
 * RandomNames
 * 
 * @module mobileBg.ts
 * @author Daniel Dimitrov <danieldimitrov2304@gmail.com>
 */

// Import dependencies
import BaseWorker from "./baseWorker";
import puppeteer from 'puppeteer';
import WorkerMessage from "../types/workerMessage";
import { browserOptions } from '../config';

// MobileBg class initialization
new class mobileBg extends BaseWorker {

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

            // Wait for network to settle
            await page.waitForNetworkIdle({ idleTime: 1000 });

            const accpetCookiesButton = await page.waitForSelector('#cookiescript_accept');

            if (accpetCookiesButton)
                await accpetCookiesButton.click();

            const carNames = await page.evaluate(() => {

                // Initialize variable
                const carNames: string[] = [];

                const cars = document.querySelector('.items');

                if (cars) {

                    // Get car names
                    const names = cars.querySelectorAll('.ime');

                    // Loop through each name
                    names.forEach((name) => {

                        // Push the name
                        carNames.push(name.textContent || '');
                    });
                }

                // Return the names
                return carNames;
            })

            // Build a message
            const message: WorkerMessage = {
                status: 'completed',
                data: {
                    text: carNames.join(', '),
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