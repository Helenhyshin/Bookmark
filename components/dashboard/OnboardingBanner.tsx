'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { count } = await supabase
        .from('books')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setShow((count ?? 0) === 0)
    }
    check()
  }, [])

  if (!show) return null

  return (
    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-5">
      <h2 className="font-serif font-semibold text-lg mb-1">Welcome to Bookmark</h2>
      <p className="text-sm text-gray-600 mb-4">
        Track your reading, collect words, and save inspiration — start by adding your first book.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/books"
          className="text-xs font-medium bg-black text-white rounded-lg px-3 py-1.5 hover:bg-gray-900 transition-colors"
        >
          Add a book
        </Link>
        <Link
          href="/words"
          className="text-xs font-medium bg-white text-black border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
        >
          Explore Word Bank
        </Link>
        <Link
          href="/inspiration"
          className="text-xs font-medium bg-white text-black border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
        >
          Save Inspiration
        </Link>
      </div>
    </div>
  )
}
