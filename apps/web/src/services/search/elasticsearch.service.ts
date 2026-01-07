import { Property } from '../../types';
import { SearchAdapter, SearchQuery, SearchResult } from './search.interface';
import { AppDataSource } from '../../db/data-source';
import { Deal } from '../../db/entities/Deal.entity';
// In a real implementation, we would import Client from '@elastic/elasticsearch'

export class ElasticsearchService implements SearchAdapter {
    private isConnected: boolean = false;
    // private client: Client;

    constructor() {
        // this.client = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });
        this.isConnected = true; // Simulating connection
    }

    async indexProperty(property: Property): Promise<void> {
        console.log(`[Elasticsearch] Indexing property ${property.id}`);
        // await this.client.index({ index: 'properties', id: property.id, document: property });
        return Promise.resolve();
    }

    async removeProperty(id: string): Promise<void> {
        console.log(`[Elasticsearch] Removing property ${id}`);
        // await this.client.delete({ index: 'properties', id });
        return Promise.resolve();
    }

    async search(query: SearchQuery): Promise<SearchResult> {
        console.log(`[Elasticsearch] Searching:`, JSON.stringify(query));

        // Mock implementation relying on DB fallback logic or simple simulation
        // For verify purpose, let's just return a mock response or even query the DB directly to simulate "search results"
        // This hybrid approach is common during migration: Service interface matches ES, but implementation hits DB temporarily.

        const dealRepo = AppDataSource.getRepository(Deal);

        let qb = dealRepo.createQueryBuilder('deal');

        if (query.text) {
            qb.where('deal.title ILIKE :text OR deal.description ILIKE :text', { text: `%${query.text}%` });
        }

        if (query.filters?.minPrice) {
            qb.andWhere('deal.price >= :minPrice', { minPrice: query.filters.minPrice });
        }

        if (query.filters?.maxPrice) {
            qb.andWhere('deal.price <= :maxPrice', { maxPrice: query.filters.maxPrice });
        }

        if (query.limit) {
            qb.take(query.limit);
        }

        if (query.offset) {
            qb.skip(query.offset);
        }

        if (query.sort) {
            switch (query.sort) {
                case 'price_asc': qb.orderBy('deal.price', 'ASC'); break;
                case 'price_desc': qb.orderBy('deal.price', 'DESC'); break;
                case 'newest': qb.orderBy('deal.createdAt', 'DESC'); break;
                // Relevance not supported in DB simple query
            }
        }

        const [deals, total] = await qb.getManyAndCount();

        // Convert Deals to Property interface (partial mapping for mock)
        const hits = deals.map(d => ({
            id: d.id,
            address: d.address,
            price: Number(d.price),
            description: d.description || '',
            // ... other mapping
        } as any as Property));

        return {
            hits,
            total
        };
    }

    async healthCheck(): Promise<boolean> {
        return this.isConnected;
    }
}
