/**
 * Burgas Worker
 *
 * @module burgas.ts
 * @author Daniel Batanov <batanoff.s@protonmail.com>
 * @description This module is providing a worker for Burgas source.
 */

// Imports
import BaseWorker from './baseWorker';
import puppeteer from 'puppeteer';
import { browserOptions } from '../config';
import WorkerMessage from '../types/workerMessage';
import { parseCrawledElements } from '../utils/workers/burgas';
import CrawledDataEntry from '../types/crawledDataEntry';

new class Burgas extends BaseWorker {

    async run() {

        // Get the source URL
        const url = this.context[0].url;

        // Get the source id
        const sourceId = Number(this.context[0].sourceUrlId);

        // Initialize the browser
        let browser;

        // Try to crawl the source
        try {

            // Launch the browser
            browser = await puppeteer.launch(browserOptions);

            // Create a new page
            const page = await browser.newPage();

            // Go to the source URL
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Wait for the page to load
            await page.waitForNetworkIdle({ idleTime: 15000 });

            // Get the item container
            const container = await page.$('.single_page_content');

            // If the container is not found, throw an error
            if(!container) throw new Error('Container item not found.');

            // Call parse function to group the crawled elements
            const crawledData: CrawledDataEntry[] = await parseCrawledElements(container, sourceId);

            // Build the message
            const message: WorkerMessage = {
                status: 'completed',
                data: crawledData,
            };

            // Publish the message
            this.publishMessage(message);
        }

        // Catch the error
        catch (error) {

            // Catch any errors
            if (!(error instanceof Error)) throw new Error('An unknown error occurred.');
            
            // Build error message
            const message: WorkerMessage = {
                status: 'error',
                error: error.message,
            };

            // Publish the message
            this.publishMessage(message);
        } 
        
        // Finally
        finally {

            // Close the browser
            if (browser) await browser.close();

            // Exit the worker
            process.exit();
        }
    }
};
