import { createClient } from '@supabase/supabase-js'

// Hardcode the environment variables for now since they're already in the server
// In production, these would be injected at build time
const supabaseUrl = 'https://wmktnmrwkjgtjohxjrqj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indta3RubXJ3a2pndGpvaHhqcnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMjE3NzYsImV4cCI6MjA3Mzg5Nzc3Nn0.qztIAv1BQBT4yT4lmIAPnSS65AILfio1IwEFFMR3HKs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'kasiviral-auth',
    storage: window.localStorage,
  },
})

export const getSupabaseClient = async () => {
  return supabase
}