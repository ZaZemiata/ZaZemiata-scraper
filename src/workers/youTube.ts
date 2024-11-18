/**
 * YouTube
 * 
 * @module youTube.ts
 * @author Daniel Dimitrov <danieldimitrov2304@gmail.com>
 */

// Import dependencies
import { parentPort, workerData } from 'worker_threads';
import puppeteer from 'puppeteer';
import WorkerData from '../types/workerData';
import WorkerMessage from '../types/workerMessage';
import { browserOptions } from '../config';
import BaseWorker from './baseWorker';

// YouTube class initialization
new class YouTube extends BaseWorker {

    public async run() {

        // Destructure worker data
        const { url, sourceId }: WorkerData = workerData;

        // Declare browser variable
        let browser;

        // Prepare for error handling
        try {

            // Launch browser
            browser = await puppeteer.launch(browserOptions);

            // Open new page
            const page = await browser.newPage();

            // Go to URL
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Wait for network to settle
            await page.waitForNetworkIdle({ idleTime: 2000 });

            const acceptButton = await page.waitForSelector('xpath///*[@id="content"]/div[2]/div[6]/div[1]/ytd-button-renderer[2]/yt-button-shape/button');

            if (acceptButton)
                await acceptButton.click();

            // Wait for network to settle
            await page.waitForNetworkIdle({ idleTime: 2000 });

            // Wait for search bar to appear
            const searchBar = await page.waitForSelector('xpath///*[@name="search_query"]');

            // If search bar not found, throw error
            if (!searchBar)
                throw new Error('Search bar not found');

            // Click on search bar
            await searchBar.click();

            // Get random search input from the list
            const searchInput = ['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'typescript'][Math.floor(Math.random() * 10)];

            // Type 'javascript' in search bar
            await page.keyboard.type(searchInput, { delay: 150 });

            // Press enter
            await page.keyboard.press('Enter', { delay: 150 });

            // Wait for network to settle
            await page.waitForNetworkIdle({ idleTime: 2000 });

            // Get first video's title
            const videoTitle = await page.evaluate(() => {

                // Query for title
                return document.querySelector('h3#title')?.getAttribute('title') || '';
            });

            // Build completion message
            const message: WorkerMessage = {
                status: 'completed', data: {
                    text: videoTitle,
                    publication_date: new Date(),
                    sourceId: sourceId,
                }
            };

            // Send message
            parentPort?.postMessage(message);

        }

        // Handle errors
        catch (error) {

            // Build error message
            const message: WorkerMessage = { status: 'error', error: (error as Error).message };

            // Send message
            parentPort?.postMessage(message);
        }

        // Exit worker
        finally {

            // Close browser
            if (browser)
                await browser.close();

            // Exit worker
            process.exit();
        }
    }
}