# Phase 34: ElasticSearch Integration

## Objective
Implement advanced search capabilities using ElasticSearch (or OpenSearch).

## Dependencies
- Phase 11

## Tasks
1.  **Infrastructure**
    - Add ElasticSearch/OpenSearch to `docker-compose`.
    - Install client library.

2.  **Indexing Pipeline**
    - Create TypeORM Subscriber: On `Deal` save/update, push to ES index.
    - Script `scripts/reindex.ts`: Re-index existing DB data.

3.  **Search API**
    - `GET /api/search/deals?q=...`: Proxy to ES query.
    - Support fuzzy matching on Title/Description.

## Technical Considerations
- **Mapping**: Define strict mapping for ES index (geo_point for location).
- **Sync Latency**: Accept near-real-time consistency.

## Verification
- Create deal "Beautiful Villa".
- Search for "Vila" (fuzzy).
- Deal appears in results.
