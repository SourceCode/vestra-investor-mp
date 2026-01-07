import { AppDataSource } from '../../db/data-source';
import { TransactionStep } from '../../db/entities/TransactionStep.entity';
import { TransactionRole, TransactionStepStatus } from '../../types';
import { Deal } from '../../db/entities/Deal.entity';
import { Contract } from '../../db/entities/Contract.entity';
import { ContractStatus } from '../../types';
import { DealStatus } from '../../types';

export class TransactionService {
    private stepRepo = AppDataSource.getRepository(TransactionStep);
    private dealRepo = AppDataSource.getRepository(Deal);
    private contractRepo = AppDataSource.getRepository(Contract);

    /**
     * Initializes default transaction steps for a deal.
     * Idempotent: if steps exist, returns them.
     */
    async initializeSteps(dealId: string): Promise<TransactionStep[]> {
        const existing = await this.stepRepo.findBy({ dealId });
        if (existing.length > 0) return existing;

        const defaults = [
            { label: 'Offer Accepted', order: 1, assignedTo: TransactionRole.SYSTEM, status: TransactionStepStatus.COMPLETE, completedAt: new Date() },
            { label: 'Earnest Money Deposited', order: 2, assignedTo: TransactionRole.INVESTOR, status: TransactionStepStatus.PENDING },
            { label: 'Title Search Ordered', order: 3, assignedTo: TransactionRole.AGENT, status: TransactionStepStatus.PENDING },
            { label: 'Property Inspection', order: 4, assignedTo: TransactionRole.INVESTOR, status: TransactionStepStatus.PENDING },
            { label: 'Appraisal', order: 5, assignedTo: TransactionRole.AGENT, status: TransactionStepStatus.PENDING },
            { label: 'Final Walkthrough', order: 6, assignedTo: TransactionRole.INVESTOR, status: TransactionStepStatus.PENDING },
            { label: 'Closing Documents Signed', order: 7, assignedTo: TransactionRole.SELLER, status: TransactionStepStatus.PENDING },
            { label: 'Funds Transferred', order: 8, assignedTo: TransactionRole.INVESTOR, status: TransactionStepStatus.PENDING },
            { label: 'Keys Handed Over', order: 9, assignedTo: TransactionRole.AGENT, status: TransactionStepStatus.PENDING },
        ];

        const output: TransactionStep[] = [];
        for (const d of defaults) {
            const step = this.stepRepo.create({
                dealId,
                label: d.label,
                order: d.order,
                assignedTo: d.assignedTo,
                status: d.status,
                completedAt: d.completedAt
            });
            output.push(await this.stepRepo.save(step));
        }

        return output.sort((a, b) => a.order - b.order);
    }

    async getStepsByDeal(dealId: string): Promise<TransactionStep[]> {
        let steps = await this.stepRepo.find({
            where: { dealId },
            order: { order: 'ASC' }
        });

        if (steps.length === 0) {
            steps = await this.initializeSteps(dealId);
        }
        return steps;
    }

    async updateStepStatus(id: string, status: TransactionStepStatus): Promise<TransactionStep | null> {
        const step = await this.stepRepo.findOneBy({ id });
        if (!step) return null;

        step.status = status;
        if (status === TransactionStepStatus.COMPLETE) {
            step.completedAt = new Date();
        } else {
            step.completedAt = null as any; // Reset if moving back
        }

        return this.stepRepo.save(step);
    }

    async closeDeal(dealId: string): Promise<void> {
        // 1. Verify all steps are complete
        const steps = await this.stepRepo.findBy({ dealId });
        const incompleteSteps = steps.filter(s => s.status !== TransactionStepStatus.COMPLETE);

        if (incompleteSteps.length > 0) {
            throw new Error(`Cannot close deal. Incomplete steps: ${incompleteSteps.map(s => s.label).join(', ')}`);
        }

        // 2. Verify Contract is Signed
        const contracts = await this.contractRepo.findBy({ dealId });
        const hasSignedContract = contracts.some(c => c.status === ContractStatus.SIGNED);

        if (!hasSignedContract) {
            // Optional: Enforce specific contract type requirements if needed
            throw new Error('Cannot close deal. ROI / Purchase Agreement must be signed.');
        }

        // 3. Update Deal Status
        const deal = await this.dealRepo.findOneBy({ id: dealId });
        if (!deal) throw new Error('Deal not found');

        deal.status = DealStatus.CLOSED;
        await this.dealRepo.save(deal);
    }
}
