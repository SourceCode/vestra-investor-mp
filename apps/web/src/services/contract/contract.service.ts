import { AppDataSource } from '../../db/data-source';
import { Contract } from '../../db/entities/Contract.entity';
import { ContractStatus, ContractType } from '../../types';

export class ContractService {
    private repo = AppDataSource.getRepository(Contract);

    async generateContract(dealId: string, type: ContractType = ContractType.PURCHASE_AGREEMENT): Promise<Contract> {
        // Check if one already exists
        const existing = await this.repo.findOne({
            where: { dealId, type }
        });

        if (existing) return existing;

        // In a real app, we would generate a PDF here
        const mockContent = `PURCHASE AGREEMENT\n\nThis agreement is made on ${new Date().toLocaleDateString()}...`;

        const contract = this.repo.create({
            dealId,
            type,
            status: ContractStatus.GENERATED,
            content: mockContent,
            generatedAt: new Date()
        });

        return this.repo.save(contract);
    }

    async getContractsByDeal(dealId: string): Promise<Contract[]> {
        return this.repo.find({
            where: { dealId },
            order: { generatedAt: 'DESC' }
        });
    }

    async updateStatus(id: string, status: ContractStatus): Promise<Contract | null> {
        const contract = await this.repo.findOneBy({ id });
        if (!contract) return null;

        contract.status = status;
        if (status === ContractStatus.SIGNED) {
            contract.signedAt = new Date();
        }
        return this.repo.save(contract);
    }
}
