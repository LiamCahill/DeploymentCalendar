## Why

A family member is going away for an extended, open-ended period. The family wants a shared, private space to document daily life so that person can catch up on what they missed — and so the family has a lasting record to look back on.

## What Changes

This is a new application with no prior codebase. The full product is being introduced from scratch:

- New React + Vite single-page application with Tailwind CSS and shadcn/ui
- Passphrase-based access control (shared secret gates entry to the app)
- Identity setup on first visit: display name + color picker, persisted in `localStorage`
- 12-column yearly calendar grid with per-month day tiles; prev/next year navigation starting at current year
- Per-day journal entries: each family member may submit one post per day containing text and/or photos
- Multiple posts per day are supported (one per person); all are visible to everyone
- Honor-system editing: any authenticated session may edit any post
- Photo uploads stored in Supabase Storage; post data in Supabase Postgres
- Monthly PDF export: generates a formatted document of all posts and photos for a given month
- Notification architecture placeholder: no notifications at launch, but the data model and component structure should accommodate them later

## Capabilities

### New Capabilities

- `auth`: Passphrase gate and per-session identity (display name + color) stored in `localStorage`
- `calendar-grid`: Yearly 12-column calendar grid with day tiles and year navigation
- `post-entry`: Create, view, and edit daily journal posts (text + photos) per family member
- `photo-upload`: Upload and retrieve photos attached to posts via Supabase Storage
- `month-export`: Export all posts and photos for a selected month as a downloadable PDF

### Modified Capabilities

## Impact

- **New dependencies**: React, Vite, Tailwind CSS, shadcn/ui, Supabase JS client, a PDF generation library (e.g., `@react-pdf/renderer` or `jsPDF` + `html2canvas`)
- **Infrastructure**: Supabase project required (Postgres DB + Storage bucket); environment variables for Supabase URL and anon key
- **No existing code affected**: greenfield project
