# Phase 17: Messaging Service

## Objective
Backend service for in-app messaging between Investors and Agents.

## Dependencies
- Phase 3

## Tasks
1.  **Message Entity**
    - Fields: `sender_id`, `recipient_id`, `deal_id` (optional), `content`, `read_at`.

2.  **API Endpoints**
    - `POST /api/messages`: Send message.
    - `GET /api/messages/threads`: Get list of conversations.
    - `GET /api/messages/:threadId`: Get messages in a thread.

3.  **Grouping Logic**
    - Group messages by `deal_id` + `investor_id` for Agents.
    - Group by `agent_id` for Investors.

## Technical Considerations
- **Simplicity**: Start with REST.
- **Notifications**: Sending a message should trigger a Notification event (Phase 19).

## Verification
- User A sends message to User B.
- User B calls GET and sees the message.
