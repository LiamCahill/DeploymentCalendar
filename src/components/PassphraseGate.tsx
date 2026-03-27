import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PassphraseGateProps {
  onAuthenticated: () => void
}

export function PassphraseGate({ onAuthenticated }: PassphraseGateProps) {
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1: sign in anonymously to get a real JWT
      const { error: signInError } = await supabase.auth.signInAnonymously()
      if (signInError) throw signInError

      // Step 2: verify passphrase against the hashed value in app_config
      const { data, error: configError } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'passphrase_hash')
        .single()

      if (configError || !data) {
        // Sign out and reject — can't verify
        await supabase.auth.signOut()
        setError('Unable to verify passphrase. Please try again.')
        return
      }

      // Step 3: verify using Postgres crypt() — run a RPC or check via a function
      // We call a small Postgres function that returns true/false
      const { data: match, error: verifyError } = await supabase
        .rpc('verify_passphrase', { input_passphrase: passphrase })

      if (verifyError || !match) {
        await supabase.auth.signOut()
        setError('Incorrect passphrase. Please try again.')
        return
      }

      onAuthenticated()
    } catch {
      await supabase.auth.signOut()
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-stone-900 mb-1">Deployment Calendar</h1>
          <p className="text-sm text-stone-500">Enter the passphrase to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            autoFocus
            disabled={loading}
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading || !passphrase}>
            {loading ? 'Checking…' : 'Enter'}
          </Button>
        </form>
      </div>
    </div>
  )
}
