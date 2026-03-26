## Context

Greenfield single-page application for a small, private family group. The primary use case is logging daily life events (text + photos) in a shared calendar so a family member who is away for an extended period can follow along. The app must be accessible from any device (phone, tablet, desktop) and require no per-user account creation. All data lives in Supabase (Postgres + Storage). The app is deployed statically (e.g., Vercel or Netlify).

Stakeholders: one family + a small circle of close friends (~5–15 people).

## Goals / Non-Goals

**Goals:**
- Simple, frictionless access via a single shared passphrase
- Persistent per-browser identity (display name + color) without accounts
- Yearly calendar grid (12 months) with clickable day tiles
- One post per person per day (text and/or photos); all posts visible to all
- Honor-system editing (any authenticated session can edit any post)
- Monthly PDF export of all posts and photos
- Mobile-friendly layout

**Non-Goals:**
- Per-user authentication or account management
- Push notifications (architecture leaves room; not implemented)
- Comment threads or reactions (future)
- Admin moderation tools
- Offline support / PWA

## Decisions

### 1. Passphrase Auth via Supabase Anonymous Sessions + RLS

**Decision**: Use Supabase's anonymous sign-in to establish a session, then gate all DB/Storage access with Row Level Security policies that require a valid session AND a check against an `app_config` table that stores a hashed passphrase.

**Rationale**: Supabase RLS runs server-side and cannot be bypassed from the client. Storing the passphrase hash in a DB row (rather than a hard-coded env var on the client) means the secret never ships in the JS bundle. Anonymous sign-in gives a real JWT without requiring email/password accounts.

**Alternative considered**: Hard-code the passphrase in an env var and check it client-side. Rejected — anyone who inspects the bundle can extract it.

**Alternative considered**: Full email/password auth. Rejected — too much friction for a casual family app.

---

### 2. One Post Per Person Per Day Enforced by a Unique Constraint

**Decision**: The `posts` table has a unique constraint on `(date, author_id)`. `author_id` is a UUID generated on first visit and stored in `localStorage` alongside the display name and color.

**Rationale**: The constraint is enforced at the DB level (cannot be bypassed client-side). Upsert semantics (`INSERT ... ON CONFLICT DO UPDATE`) make the create/edit flow identical from the client's perspective.

**Alternative considered**: Enforce uniqueness in application logic only. Rejected — race conditions and multi-tab scenarios could create duplicates.

---

### 3. Identity in localStorage (No Server-Side User Table)

**Decision**: On first visit, the app generates a UUID (`author_id`), prompts for a display name and color, and stores all three in `localStorage`. The `author_id` is included in every post row.

**Rationale**: Eliminates account management entirely. For a ~15-person family app, the risk of identity spoofing is acceptable (honor system).

**Trade-off**: Clearing browser storage loses identity. Mitigation: show a "restore identity" flow where the user can re-enter their name and a previously used color; the `author_id` can be re-entered manually or stored in a memorable place if they care about editing old posts.

---

### 4. Photo Storage in Supabase Storage

**Decision**: Photos are uploaded to a private Supabase Storage bucket. Signed URLs (short-lived) are used to display images. The `posts` table stores an array of storage object paths.

**Rationale**: Keeps photos close to the data, behind the same RLS boundary. Signed URLs prevent hotlinking.

**Alternative considered**: Third-party image CDN (Cloudinary, etc.). Rejected — unnecessary dependency for this scale.

---

### 5. PDF Export via `@react-pdf/renderer`

**Decision**: Monthly export uses `@react-pdf/renderer` to generate a PDF in-browser. Photos are fetched as base64 data URLs (via signed URLs) and embedded in the PDF.

**Rationale**: Pure client-side generation — no server function needed, no cost at scale. `@react-pdf/renderer` supports images and rich layout natively.

**Alternative considered**: `jsPDF` + `html2canvas`. Rejected — `html2canvas` produces lower-quality output and struggles with cross-origin images.

**Alternative considered**: Server-side PDF (e.g., Puppeteer in a Vercel function). Rejected — adds infrastructure complexity.

---

### 6. Calendar Layout: CSS Grid, Horizontal Scroll on Mobile

**Decision**: The 12-month grid is a CSS grid with 12 equal columns on desktop. On mobile, it collapses to a single-column vertical list or horizontal scroll via overflow-x.

**Rationale**: Keeps the desktop "year at a glance" feel while remaining usable on phones.

---

### 7. Notification Architecture Placeholder

**Decision**: Post creation/update will call a no-op `notificationService.onPostSaved(post)` hook. The hook is wired but does nothing at launch.

**Rationale**: Inserting the hook now means adding notifications later requires only implementing the hook, not refactoring every post-save call.

## Risks / Trade-offs

- **localStorage identity loss** → User re-enters name/color; old posts remain attributed to original `author_id` and can no longer be edited from the new browser. Acceptable for honor-system use.
- **Passphrase leakage** → If a family member shares the passphrase with an unintended person, there is no revocation mechanism short of changing the passphrase in the DB. Mitigation: document the change-passphrase procedure.
- **Large photo uploads** → Many photos per month could slow PDF generation (all fetched client-side). Mitigation: cap photo size at upload time (e.g., 5 MB per image, resize client-side before upload).
- **`@react-pdf/renderer` bundle size** → Adds ~200 KB gzipped. Acceptable; load lazily on export action.
- **Supabase free tier limits** → 500 MB DB, 1 GB Storage on free tier. Sufficient for a ~15-person family for years at low photo resolution.

## Open Questions

- Should the app support multiple years of data from the start, or soft-launch as "current year only" with year nav added in a follow-up? *(Decision: multi-year from day one — year nav is straightforward and avoids a migration later.)*
- What is the maximum number of photos per post? *(Recommendation: 5, configurable as a constant.)*
