# Phase 3: Authentication Service Foundation

## Objective
Implement the Authentication Service using Express and JWT. Define the User entity and basic registration/login flows.

## Dependencies
- Phase 2

## Tasks
1.  **Auth Service Scaffold**
    - Create `services/auth/src/index.ts`.
    - Setup Express app with JSON body parsing and CORS.

2.  **User Entity**
    - Define `User` entity in `services/auth/src/entities/User.ts`.
    - Fields: `email`, `password_hash`, `first_name`, `last_name`, `is_active`.
    - Add unique constraint on `email`.

3.  **Password Handling**
    - Implement utility for bcrypt hashing and verification.
    - **Security**: Ensure salt rounds are sufficient (e.g., 10 or 12).

4.  **JWT Implementation**
    - Install `jsonwebtoken`.
    - Create `AuthService` class with `login` and `register` methods.
    - Define JWT payload structure (userId, email, role placeholders).

5.  **API Endpoints**
    - `POST /auth/register`: Validate input (Zod), create user, return token.
    - `POST /auth/login`: Validate credentials, return token.
    - `GET /auth/me`: specific route to get current user context.

## Technical Considerations
- **Validation**: Use `zod` for request validation.
- **Error Handling**: Middleware to catch async errors and return standard JSON-C error format.
- **Standards**: No `any` type in controllers.

## Verification
- Register a new user via Postman/curl.
- Login with the new user and receive a valid JWT.
- Access a protected route (mocked) with the JWT.
