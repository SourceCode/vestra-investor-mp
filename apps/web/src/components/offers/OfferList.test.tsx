/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import OfferList from './OfferList';
import { OfferStatus } from '../../types';
import { ToastProvider } from '../../contexts/ToastContext';

// Mock TRPC
const mockInvalidate = jest.fn();
const mockMutateAsyncCreate = jest.fn();
const mockMutateAsyncProcess = jest.fn();

// We need to allow changing the return value of useQuery for different tests
let mockOffersData: any[] = [];
let mockIsLoading = false;

jest.mock('../../utils/trpc', () => ({
    trpc: {
        useContext: jest.fn(() => ({
            offer: { byUser: { invalidate: mockInvalidate } }
        })),
        offer: {
            byUser: {
                useQuery: jest.fn(() => ({
                    data: mockOffersData,
                    isLoading: mockIsLoading
                }))
            }
        },
        payment: {
            createIntent: {
                useMutation: jest.fn(() => ({
                    mutateAsync: mockMutateAsyncCreate,
                    isPending: false
                }))
            },
            process: {
                useMutation: jest.fn(() => ({
                    mutateAsync: mockMutateAsyncProcess,
                    isPending: false
                }))
            }
        }
    }
}));

// Mock Redux
const mockAuthReducer = (state = { user: { id: 'u1' } }, action: any) => state;
const createMockStore = () => configureStore({
    reducer: {
        auth: mockAuthReducer,
        // Add other reducers if needed by selectors in OfferList (it only uses auth)
    } as any,
    preloadedState: {
        auth: { user: { id: 'u1' } }
    } as any
});

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={createMockStore()}>
        <ToastProvider>
            {children}
        </ToastProvider>
    </Provider>
);

describe('OfferList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOffersData = [];
        mockIsLoading = false;
    });

    it('renders loading state', () => {
        mockIsLoading = true;
        render(
            <Wrapper>
                <OfferList />
            </Wrapper>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders empty state', () => {
        render(
            <Wrapper>
                <OfferList />
            </Wrapper>
        );
        expect(screen.getByText('No offers submitted yet.')).toBeInTheDocument();
    });

    it('renders offers with correct status', () => {
        mockOffersData = [
            {
                id: 'o1',
                offerAmount: 500000,
                status: OfferStatus.SUBMITTED,
                createdAt: new Date().toISOString(),
                timelineDays: 30,
                earnestMoney: 5000,
                notes: 'Test offer'
            },
            {
                id: 'o2',
                offerAmount: 550000,
                status: OfferStatus.ACCEPTED,
                createdAt: new Date().toISOString(),
                timelineDays: 30,
                earnestMoney: 5000
            }
        ];

        render(
            <Wrapper>
                <OfferList />
            </Wrapper>
        );

        expect(screen.getByText('$500,000')).toBeInTheDocument();
        expect(screen.getByText('SUBMITTED')).toBeInTheDocument();

        expect(screen.getByText('$550,000')).toBeInTheDocument();
        expect(screen.getByText('ACCEPTED')).toBeInTheDocument();

        // Accepted offer should show Pay EMD button
        expect(screen.getByText(/Pay EMD/)).toBeInTheDocument();
    });

    it('initiates payment when Pay EMD is clicked', async () => {
        // Mock window.confirm
        const confirmSpy = jest.spyOn(window, 'confirm');
        confirmSpy.mockImplementation(() => true);

        mockMutateAsyncCreate.mockResolvedValue({ id: 'payment-intent-1' });
        mockMutateAsyncProcess.mockResolvedValue({ status: 'COMPLETED' });

        mockOffersData = [
            {
                id: 'o2',
                offerAmount: 550000,
                status: OfferStatus.ACCEPTED,
                createdAt: new Date().toISOString(),
                timelineDays: 30,
                earnestMoney: 5000
            }
        ];

        render(
            <Wrapper>
                <OfferList />
            </Wrapper>
        );

        const payBtn = screen.getByText(/Pay EMD/);
        fireEvent.click(payBtn);

        expect(confirmSpy).toHaveBeenCalled();

        await waitFor(() => {
            expect(mockMutateAsyncCreate).toHaveBeenCalledWith(expect.objectContaining({
                offerId: 'o2',
                amount: 5000,
                userId: 'u1'
            }));
            expect(mockMutateAsyncProcess).toHaveBeenCalledWith({ paymentId: 'payment-intent-1' });
        });
    });
});
