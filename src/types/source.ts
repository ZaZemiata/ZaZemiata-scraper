export default interface Source {
    id: number;
    site_name: string;
    url: string;
    last_scrape_time: Date | null;
    scrape_frequency_seconds: number;
}