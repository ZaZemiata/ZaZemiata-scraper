// Dependencies
import { assignCrawlTasks } from "./assigner";
import { crawlPendingTasks } from "./bot";

// Assign crawl tasks
// setInterval(assignCrawlTasks, 3 * 1000);

// Crawl pending tasks
setInterval(crawlPendingTasks, 2 * 1000);