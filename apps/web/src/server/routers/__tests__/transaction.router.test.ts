
import { transactionRouter } from '../transaction.router';
import { TransactionService } from '../../../services/transaction/transaction.service';
import { TransactionStepStatus } from '../../../types';

jest.mock('../../../services/transaction/transaction.service');

describe('TransactionRouter', () => {
    let mockService: jest.Mocked<TransactionService>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockService = new TransactionService() as jest.Mocked<TransactionService>;
    });

    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    describe('byDeal', () => {
        it('should call service.getStepsByDeal', async () => {
            const mockSteps = [{ id: 'step-1' }];
            (TransactionService.prototype.getStepsByDeal as jest.Mock).mockResolvedValue(mockSteps);

            const caller = transactionRouter.createCaller({});
            const result = await caller.byDeal({ dealId: validUUID });

            expect(TransactionService.prototype.getStepsByDeal).toHaveBeenCalledWith(validUUID);
            expect(result).toEqual(mockSteps);
        });
    });

    describe('updateStep', () => {
        it('should call service.updateStepStatus', async () => {
            const stepId = validUUID;
            const status = TransactionStepStatus.COMPLETE;
            const mockStep = { id: stepId, status };

            (TransactionService.prototype.updateStepStatus as jest.Mock).mockResolvedValue(mockStep);

            const caller = transactionRouter.createCaller({});
            const result = await caller.updateStep({ id: stepId, status });

            expect(TransactionService.prototype.updateStepStatus).toHaveBeenCalledWith(stepId, status);
            expect(result).toEqual(mockStep);
        });
    });

    describe('closeDeal', () => {
        it('should call service.closeDeal', async () => {
            const dealId = 'deal-1';
            (TransactionService.prototype.closeDeal as jest.Mock).mockResolvedValue({ id: dealId, status: 'CLOSED' });

            const caller = transactionRouter.createCaller({});
            const result = await caller.closeDeal({ dealId });

            expect(TransactionService.prototype.closeDeal).toHaveBeenCalledWith(dealId);
            expect(result).toEqual({ id: dealId, status: 'CLOSED' });
        });
    });
});
