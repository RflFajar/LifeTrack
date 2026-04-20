# Firebase Security Specification - LifeTrack Engine

## Data Invariants
1. A schedule item must belong to the authenticated user.
2. Financial transactions must have a positive amount and valid type (income/expense).
3. User profile can only be read and written by the owner.
4. Document IDs must be valid alphanumeric strings.
5. All dates should be strings in ISO format.

## Dirty Dozen Payloads (to be rejected)
1. **Unauthorized Write**: Writing to `users/differentUser/profile/data`.
2. **Identity Spoofing**: Creating a transaction with `userId` of another user.
3. **Invalid Amount**: Transaction with a negative amount.
4. **Invalid Type**: Transaction with type "loot".
5. **Shadow Field Injection**: Adding `isAdmin: true` to a profile document.
6. **ID Poisoning**: Using a 2KB string as a document ID.
7. **Orphaned Schedule**: Creating a schedule item without a title.
8. **Malicious Date**: Setting `createdAt` to a date in 1970 instead of `request.time`.
9. **Blanket Read Exposure**: Attempting to list all users' profiles.
10. **Schema Bypass**: Updating a transaction but setting `amount` to a boolean.
11. **Immutable Violation**: Changing the `userId` field of an existing transaction.
12. **Terminal State Lock Bypass**: (If applicable, but here mostly ownership locks).

## Implementation Plan
I will implement rules that enforce:
- User ownership via `request.auth.uid`.
- Strict schema validation in a helper function.
- `affectedKeys().hasOnly()` for updates.
- Valid document IDs using regex.
