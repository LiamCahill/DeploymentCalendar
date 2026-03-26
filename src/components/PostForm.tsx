import { useState, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { supabase, type Post } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { resizeIfNeeded } from '@/lib/imageUtils'
import { onPostSaved } from '@/lib/notificationService'
import type { Identity } from '@/hooks/useIdentity'

const MAX_PHOTOS = 5

interface ExistingPhoto {
  path: string
  previewUrl: string // signed URL already fetched by PostCard
}

interface NewPhoto {
  file: File
  previewUrl: string
}

interface PostFormProps {
  date: string
  identity: Identity
  existingPost?: Post | null
  onSaved: () => void
  onCancel?: () => void
}

export function PostForm({ date, identity, existingPost, onSaved, onCancel }: PostFormProps) {
  const [content, setContent] = useState(existingPost?.content ?? '')
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>(
    // paths only; we don't have signed URLs here — PostCard handles display
    existingPost?.photo_paths.map((p) => ({ path: p, previewUrl: '' })) ?? []
  )
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const totalPhotos = existingPhotos.length + newPhotos.length

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const remaining = MAX_PHOTOS - totalPhotos
    if (remaining <= 0) {
      setError(`Maximum ${MAX_PHOTOS} photos per post.`)
      return
    }

    const toAdd = files.slice(0, remaining)
    const processed: NewPhoto[] = []

    for (const file of toAdd) {
      const resized = await resizeIfNeeded(file)
      processed.push({ file: resized, previewUrl: URL.createObjectURL(resized) })
    }

    setNewPhotos((prev) => [...prev, ...processed])
    // Reset input so the same file can be re-selected
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeExisting(path: string) {
    setExistingPhotos((prev) => prev.filter((p) => p.path !== path))
  }

  function removeNew(index: number) {
    setNewPhotos((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].previewUrl)
      updated.splice(index, 1)
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!content.trim() && totalPhotos === 0) {
      setError('Please add some text or a photo.')
      return
    }

    setSaving(true)

    try {
      // Upload new photos
      const uploadedPaths: string[] = []
      for (const photo of newPhotos) {
        const ext = photo.file.name.split('.').pop() ?? 'jpg'
        const path = `${identity.author_id}/${date}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('post-photos')
          .upload(path, photo.file)
        if (uploadError) throw uploadError
        uploadedPaths.push(path)
      }

      // Delete removed existing photos from storage
      if (existingPost) {
        const removedPaths = existingPost.photo_paths.filter(
          (p) => !existingPhotos.some((ep) => ep.path === p)
        )
        if (removedPaths.length) {
          await supabase.storage.from('post-photos').remove(removedPaths)
        }
      }

      const finalPaths = [...existingPhotos.map((p) => p.path), ...uploadedPaths]

      // Upsert post
      const { data, error: upsertError } = await supabase
        .from('posts')
        .upsert(
          {
            date,
            author_id: identity.author_id,
            author_name: identity.author_name,
            author_color: identity.author_color,
            content: content.trim(),
            photo_paths: finalPaths,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'date,author_id' }
        )
        .select()
        .single()

      if (upsertError) throw upsertError

      onPostSaved(data as Post)
      onSaved()
    } catch (err) {
      console.error(err)
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What happened today?"
        rows={3}
        disabled={saving}
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
      />

      {/* Photo previews */}
      {(existingPhotos.length > 0 || newPhotos.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {existingPhotos.map((photo) => (
            <div key={photo.path} className="relative w-16 h-16">
              <div className="w-full h-full rounded-md bg-stone-200 flex items-center justify-center text-xs text-stone-500">
                Photo
              </div>
              <button
                type="button"
                onClick={() => removeExisting(photo.path)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-stone-700 text-white flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          {newPhotos.map((photo, i) => (
            <div key={i} className="relative w-16 h-16">
              <img
                src={photo.previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeNew(i)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-stone-700 text-white flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={saving || totalPhotos >= MAX_PHOTOS}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={saving || totalPhotos >= MAX_PHOTOS}
            className="text-stone-500"
          >
            <ImagePlus className="w-4 h-4 mr-1" />
            {totalPhotos > 0 ? `${totalPhotos}/${MAX_PHOTOS}` : 'Add photos'}
          </Button>
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Saving…' : existingPost ? 'Save changes' : 'Post'}
          </Button>
        </div>
      </div>
    </form>
  )
}
