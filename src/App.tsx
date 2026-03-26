import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PassphraseGate } from '@/components/PassphraseGate'
import { IdentitySetup } from '@/components/IdentitySetup'
import { CalendarGrid } from '@/components/CalendarGrid'
import { useIdentity } from '@/hooks/useIdentity'
import { Toaster } from 'sonner'

type AppState = 'loading' | 'passphrase' | 'identity' | 'calendar'

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const { identity, isIdentitySet, setIdentity } = useIdentity()

  useEffect(() => {
    // Check for an existing valid Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAppState(isIdentitySet ? 'calendar' : 'identity')
      } else {
        setAppState('passphrase')
      }
    })
  }, [isIdentitySet])

  function handleAuthenticated() {
    setAppState(isIdentitySet ? 'calendar' : 'identity')
  }

  function handleIdentityComplete(name: string, color: string) {
    setIdentity(name, color)
    setAppState('calendar')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setAppState('passphrase')
  }

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-stone-300 border-t-stone-700 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Toaster position="bottom-right" />
      {appState === 'passphrase' && (
        <PassphraseGate onAuthenticated={handleAuthenticated} />
      )}
      {appState === 'identity' && (
        <IdentitySetup onComplete={handleIdentityComplete} />
      )}
      {appState === 'calendar' && identity && (
        <CalendarGrid identity={identity} onLogout={handleLogout} />
      )}
    </>
  )
}
