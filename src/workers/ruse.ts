// This is a sample worker that demonstrates how to create a worker.
// This just sends a message to the main thread with mock data.

import BaseWorker from "./baseWorker";
import WorkerMessage from "../types/workerMessage";

new class Ruse extends BaseWorker {

    async run() {

        const crawledData = [
            {
                text: 'Title 1',
                contractor: 'https://example.com',
                date: new Date(),
                source_url_id: BigInt(100),
            },
        ];


        const message: WorkerMessage = {
            status: 'completed',
            data: crawledData,
        }

        this.publishMessage(message);
    }
}