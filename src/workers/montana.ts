import BaseWorker from "./baseWorker";
import puppeteer from "puppeteer";
import { browserOptions } from "../config";
import WorkerMessage from "../types/workerMessage";
import CrawledDataEntry from "../types/crawledDataEntry";
import logger from "../utils/logger";
 
new class Montana extends BaseWorker {
    async run() {
        const url = this.context[0]?.url;
        const sourceId = Number(this.context[0]?.sourceUrlId);
 
        if (!url) {
            logger.error("URL not found in context!");
            return this.publishMessage({ status: "error", error: "URL not provided." });
        }
 
 
        let browser;
 
        try {
            browser = await puppeteer.launch(browserOptions);
            const page = await browser.newPage();
 
            page.on("console", (msg) => logger.debug(`Browser log: ${msg.text()}`));
            page.on("error", (err) => logger.error(`Page error: ${err}`));
 
            await page.goto(url, { waitUntil: "domcontentloaded" });
 
            try {
                await page.waitForSelector("div.dm_docs, div.dm_row", { timeout: 10000 });
            } catch (error) {
                logger.error("Main content selector not found, logging page HTML...");
                const html = await page.content();
                logger.error(`Page HTML:\n${html.substring(0, 2000)}`);
                throw new Error("Failed to find the announcements section.");
            }
 
            const announcements = await page.$$("div.dm_row");
 
 
            if (announcements.length === 0) {
                throw new Error("No announcements found.");
            }
 
            const crawledData: CrawledDataEntry[] = [];
 
            for (const [index, item] of announcements.entries()) {
 
                try {
                    const data = await item.evaluate((el) => {
                        const titleEl = el.querySelector("h3.dm_title a");
                        const textEl = el.querySelector("div.dm_description");
                        const dateEl = el.querySelector("div.dm_details table tbody tr td:nth-child(2)");
                        
                        const title = titleEl?.textContent?.trim() || "";
                        const text = textEl?.textContent?.trim() || "";
                        const rawDate = dateEl?.textContent?.trim() || "";
 
 
                        let date = '';
                        const regex = /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/;
                        const match = regex.exec(rawDate);

                        if (match) {
                            const [, day, month, year] = match;
                            const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
                            date = parsedDate.toISOString();
                        } 
                        
                        return { title, text, date };
                        
                    });
 
 
                    if (!data.text) {
                        logger.warn(`Skipping announcement ${index + 1} due to missing text.`);
                        continue;
                    }
 
                    const contractorMatch = data.text.match(/възложител(и)?:\s*(.*)/i);
                    const contractor = contractorMatch ? contractorMatch[2].replace(/[„”"]/g, "").trim() : "";
 
                    crawledData.push({
                        text: data.text,
                        ...(contractor && { contractor }),
                        date: data.date ? new Date(data.date) : new Date(0),
                        source_url_id: sourceId,
                    });
                } catch (error) {
                    logger.error(`Error processing announcement ${index + 1}: ${error}`);
                }
            }
 
 
            const message: WorkerMessage = { status: "completed", data: crawledData };
            this.publishMessage(message);
        } catch (error) {
            logger.error(`Error: ${error instanceof Error ? error.message : "Unknown error."}`);
            this.publishMessage({ status: "error", error: error instanceof Error ? error.message : "Unknown error." });
        } finally {
            if (browser) {
                await browser.close();
            }
            process.exit();
        }
    }
};
