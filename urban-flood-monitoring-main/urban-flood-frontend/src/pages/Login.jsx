import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useUser } from '../store/useUser'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const setUser = useUser(s => s.setUser)
  const setSession = useUser(s => s.setSession)
  const upsertProfile = useUser(s => s.upsertProfile)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [consentAsked, setConsentAsked] = useState(false)
  const [consent, setConsent] = useState(false)
  const [coords, setCoords] = useState({ lat: null, lon: null })
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setUser(data.session.user)
        setSession(data.session)
        navigate('/')
      }
    })
  }, [])

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone } },
    })
    if (error) {
      console.error('SignUp error', error)
      return alert(error.message)
    }

    // If Supabase returns a user object (magic-link/email confirm flows vary)
    if (data?.user) {
      setUser(data.user)
      setSession({ user: data.user }) // minimal
      // try to save phone immediately (if user present)
      try {
        await upsertProfile({
          email: data.user.email,
          phone,
        })
      } catch (e) {
        console.warn('upsert after signup failed', e)
      }
    }

    alert('✅ Confirmation email sent. Check your inbox.')
  }

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('SignIn error', error)
      return alert(error.message)
    }
    // Use the authenticated user returned by Supabase
    setUser(data.user)
    setSession(data.session)
    // persist phone if provided
    try {
      await upsertProfile({
        email: data.user.email,
        phone,
      })
    } catch (e) {
      console.warn('upsert after signin failed', e)
    }

    setConsentAsked(true)
  }

  // When user allows location
  function acceptConsent() {
    setConsent(true)
    setConsentAsked(false)

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setCoords({ lat, lon })

        // Use the authenticated user email from session (safer)
        const { data: sessionData } = await supabase.auth.getSession()
        const userEmail = sessionData?.session?.user?.email || email

        try {
          await upsertProfile({
            email: userEmail,
            phone,
            latitude: lat,
            longitude: lon,
          })
          alert('✅ Location saved and profile updated!')
        } catch (err) {
          console.error('Failed to upsert profile with coords', err)
          alert('❌ Failed to save location.')
        }

        navigate('/')
      },
      err => {
        console.error('Geolocation error', err)
        alert('❌ Failed to get location: ' + err.message)
        navigate('/')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function declineConsent() {
    setConsent(false)
    setConsentAsked(false)
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto mt-12 card card-pad">
      <h2 className="text-lg font-semibold mb-4">Sign in / Sign up</h2>

      <label className="block text-sm mb-1">Email</label>
      <input className="w-full input mb-3" value={email} onChange={e => setEmail(e.target.value)} />

      <label className="block text-sm mb-1">Password</label>
      <input
        type="password"
        className="w-full input mb-3"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <label className="block text-sm mb-1">Phone Number</label>
      <input
        type="text"
        className="w-full input mb-3"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />

      <div className="flex gap-2">
        <button onClick={signIn} className="btn">
          Sign in
        </button>
        <button onClick={signUp} className="btn-outline">
          Sign up
        </button>
      </div>

      {consentAsked && (
        <div className="mt-6">
          <h3 className="font-medium">Location tracking</h3>
          <p className="text-sm text-gray-500">
            Allow location tracking to personalize your flood risk analysis.
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={acceptConsent} className="btn">
              Allow
            </button>
            <button onClick={declineConsent} className="btn-outline">
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
