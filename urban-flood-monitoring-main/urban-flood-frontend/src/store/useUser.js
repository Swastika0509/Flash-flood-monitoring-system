// src/store/useUser.js
import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

export const useUser = create((set) => ({
  user: null,
  session: null,
  risk: null, // { latitude, longitude, flood_probability, alert_level, color, message, sensor_data }
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setRisk: (risk) => set({ risk }),

  upsertProfile: async (profileData) => {
    try {
      console.log('🟢 Saving profile to Supabase:', profileData)
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'email' })
      if (error) {
        console.error('❌ Supabase upsert error:', error)
        return { error }
      }
      console.log('✅ Supabase upsert success:', data)
      return { data }
    } catch (e) {
      console.error('❌ upsertProfile exception:', e)
      return { error: e }
    }
  },
}))