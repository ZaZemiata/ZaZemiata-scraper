// Dependencies
import { assignCrawlTasks } from "./assigner";
import { crawlPendingTasks } from "./bot";

// Assign crawl tasks
setInterval(assignCrawlTasks, 60 * 1000);

// Crawl pending tasks
setInterval(crawlPendingTasks, 10 * 1000);