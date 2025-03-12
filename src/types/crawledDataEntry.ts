type CrawledDataEntry = {
    text: string;
    source_url_id: number | bigint;
    date: Date;    
    contractor?: string;
    sourceArticle?: string;
};

export default CrawledDataEntry;