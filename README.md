# Family Deployment Calendar

A private family journal built as a yearly calendar. Family members can post daily entries (text + photos), view everyone's posts, and export any month as a PDF.

## Setup

### 1. Supabase Project

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Set the passphrase hash by running this in the SQL Editor:
   ```sql
   insert into app_config (key, value)
   values ('passphrase_hash', crypt('your-chosen-passphrase', gen_salt('bf')));
   ```
4. Go to **Storage → New bucket**, name it `post-photos`, keep it **private**
5. In Storage → Policies, add three policies for the `post-photos` bucket:
   - **SELECT**: `bucket_id = 'post-photos' AND auth.role() = 'authenticated'`
   - **INSERT**: `bucket_id = 'post-photos' AND auth.role() = 'authenticated'`
   - **DELETE**: `bucket_id = 'post-photos' AND auth.role() = 'authenticated'`
6. In **Authentication → Providers**, enable **Anonymous sign-in**

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in **Supabase → Project Settings → API**.

### 3. Run Locally

```bash
npm install
npm run dev
```

### 4. Deploy

Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com):
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your deployment settings
- Build command: `npm run build`
- Output directory: `dist`

## Changing the Passphrase

Run this in the Supabase SQL Editor (replacing `new-passphrase`):

```sql
update app_config
set value = crypt('new-passphrase', gen_salt('bf'))
where key = 'passphrase_hash';
```

All existing sessions remain valid until they expire (Supabase default: 1 week). To invalidate all sessions immediately, go to **Authentication → Users** and click **Logout all users**.

## How It Works

- **Access**: A shared passphrase gates entry. Verified server-side — the passphrase never appears in the JS bundle.
- **Identity**: On first visit, each person picks a display name and colour stored in `localStorage`. No accounts needed.
- **Posts**: One post per person per day, enforced by a database unique constraint. Multiple family members can each post on the same day.
- **Photos**: Stored in Supabase Storage. Displayed via short-lived signed URLs.
- **Export**: Click the download icon on any month column to generate a self-contained PDF of all posts and photos for that month.
