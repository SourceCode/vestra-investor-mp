import { router } from '../trpc';
import { marketplaceRouter } from './marketplace.router';
import { messagingRouter } from './messaging.router';
import { notificationRouter } from './notification.router';
import { contractRouter } from './contract.router';
import { offerRouter } from './offer.router';
import { paymentRouter } from './payment.router';
import { transactionRouter } from './transaction.router';
import { analyticsRouter } from './analytics.router';
import { savedSearchRouter } from './saved-search.router';

export const appRouter = router({
    analytics: analyticsRouter,
    contract: contractRouter,
    marketplace: marketplaceRouter,
    messaging: messagingRouter,
    notification: notificationRouter,
    offer: offerRouter,
    payment: paymentRouter,
    transaction: transactionRouter,
    savedSearch: savedSearchRouter,
});

export type AppRouter = typeof appRouter;
