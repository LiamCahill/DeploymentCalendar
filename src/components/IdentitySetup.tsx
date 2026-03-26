import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const COLOR_PALETTE = [
  '#e57373', // red
  '#f06292', // pink
  '#ba68c8', // purple
  '#7986cb', // indigo
  '#4fc3f7', // light blue
  '#4db6ac', // teal
  '#81c784', // green
  '#dce775', // lime
  '#ffb74d', // orange
  '#a1887f', // brown
]

interface IdentitySetupProps {
  onComplete: (name: string, color: string) => void
}

export function IdentitySetup({ onComplete }: IdentitySetupProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PALETTE[0])
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    onComplete(name.trim(), color)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-stone-900 mb-1">Who are you?</h1>
          <p className="text-sm text-stone-500">Set your name and a colour for your posts</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Your name</label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="e.g. Mum"
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">Your colour</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none',
                  }}
                  aria-label={`Select colour ${c}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-block w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-stone-500">
                {name ? `${name}'s colour` : 'Your colour'}
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Get started
          </Button>
        </form>
      </div>
    </div>
  )
}
