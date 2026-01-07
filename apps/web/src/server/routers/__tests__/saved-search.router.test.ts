
import { savedSearchRouter } from '../saved-search.router';
import { SavedSearchService } from '../../../services/search/saved-search.service';
import { SearchFrequency } from '../../../db/entities/SavedSearch.entity';

// Mock dependencies
jest.mock('../../../services/search/saved-search.service');

describe('SavedSearchRouter', () => {
    // We don't really need the instance variable if we use prototype mocking

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should call service.create with correct data', async () => {
            const input = {
                name: 'My Search',
                criteria: { location: 'New York' },
                frequency: SearchFrequency.DAILY,
                organizationId: 'org-123',
                userId: 'user-123-uuid-format-required'
            };
            const validZodInput = {
                ...input,
                userId: '123e4567-e89b-12d3-a456-426614174000',
                organizationId: 'org-1'
            };

            const mockSavedSearch = { id: 'search-1', ...validZodInput };
            (SavedSearchService.prototype.create as jest.Mock).mockResolvedValue(mockSavedSearch);

            const caller = savedSearchRouter.createCaller({});
            const result = await caller.create(validZodInput);

            expect(SavedSearchService.prototype.create).toHaveBeenCalledWith(validZodInput);
            expect(result).toEqual(mockSavedSearch);
        });
    });

    describe('list', () => {
        it('should call service.list with userId', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const mockList = [{ id: '1', name: 'Test' }];
            (SavedSearchService.prototype.list as jest.Mock).mockResolvedValue(mockList);

            const caller = savedSearchRouter.createCaller({});
            const result = await caller.list({ userId });

            expect(SavedSearchService.prototype.list).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockList);
        });
    });

    describe('delete', () => {
        it('should call service.delete', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const id = 'search-1';

            (SavedSearchService.prototype.delete as jest.Mock).mockResolvedValue(undefined);

            const caller = savedSearchRouter.createCaller({});
            const result = await caller.delete({ id, userId });

            expect(SavedSearchService.prototype.delete).toHaveBeenCalledWith(id, userId);
            expect(result).toEqual({ success: true });
        });
    });

    describe('update', () => {
        it('should call service.update', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const id = 'search-1';
            const data = { name: 'New Name' };

            const mockUpdated = { id, userId, ...data };
            (SavedSearchService.prototype.update as jest.Mock).mockResolvedValue(mockUpdated);

            const caller = savedSearchRouter.createCaller({});
            const result = await caller.update({ id, userId, data });

            expect(SavedSearchService.prototype.update).toHaveBeenCalledWith(id, userId, data);
            expect(result).toEqual(mockUpdated);
        });
    });
});
