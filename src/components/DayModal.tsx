import { useState, useEffect, useCallback } from 'react'
import { supabase, type Post } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PostCard } from './PostCard'
import { PostForm } from './PostForm'
import type { Identity } from '@/hooks/useIdentity'

interface DayModalProps {
  date: string
  identity: Identity
  onClose: () => void
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`
}

export function DayModal({ date, identity, onClose }: DayModalProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (!error) setPosts((data as Post[]) ?? [])
    setLoading(false)
  }, [date])

  useEffect(() => {
    void fetchPosts()
  }, [fetchPosts])

  const myPost = posts.find((p) => p.author_id === identity.author_id) ?? null
  const hasMyPost = myPost !== null
  const showCreateForm = !hasMyPost && !editingPost

  function handleSaved() {
    setEditingPost(null)
    void fetchPosts()
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{formatDate(date)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-stone-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Existing posts */}
              {posts.length === 0 && !showCreateForm && (
                <p className="text-sm text-stone-400 text-center py-4">
                  No posts for this day yet.
                </p>
              )}

              {posts.map((post) => (
                <div key={post.id}>
                  {editingPost?.id === post.id ? (
                    <div className="border border-stone-200 rounded-xl p-4">
                      <p className="text-xs font-medium text-stone-500 mb-3">
                        Editing {post.author_name}'s post
                      </p>
                      <PostForm
                        date={date}
                        identity={identity}
                        existingPost={post}
                        onSaved={handleSaved}
                        onCancel={() => setEditingPost(null)}
                      />
                    </div>
                  ) : (
                    <PostCard
                      post={post}
                      onEdit={(p) => setEditingPost(p)}
                    />
                  )}
                </div>
              ))}

              {/* Create form — shown only if user hasn't posted yet */}
              {showCreateForm && (
                <div className="border border-dashed border-stone-300 rounded-xl p-4">
                  {posts.length > 0 && (
                    <p className="text-xs font-medium text-stone-500 mb-3">Add your entry</p>
                  )}
                  <PostForm
                    date={date}
                    identity={identity}
                    onSaved={handleSaved}
                  />
                </div>
              )}

              {/* If user already posted but nothing is being edited */}
              {hasMyPost && !editingPost && (
                <p className="text-xs text-stone-400 text-center">
                  You've posted today. Hover a post and click the pencil to edit.
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
