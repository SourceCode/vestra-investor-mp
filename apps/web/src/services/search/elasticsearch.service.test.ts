import { ElasticsearchService } from './elasticsearch.service';
import { AppDataSource } from '../../db/data-source';
import { Deal } from '../../db/entities/Deal.entity';

// Mock DB
jest.mock('../../db/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn()
    }
}));

describe('ElasticsearchService', () => {
    let service: ElasticsearchService;
    let mockDealRepo: any;
    let mockQb: any;

    beforeEach(() => {
        mockQb = {
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn()
        };
        mockDealRepo = {
            createQueryBuilder: jest.fn().mockReturnValue(mockQb)
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockDealRepo);
        service = new ElasticsearchService();
    });

    it('should construct query builder correctly for price filter', async () => {
        mockQb.getManyAndCount.mockResolvedValue([[], 0]);

        await service.search({
            filters: {
                minPrice: 100000,
                maxPrice: 500000
            }
        });

        expect(mockQb.andWhere).toHaveBeenCalledWith('deal.price >= :minPrice', { minPrice: 100000 });
        expect(mockQb.andWhere).toHaveBeenCalledWith('deal.price <= :maxPrice', { maxPrice: 500000 });
    });

    it('should handle text search', async () => {
        mockQb.getManyAndCount.mockResolvedValue([[], 0]);

        await service.search({ text: 'Modern' });

        expect(mockQb.where).toHaveBeenCalledWith('deal.title ILIKE :text OR deal.description ILIKE :text', { text: '%Modern%' });
    });
    it('should handle pagination (limit/offset)', async () => {
        mockQb.getManyAndCount.mockResolvedValue([[], 0]);
        await service.search({ limit: 10, offset: 20 });
        expect(mockQb.take).toHaveBeenCalledWith(10);
        expect(mockQb.skip).toHaveBeenCalledWith(20);
    });

    it('should handle sorting', async () => {
        mockQb.getManyAndCount.mockResolvedValue([[], 0]);

        await service.search({ sort: 'price_asc' });
        expect(mockQb.orderBy).toHaveBeenCalledWith('deal.price', 'ASC');

        await service.search({ sort: 'price_desc' });
        expect(mockQb.orderBy).toHaveBeenCalledWith('deal.price', 'DESC');

        await service.search({ sort: 'newest' });
        expect(mockQb.orderBy).toHaveBeenCalledWith('deal.createdAt', 'DESC');
    });

    it('should handle indexProperty (stub)', async () => {
        await expect(service.indexProperty({} as any)).resolves.toEqual(undefined);
    });

    it('should handle removeProperty (stub)', async () => {
        await expect(service.removeProperty('123')).resolves.toEqual(undefined);
    });

    it('should handle healthCheck', async () => {
        await expect(service.healthCheck()).resolves.toBe(true);
    });
});

