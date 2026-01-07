
import { marketplaceRouter } from '../marketplace.router';
import { MarketplaceService } from '../../../services/marketplace/marketplace.service';
import { ElasticsearchService } from '../../../services/search/elasticsearch.service';
import { SearchQuery } from '../../../services/search/search.interface';

// Mock dependencies
jest.mock('../../../services/marketplace/marketplace.service');
jest.mock('../../../services/search/elasticsearch.service');

describe('MarketplaceRouter', () => {
    let mockSearchService: jest.Mocked<ElasticsearchService>;
    let mockMarketplaceService: jest.Mocked<MarketplaceService>;

    beforeEach(() => {
        jest.clearAllMocks();
        // Get the mock instances
        mockSearchService = new ElasticsearchService() as jest.Mocked<ElasticsearchService>;
        mockMarketplaceService = new MarketplaceService() as jest.Mocked<MarketplaceService>;
    });


    describe('getListings', () => {
        it('should call searchService.search with correct parameters', async () => {
            const input = {
                location: 'New York',
                priceMin: 500000,
                priceMax: 1000000,
                beds: 2,
                limit: 10,
                offset: 5,
                sortBy: 'price_asc' as const
            };

            const mockHits = [{ id: '1', price: 600000 }];
            (ElasticsearchService.prototype.search as jest.Mock).mockResolvedValue({
                hits: mockHits,
                total: 100,
                facets: {}
            });

            const caller = marketplaceRouter.createCaller({});
            const result = await caller.getListings(input);

            expect(ElasticsearchService.prototype.search).toHaveBeenCalledWith(expect.objectContaining({
                text: 'New York',
                filters: expect.objectContaining({
                    minPrice: 500000,
                    maxPrice: 1000000,
                    beds: 2
                }),
                sort: 'price_asc',
                limit: 10,
                offset: 5
            }));
            expect(result).toEqual(mockHits);
        });

        it('should use default values when input is empty', async () => {
            (ElasticsearchService.prototype.search as jest.Mock).mockResolvedValue({ hits: [], total: 0, facets: {} });

            const caller = marketplaceRouter.createCaller({});
            await caller.getListings({});

            expect(ElasticsearchService.prototype.search).toHaveBeenCalledWith(expect.objectContaining({
                limit: 20,
                offset: 0,
                sort: 'newest'
            }));
        });
    });

    describe('getListing', () => {
        it('should call service.getListing with correct ID', async () => {
            const mockListing = { id: '123', price: 500000 };
            (MarketplaceService.prototype.getListing as jest.Mock).mockResolvedValue(mockListing);

            const caller = marketplaceRouter.createCaller({});
            const result = await caller.getListing({ id: '123' });

            expect(MarketplaceService.prototype.getListing).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockListing);
        });
    });
});
