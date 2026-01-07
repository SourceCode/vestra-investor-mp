import { Property } from '../../types';

export interface SearchQuery {
    text?: string;
    filters?: {
        minPrice?: number;
        maxPrice?: number;
        beds?: number;
        baths?: number;
        propertyType?: string[];
        location?: {
            lat: number;
            lng: number;
            radius: number; // in miles
        };
    };
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'relevance';
    limit?: number;
    offset?: number;
}

export interface SearchResult {
    hits: Property[];
    total: number;
    facets?: Record<string, Record<string, number>>; // e.g., propertyType: { "Single Family": 10 }
}

export interface SearchAdapter {
    indexProperty(property: Property): Promise<void>;
    removeProperty(id: string): Promise<void>;
    search(query: SearchQuery): Promise<SearchResult>;
    healthCheck(): Promise<boolean>;
}
