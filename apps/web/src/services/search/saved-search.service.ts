import { Repository } from 'typeorm';
import { AppDataSource } from '../../db/data-source';
import { SavedSearch, SearchFrequency } from '../../db/entities/SavedSearch.entity';

export class SavedSearchService {
    private repo: Repository<SavedSearch>;

    constructor() {
        this.repo = AppDataSource.getRepository(SavedSearch);
    }

    async create(data: Partial<SavedSearch>): Promise<SavedSearch> {
        const search = this.repo.create(data);
        return await this.repo.save(search);
    }

    async list(userId: string): Promise<SavedSearch[]> {
        return await this.repo.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });
    }

    async delete(id: string, userId: string): Promise<void> {
        await this.repo.delete({ id, userId });
    }

    async update(id: string, userId: string, data: Partial<SavedSearch>): Promise<SavedSearch | null> {
        const search = await this.repo.findOneBy({ id, userId });
        if (!search) return null;
        Object.assign(search, data);
        return await this.repo.save(search);
    }
}
