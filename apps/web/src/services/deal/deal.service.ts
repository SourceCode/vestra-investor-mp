import { AppDataSource } from '../../db/data-source';
import { Deal } from '../../db/entities/Deal.entity';
import { Organization } from '../../db/entities/Organization.entity';
import { OrganizationMember } from '../../db/entities/OrganizationMember.entity';
import { User } from '../../db/entities/User.entity';
import { DealStatus } from '../../types';

export class DealService {
    private dealRepo = AppDataSource.getRepository(Deal);

    async createDeal(organizationId: string, data: Partial<Deal>, userId: string): Promise<Deal> {
        const deal = this.dealRepo.create({
            ...data,
            organizationId,
            createdById: userId,
            status: DealStatus.DRAFT
        });
        return await this.dealRepo.save(deal);
    }

    async getOrganizationDeals(organizationId: string): Promise<Deal[]> {
        return await this.dealRepo.find({
            where: { organizationId },
            order: { createdAt: 'DESC' },
            relations: ['createdBy']
        });
    }

    async getDealById(dealId: string): Promise<Deal | null> {
        return await this.dealRepo.findOne({
            where: { id: dealId },
            relations: ['organization', 'createdBy']
        });
    }

    async updateDeal(dealId: string, data: Partial<Deal>, organizationId: string): Promise<Deal | null> {
        const deal = await this.dealRepo.findOne({ where: { id: dealId, organizationId } });
        if (!deal) return null;

        Object.assign(deal, data);
        return await this.dealRepo.save(deal);
    }

    async updateDealStatus(dealId: string, status: DealStatus, organizationId: string): Promise<Deal | null> {
        const deal = await this.dealRepo.findOne({ where: { id: dealId, organizationId } });
        if (!deal) return null;

        deal.status = status;
        return await this.dealRepo.save(deal);
    }
}
