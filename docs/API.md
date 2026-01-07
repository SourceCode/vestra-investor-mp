# Homify-v1 API Documentation

## Overview
Homify-v1 uses [tRPC](https://trpc.io) for type-safe API communication between the React frontend and Node.js backend.

## Base URL
- Development: `http://localhost:4000/trpc`
- Production: `https://<domain>/trpc`

## Routers
The API is organized into the following namespaces (routers).

### `analytics`
- Dashboard metrics and KPI data aggregation.
- Endpoints: `dashboard` (query).

### `contract`
- Sales contract management.
- Endpoints: `create`, `update`, `sign`.

### `marketplace`
- Property search and listing retrieval.
- Endpoints: `getListings` (query with filters), `getById`.
- Integrates with Elasticsearch (currently via TypeORM stub).

### `messaging`
- Real-time chat functionality.
- Endpoints: `createConversation`, `sendMessage`, `getConversations`, `getMessages`.

### `notification`
- User notifications and preferences.
- Endpoints: `list`, `markAsRead`, `preferences`.

### `offer`
- Purchase offer management.
- Endpoints: `create`, `byDeal`, `byUser`, `updateStatus`.

### `payment`
- Payment processing for earnest money and fees.
- Endpoints: `createIntent`, `confirm`.

### `savedSearch`
- Saved search criteria and notifications.
- Endpoints:
  - `create`: Save a new search.
  - `list`: Get user's saved searches.
  - `delete`: Remove a saved search.
  - `update`: Modify frequency or criteria.

### `transaction`
- Deal closing workflows and transaction steps.
- Endpoints: `start`, `closeDeal`, `updateStep`.

## Usage Example (Frontend)

```typescript
// Query
const { data: listings } = trpc.marketplace.getListings.useQuery({
  location: 'New York',
  priceMax: 1000000
});

// Mutation
const { mutate: saveSearch } = trpc.savedSearch.create.useMutation({
  onSuccess: () => {
    console.log('Search saved!');
  }
});

saveSearch({
  name: 'My Dream Home',
  criteria: { location: 'New York' },
  frequency: 'WEEKLY'
});
```

## Security
- **Authentication**: JWT-based via HTTP headers.
- **Rate Limiting**: 5000 requests / 15 mins.
- **Headers**: Helmet protection (CSP, CRP).
