# Phase 18: Messaging UI

## Objective
Frontend chat interface.

## Dependencies
- Phase 17

## Tasks
1.  **Chat Drawer/Page**
    - Route: `/messages` or a global floating drawer.

2.  **Thread List**
    - Left sidebar showing active conversations.

3.  **Chat Window**
    - Message bubbles (Right for me, Left for them).
    - Input area with Send button.

4.  **Integration**
    - "Message Agent" on Deal Page opens this UI with `deal_id` pre-filled.

## Technical Considerations
- **Polling**: Use `useQuery` with `refetchInterval` (e.g., 5s) for MVP real-time feel.
- **UX**: Auto-scroll to bottom on new message.

## Verification
- Send message.
- Verify it appears in the list.
- Reload page, message persists.
