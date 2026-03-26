## 1. Project Scaffolding

- [x] 1.1 Initialize Vite + React project with TypeScript
- [x] 1.2 Install and configure Tailwind CSS
- [x] 1.3 Install and configure shadcn/ui (dialog, button, input, toast components)
- [x] 1.4 Install Supabase JS client (`@supabase/supabase-js`)
- [x] 1.5 Install `@react-pdf/renderer` for PDF export
- [x] 1.6 Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders
- [x] 1.7 Create `src/lib/supabase.ts` Supabase client singleton

## 2. Supabase Setup

- [x] 2.1 Create Supabase project and note URL + anon key
- [x] 2.2 Create `app_config` table with a `passphrase_hash` row for server-side passphrase verification
- [x] 2.3 Create `posts` table: `id`, `date` (date), `author_id` (uuid), `author_name` (text), `author_color` (text), `content` (text), `photo_paths` (text[]), `created_at`, `updated_at`
- [x] 2.4 Add unique constraint on `(date, author_id)` in `posts`
- [x] 2.5 Enable Supabase anonymous sign-in
- [x] 2.6 Write RLS policies: require authenticated session for all `posts` CRUD; restrict `app_config` reads to authenticated sessions
- [x] 2.7 Create private Supabase Storage bucket `post-photos`
- [x] 2.8 Write Storage RLS policies: authenticated sessions may upload/read/delete their own objects (honor-system: allow delete of any object for editing)

## 3. Auth — Passphrase Gate

- [x] 3.1 Create `PassphraseGate` component with a password input and submit button
- [x] 3.2 Implement passphrase verification: call Supabase anonymous sign-in, then query `app_config` to compare hash; reject on mismatch and destroy session
- [x] 3.3 Persist valid session via Supabase's built-in session storage; skip gate on reload if session is valid
- [x] 3.4 Show error message on incorrect passphrase

## 4. Auth — Identity Setup

- [x] 4.1 Create `IdentitySetup` component: display name text input + color picker (preset palette of ~10 colors)
- [x] 4.2 On submit, generate UUID (`crypto.randomUUID()`), save `author_id`, `author_name`, `author_color` to `localStorage`
- [x] 4.3 Validate that display name is non-empty before allowing submission
- [x] 4.4 Create `useIdentity` hook that reads/writes identity from `localStorage` and exposes `isIdentitySet` boolean
- [x] 4.5 Wire app entry flow: `PassphraseGate` → `IdentitySetup` (if no identity) → Calendar

## 5. Calendar Grid

- [x] 5.1 Create `CalendarGrid` component rendering a 12-column CSS grid
- [x] 5.2 Create `MonthColumn` component with month name header and day tiles
- [x] 5.3 Create `DayTile` component showing day number and a post-indicator dot when posts exist
- [x] 5.4 Implement year state with prev/next controls defaulting to `new Date().getFullYear()`
- [x] 5.5 Fetch post presence data for the selected year from Supabase (dates + count) on year change; store in a map keyed by date string
- [x] 5.6 Apply responsive styles: horizontal scroll on mobile viewports
- [x] 5.7 Add export icon button to each `MonthColumn` header (wired to export flow in task 8)

## 6. Day Modal — Viewing Posts

- [x] 6.1 Create `DayModal` component using shadcn/ui Dialog, opened by clicking a `DayTile`
- [x] 6.2 Fetch all posts for the selected date from Supabase when modal opens; display in creation-time order
- [x] 6.3 Create `PostCard` component showing author color chip, author name, post text, and photo thumbnails
- [x] 6.4 Display photos using signed URLs (1-hour expiry) fetched from Supabase Storage
- [x] 6.5 Show empty state message when no posts exist for the day

## 7. Day Modal — Creating and Editing Posts

- [x] 7.1 Create `PostForm` component with a textarea and photo upload input (max 5 files)
- [x] 7.2 Implement client-side photo preview (thumbnails before upload)
- [x] 7.3 Implement client-side image resizing: if a file exceeds 5 MB, resize via `canvas` before uploading
- [x] 7.4 On submit, upload photos to Supabase Storage (`post-photos/<author_id>/<date>/<filename>`), then upsert post record
- [x] 7.5 Show validation error if form is submitted with no text and no photos
- [x] 7.6 After saving, refresh the post list in the modal and update the day tile indicator
- [x] 7.7 Show edit button on each `PostCard`; clicking populates `PostForm` with existing content
- [x] 7.8 On edit save, delete removed photos from Supabase Storage before upserting the updated post
- [x] 7.9 Wire notification placeholder: call `notificationService.onPostSaved(post)` (no-op) after every successful save
- [x] 7.10 Create `src/lib/notificationService.ts` with a no-op `onPostSaved` export

## 8. Monthly PDF Export

- [x] 8.1 Create `exportMonthPdf` utility in `src/lib/exportMonthPdf.ts` using `@react-pdf/renderer`
- [x] 8.2 Fetch all posts for the target month from Supabase, ordered by date then `created_at`
- [x] 8.3 For each photo, fetch signed URL and convert to base64 data URL for embedding
- [x] 8.4 Define PDF layout: title page with month/year, then per-day sections with author name, text, and inline photos
- [x] 8.5 Trigger download as `<YYYY>-<MM>.pdf` on completion
- [x] 8.6 Show loading indicator on the export button while generation is in progress
- [x] 8.7 Show error toast if export fails; show info toast if month has no posts

## 9. Polish and QA

- [x] 9.1 Add loading skeletons for calendar grid while fetching post presence data
- [x] 9.2 Add error boundary around the main app with a fallback UI
- [ ] 9.3 Test full flow on mobile viewport (passphrase → identity → calendar → post → export)
- [ ] 9.4 Test leap year (February 29) day tile rendering
- [ ] 9.5 Test PDF export with posts containing multiple photos
- [ ] 9.6 Verify RLS blocks unauthenticated reads of `posts` and `app_config`
- [x] 9.7 Document environment variable setup and Supabase project configuration in README
