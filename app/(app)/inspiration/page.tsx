'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import TagFilter from '@/components/inspiration/TagFilter'
import InspirationCard from '@/components/inspiration/InspirationCard'
import type { Inspiration } from '@/lib/types'

type InspiType = 'quote' | 'passage' | 'image'

export default function InspirationPage() {
  const [items, setItems] = useState<Inspiration[]>([])
  const [activeTag, setActiveTag] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  // Add form state
  const [type, setType] = useState<InspiType>('quote')
  const [content, setContent] = useState('')
  const [source, setSource] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchItems = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('inspirations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setItems((data as Inspiration[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const filtered = activeTag === 'All'
    ? items
    : items.filter((i) => i.tags?.includes(activeTag) || (activeTag === 'Images' && i.type === 'image'))

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && type !== 'image') return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
      await supabase.from('inspirations').insert({
        user_id: user.id,
        type,
        content: content.trim(),
        source: source.trim() || null,
        tags: tagList.length > 0 ? tagList : null,
        color_border: type === 'quote' ? 'gold' : type === 'passage' ? 'purple' : null,
      })
      setContent('')
      setSource('')
      setTags('')
      setShowAdd(false)
      fetchItems()
    }
    setSaving(false)
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <TagFilter active={activeTag} onChange={setActiveTag} />
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="shrink-0 flex items-center gap-1.5 bg-black text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-900 transition-colors ml-3"
        >
          {showAdd ? <X size={16} /> : <Plus size={16} />}
          {showAdd ? 'Cancel' : 'Add'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5 space-y-4">
          <div className="flex gap-2">
            {(['quote', 'passage', 'image'] as InspiType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                  type === t ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === 'quote' ? 'Enter the quote…'
              : type === 'passage' ? 'Enter the passage…'
              : 'Image URL or description…'
            }
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Source (book, author…)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags, comma-separated (Poetry, Philosophy…)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-gray-900 transition-colors"
          >
            {saving ? 'Saving…' : 'Save inspiration'}
          </button>
        </form>
      )}

      {loading && (
        <div className="masonry-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="masonry-item bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No inspirations yet</p>
          <p className="text-sm">Save quotes with a gold border, passages with purple.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="masonry-grid">
          {filtered.map((item) => (
            <InspirationCard key={item.id} item={item} onDeleted={fetchItems} />
          ))}
        </div>
      )}
    </div>
  )
}
