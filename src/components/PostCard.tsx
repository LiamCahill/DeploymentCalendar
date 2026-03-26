import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { supabase, type Post } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: Post
  onEdit: (post: Post) => void
}

export function PostCard({ post, onEdit }: PostCardProps) {
  const [signedUrls, setSignedUrls] = useState<string[]>([])

  useEffect(() => {
    if (!post.photo_paths.length) return

    async function fetchUrls() {
      const urls = await Promise.all(
        post.photo_paths.map(async (path) => {
          const { data } = await supabase.storage
            .from('post-photos')
            .createSignedUrl(path, 3600)
          return data?.signedUrl ?? ''
        })
      )
      setSignedUrls(urls.filter(Boolean))
    }

    void fetchUrls()
  }, [post.photo_paths])

  const formattedTime = new Date(post.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="group relative border border-stone-200 rounded-xl p-4 space-y-3">
      {/* Author row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: post.author_color }}
          />
          <span className="text-sm font-medium text-stone-800">{post.author_name}</span>
          <span className="text-xs text-stone-400">{formattedTime}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 text-stone-400 hover:text-stone-700 transition-opacity',
            'opacity-0 group-hover:opacity-100'
          )}
          onClick={() => onEdit(post)}
          title="Edit post"
        >
          <Pencil className="w-3 h-3" />
        </Button>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Photos */}
      {signedUrls.length > 0 && (
        <div className={cn(
          'grid gap-2',
          signedUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        )}>
          {signedUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
