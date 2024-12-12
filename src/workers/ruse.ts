// This is a sample worker that demonstrates how to create a worker.
// This just sends a message to the main thread with mock data.

import BaseWorker from "./baseWorker";
import WorkerMessage from "../types/workerMessage";

new class Ruse extends BaseWorker {

    async run() {

        const crawledData = [
            {
                text: 'Отпадъци Отпадъци',
                contractor: 'Ruse Invest Ltd',
                date: new Date('2024-12-12T16:26:09.661Z'),
                source_url_id: BigInt(100),
            },
            {
                text: 'RDF',
                contractor: 'Ruse Invest Ltd',
                date: new Date('2024-12-12T16:26:09.661Z'),
                source_url_id: 100,
            },
            {
                text: '„Проект за изменение на Общ устройствен план на община Разлог за поземлен имот с изгаряне идентификатор 61813.559.525 по одобрени кадастрална карта и кадастрални регистри на гр. Разлог, община Разлог, област Благоевград с цел предвиждане на устройствена зона „Ок“',
                contractor: 'ОБЩИНА РАЗЛОГ',
                date: new Date('2024-12-12T10:22:00.000Z'),
                source_url_id: BigInt(100),
            }
        ];

        const message: WorkerMessage = {
            status: 'completed',
            data: crawledData,
        }

        this.publishMessage(message);
    }
}