'use client'

import { useEffect, useRef, useState } from 'react'
import { Moon, Sun, Upload, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/ThemeProvider'

export default function SettingsPage() {
  const { theme, toggle } = useTheme()
  const supabase = createClient()

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setEmail(user.email ?? null)
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, username')
        .eq('id', user.id)
        .single()
      setAvatarUrl(data?.avatar_url ?? null)
      setUsername(data?.username ?? null)
    }
    load()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadErr) {
      setUploadError('Upload failed. Please try again.')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    // Bust cache with timestamp
    const urlWithBust = `${publicUrl}?t=${Date.now()}`

    await supabase
      .from('profiles')
      .update({ avatar_url: urlWithBust })
      .eq('id', userId)

    setAvatarUrl(urlWithBust)
    setUploadSuccess(true)
    setUploading(false)

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-6">

      {/* Avatar */}
      <section
        className="rounded-2xl p-6 border"
        style={{ background: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
      >
        <h2
          className="text-xs font-semibold tracking-widest uppercase mb-5"
          style={{ color: 'var(--theme-muted)' }}
        >
          Profile
        </h2>

        <div className="flex items-center gap-5">
          {/* Avatar preview */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={28} className="text-black" />
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Info + upload */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--theme-text)' }}>
              {username ?? 'Reader'}
            </p>
            {email && (
              <p className="text-xs truncate mb-3" style={{ color: 'var(--theme-muted)' }}>
                {email}
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
                background: 'var(--theme-input)',
              }}
            >
              <Upload size={12} />
              {uploading ? 'Uploading…' : 'Upload photo'}
            </button>

            {uploadSuccess && (
              <p className="text-xs text-green-500 mt-2">Avatar updated!</p>
            )}
            {uploadError && (
              <p className="text-xs text-red-500 mt-2">{uploadError}</p>
            )}
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section
        className="rounded-2xl p-6 border"
        style={{ background: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
      >
        <h2
          className="text-xs font-semibold tracking-widest uppercase mb-5"
          style={{ color: 'var(--theme-muted)' }}
        >
          Appearance
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon size={18} style={{ color: 'var(--theme-text)' }} />
            ) : (
              <Sun size={18} style={{ color: 'var(--theme-text)' }} />
            )}
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </p>
              <p className="text-xs" style={{ color: 'var(--theme-muted)' }}>
                {theme === 'dark' ? 'Easy on the eyes at night' : 'Classic reading experience'}
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={toggle}
            className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none"
            style={{ background: theme === 'dark' ? '#D4AF37' : '#D1D5DB' }}
            aria-label="Toggle dark mode"
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(0)' }}
            />
          </button>
        </div>
      </section>

    </div>
  )
}
