## ADDED Requirements

### Requirement: Passphrase gate
The app SHALL require a user to enter a correct shared passphrase before accessing any content. The passphrase SHALL be verified server-side against a hashed value stored in Supabase. An incorrect passphrase SHALL display an error and prevent access.

#### Scenario: Correct passphrase entered
- **WHEN** a user submits the correct passphrase
- **THEN** the app grants access and proceeds to identity setup or the calendar view

#### Scenario: Incorrect passphrase entered
- **WHEN** a user submits an incorrect passphrase
- **THEN** the app displays an error message and keeps the passphrase gate visible

#### Scenario: Returning user with valid session
- **WHEN** a user revisits the app and a valid Supabase session exists in the browser
- **THEN** the passphrase gate is skipped and the user proceeds directly to the calendar view

---

### Requirement: Identity setup on first visit
On first visit after passing the passphrase gate, the app SHALL prompt the user to enter a display name and select a color. The app SHALL generate a UUID as the user's `author_id`. All three values SHALL be persisted in `localStorage`.

#### Scenario: First-time visitor completes identity setup
- **WHEN** no identity exists in `localStorage` and the user submits a display name and color
- **THEN** a UUID is generated and all three values are saved to `localStorage`, and the user proceeds to the calendar

#### Scenario: Returning user with existing identity
- **WHEN** a valid identity (author_id, name, color) exists in `localStorage`
- **THEN** the identity setup screen is skipped

#### Scenario: User submits identity setup with empty name
- **WHEN** the user attempts to submit identity setup without entering a display name
- **THEN** the form shows a validation error and does not proceed

---

### Requirement: Identity persistence across sessions
The app SHALL read identity from `localStorage` on every load and use it for all post operations. The identity SHALL survive page refreshes and browser restarts.

#### Scenario: Identity survives page refresh
- **WHEN** the user refreshes the page
- **THEN** their display name, color, and author_id are restored from `localStorage` without prompting

#### Scenario: localStorage cleared
- **WHEN** `localStorage` is cleared and the user revisits
- **THEN** the app treats the visit as a first-time visit and shows identity setup
