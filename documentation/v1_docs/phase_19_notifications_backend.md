# Phase 19: Notifications System (Backend)

## Objective
Infrastructure for sending Email and System notifications.

## Dependencies
- Phase 1

## Tasks
1.  **Notification Entity**
    - Fields: `user_id`, `type`, `title`, `content`, `is_read`, `meta_data` (JSON).

2.  **Email Provider**
    - Setup `EmailService` interface.
    - Implement AWS SES or SendGrid adapter.

3.  **Event Listeners**
    - Listen for events: `investor.registered`, `message.received`, `deal.published`.
    - Handler: Create DB notification + Send Email (if user prefs allow).

4.  **API**
    - `GET /api/notifications`: List user's notifications.
    - `PUT /api/notifications/:id/read`: Mark as read.

## Technical Considerations
- **Async**: Email sending should be backgrounded (queue) if possible, or simple async function for MVP.
- **Templates**: Use a template engine (Handlebars/EJS) for emails.

## Verification
- Trigger an event (e.g., manually).
- Check `Notification` table.
- Verify Email mock/log shows email sent.
