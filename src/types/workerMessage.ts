interface WorkerMessageBase {
    status: 'completed' | 'error';
}

interface CompletedWorkerMessage extends WorkerMessageBase {
    status: 'completed';
    data: Record<string, unknown>[];
}

interface ErrorWorkerMessage extends WorkerMessageBase {
    status: 'error';
    error: string;
}

type WorkerMessage = CompletedWorkerMessage | ErrorWorkerMessage;

export default WorkerMessage;