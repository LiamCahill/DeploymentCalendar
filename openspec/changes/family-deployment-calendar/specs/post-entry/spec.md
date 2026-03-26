## ADDED Requirements

### Requirement: Open day modal on tile click
Clicking a day tile SHALL open a modal that displays all existing posts for that day and, if the current user has not yet posted, a form to create a new post.

#### Scenario: User clicks a day with no posts
- **WHEN** the user clicks a day tile with no existing posts
- **THEN** a modal opens showing an empty state and a post creation form

#### Scenario: User clicks a day with existing posts
- **WHEN** the user clicks a day tile that has one or more posts
- **THEN** a modal opens showing all posts for that day, ordered by creation time, followed by the creation form if the user has not yet posted that day

#### Scenario: User clicks a day on which they already posted
- **WHEN** the user clicks a day tile and they already have a post for that day
- **THEN** the modal shows all posts and displays the user's existing post with an edit option instead of a creation form

---

### Requirement: Create a post
The app SHALL allow the current user to submit one post per day containing text, one or more photos, or both. The post SHALL be stored in Supabase with the user's `author_id`, display name, color, and the date.

#### Scenario: User submits a text-only post
- **WHEN** the user enters text and submits without attaching photos
- **THEN** the post is saved and appears in the day modal immediately

#### Scenario: User submits a post with photos
- **WHEN** the user attaches one or more photos and submits
- **THEN** photos are uploaded to Supabase Storage and the post is saved with their storage paths

#### Scenario: User submits an empty post
- **WHEN** the user attempts to submit without entering text or attaching a photo
- **THEN** the form shows a validation error and does not save

#### Scenario: Duplicate post prevented
- **WHEN** the user attempts to create a second post on a day they already posted
- **THEN** the creation form is not shown; the existing post's edit flow is offered instead

---

### Requirement: Edit a post (honor system)
Any authenticated session SHALL be able to edit any post. Editing opens the post's text and photo list for modification. Changes SHALL be saved via upsert.

#### Scenario: User edits their own post text
- **WHEN** the user modifies the text of a post and saves
- **THEN** the updated text is persisted and displayed in the modal

#### Scenario: User edits another person's post
- **WHEN** the user clicks edit on a post authored by a different family member
- **THEN** the edit form opens and the user can save changes (honor system — no ownership check)

#### Scenario: User removes a photo during edit
- **WHEN** the user removes a photo from an existing post and saves
- **THEN** the photo is deleted from Supabase Storage and no longer appears on the post

---

### Requirement: Post attribution display
Each post in the day modal SHALL display the author's display name and color alongside the post content.

#### Scenario: Post shows author name and color
- **WHEN** a post is rendered in the day modal
- **THEN** the author's display name and color indicator are visible
