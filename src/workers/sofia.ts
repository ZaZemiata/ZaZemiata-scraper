import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";
import CrawledDataEntry from "../types/crawledDataEntry";

new class Sofia extends BaseWorker {
    async run() {
        const url = this.context[0].url;
        const sourceId = Number(this.context[0].sourceUrlId);

        let browser;

        try {
            browser = await puppeteer.launch(browserOptions);
            const page = await browser.newPage();

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            await new Promise((resolve) => setTimeout(resolve, 5000));

            const linkSelector = 'a[href*="id=702"]';
            await page.waitForSelector(linkSelector, { timeout: 10000 });
            await page.click(linkSelector);

            try {
                await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 });
            } catch (navError) {
                console.warn("Navigation took too long. Continuing...");
            }

            const containerSelector = 'div.item-page';
            await page.waitForSelector(containerSelector, { timeout: 10000 });

            const announcementsContainer = await page.$(containerSelector);
            if (!announcementsContainer) throw new Error("Announcements container not found!");

            const paragraphs = await announcementsContainer.$$('p');
            if (paragraphs.length === 0) throw new Error("No announcements found in paragraphs!");

            const crawledData: CrawledDataEntry[] = [];

            let contractor = ''; // Store contractor information
            let text = ''; // Store the main text

            for (const paragraph of paragraphs) {
                const data = await paragraph.evaluate((el) => {
                    const textContent = el.textContent?.trim();
                    const style = el.getAttribute('style') || '';
                    return { text: textContent || '', style };
                });

                if (!data.text) continue;

                if (data.style.includes('text-align: center')) {
                    // Extract contractor from centered paragraphs
                    contractor = data.text.replace(/[„”"]/g, '').trim();
                } else if (data.style.includes('text-align: justify')) {
                    // Extract main text from justified paragraphs
                    text += (text ? '\n' : '') + data.text;
                }
            }

            if (!text) throw new Error("No main text found!");
            if (!contractor) console.warn("No contractor information found!");

            // Extract date from text
            const dateMatch = text.match(/(?:\d{1,2}\.\d{1,2}\.\d{4}|\d{4}-\d{2}-\d{2})/);
            const date = dateMatch ? new Date(dateMatch[0].split('.').reverse().join('-')) : new Date();

            crawledData.push({
                text,
                contractor,
                date,
                source_url_id: sourceId,
            });

            const message: WorkerMessage = {
                status: 'completed',
                data: crawledData,
            };
            this.publishMessage(message);
        } catch (error) {
            const message: WorkerMessage = {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error occurred.',
            };
            this.publishMessage(message);
        } finally {
            if (browser) await browser.close();
            process.exit();
        }
    }
};
