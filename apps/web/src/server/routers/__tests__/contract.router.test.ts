
import { contractRouter } from '../contract.router';
import { ContractService } from '../../../services/contract/contract.service';
import { ContractStatus, ContractType } from '../../../types';

// Mock dependencies
jest.mock('../../../services/contract/contract.service');

describe('ContractRouter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const validUserId = '123e4567-e89b-12d3-a456-426614174000';
    const validDealId = '123e4567-e89b-12d3-a456-426614174001';
    const validContractId = '123e4567-e89b-12d3-a456-426614174002';

    describe('byDeal', () => {
        it('should call service.getContractsByDeal', async () => {
            const mockContracts = [{ id: validContractId }];
            (ContractService.prototype.getContractsByDeal as jest.Mock).mockResolvedValue(mockContracts);

            const caller = contractRouter.createCaller({});
            const result = await caller.byDeal({ dealId: validDealId });

            expect(ContractService.prototype.getContractsByDeal).toHaveBeenCalledWith(validDealId);
            expect(result).toEqual(mockContracts);
        });
    });

    describe('generate', () => {
        it('should call service.generateContract', async () => {
            const input = {
                dealId: validDealId,
                type: ContractType.PURCHASE_AGREEMENT
            };

            const mockContract = { id: validContractId, ...input, status: ContractStatus.DRAFT };
            (ContractService.prototype.generateContract as jest.Mock).mockResolvedValue(mockContract);

            const caller = contractRouter.createCaller({});
            const result = await caller.generate(input);

            expect(ContractService.prototype.generateContract).toHaveBeenCalledWith(
                input.dealId,
                input.type
            );
            expect(result).toEqual(mockContract);
        });
    });

    describe('updateStatus', () => {
        it('should call service.updateStatus', async () => {
            const status = ContractStatus.SIGNED;
            const mockUpdated = { id: validContractId, status };
            (ContractService.prototype.updateStatus as jest.Mock).mockResolvedValue(mockUpdated);

            const caller = contractRouter.createCaller({});
            const result = await caller.updateStatus({ id: validContractId, status });

            expect(ContractService.prototype.updateStatus).toHaveBeenCalledWith(validContractId, status);
            expect(result).toEqual(mockUpdated);
        });
    });
});
