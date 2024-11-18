export default interface CrawlTask {
    id: number;
    site_id: number;
    status: 'pending' | 'in-progress' | 'cancelled' | 'completed' | 'error';
    created_at: Date;
    completed_at?: Date;
    data?: Record<string, unknown>;
    error?: string;
}
