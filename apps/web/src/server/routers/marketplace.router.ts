import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { MarketplaceService } from '../../services/marketplace/marketplace.service';
import { ElasticsearchService } from '../../services/search/elasticsearch.service';
import { SearchQuery } from '../../services/search/search.interface';

const service = new MarketplaceService();
const searchService = new ElasticsearchService();

export const marketplaceRouter = router({
    getListings: publicProcedure
        .input(
            z.object({
                location: z.string().optional(),
                priceMin: z.number().optional(),
                priceMax: z.number().optional(),
                beds: z.number().optional(),
                baths: z.number().optional(),
                propertyTypes: z.array(z.string()).optional(),
                tags: z.array(z.string()).optional(),
                sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'relevance']).optional(),
                text: z.string().optional(),
                limit: z.number().optional(),
                offset: z.number().optional(),
                includeNetworkDeals: z.boolean().optional(),
            }).optional()
        )
        .query(async ({ input }) => {
            // Use Elasticsearch for advanced filtering
            const query: SearchQuery = {
                text: input?.text || input?.location, // Map location input to text search for now
                filters: {
                    minPrice: input?.priceMin,
                    maxPrice: input?.priceMax,
                    beds: input?.beds,
                    baths: input?.baths,
                    propertyType: input?.propertyTypes
                },
                sort: (input?.sortBy as SearchQuery['sort']) || 'newest',
                limit: input?.limit || 20,
                offset: input?.offset || 0
            };

            const searchResults = await searchService.search(query);
            return searchResults.hits;
        }),

    getListing: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const listing = await service.getListing(input.id);
            return listing;
        }),
});
