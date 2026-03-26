import type { Post } from '@/lib/supabase'

/**
 * Called after every successful post save (create or edit).
 * No-op at launch — wire up notification providers here when ready.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function onPostSaved(_post: Post): void {
  // Notification hook — implement when notifications are added
}
