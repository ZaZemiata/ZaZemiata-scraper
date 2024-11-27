export default interface WorkerMessage {
    status: 'completed' | 'error';
    data?: Record<string, unknown>;
    error?: string;
}
