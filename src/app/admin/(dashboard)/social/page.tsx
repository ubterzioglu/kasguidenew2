'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { getStoredAdminPassword } from '@/lib/admin-password-client'
import {
  SOCIAL_LINKEDIN_POSTS,
  SOCIAL_POST_CATEGORY_LABELS,
  type SocialLinkedinPost,
  type SocialPostCategory,
} from '@/lib/admin-shell/social-linkedin-posts'

const SEPARATOR = '\n\n———\n\n'

const CATEGORY_FILTERS: Array<{ value: SocialPostCategory | 'all'; label: string }> = [
  { value: 'all', label: 'Tümü' },
  { value: 'kategori', label: SOCIAL_POST_CATEGORY_LABELS.kategori },
  { value: 'ozellik', label: SOCIAL_POST_CATEGORY_LABELS.ozellik },
  { value: 'sayfa', label: SOCIAL_POST_CATEGORY_LABELS.sayfa },
  { value: 'marka', label: SOCIAL_POST_CATEGORY_LABELS.marka },
]

function formatPostForCopy(post: SocialLinkedinPost): string {
  return `${post.order}. ${post.title}\n\n${post.linkedinPost}`
}

function formatPromptsForCopy(post: SocialLinkedinPost): string {
  return `${post.order}. ${post.title}\n\n${post.imagePrompts.join('\n\n')}`
}

export default function AdminSocialPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<SocialPostCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!getStoredAdminPassword()) {
      router.replace('/admin')
    }
  }, [router])

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR')

    return SOCIAL_LINKEDIN_POSTS.filter((post) => {
      const matchesCategory = activeCategory === 'all' || post.category === activeCategory
      const matchesQuery = !query || `${post.title} ${post.linkedinPost}`.toLocaleLowerCase('tr-TR').includes(query)
      return matchesCategory && matchesQuery
    })
  }, [activeCategory, search])

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000)
    } catch {
      // Clipboard API unavailable (non-secure context or permission denied); nothing to recover.
    }
  }

  function copyAllLinkedin() {
    const text = filteredPosts.map(formatPostForCopy).join(SEPARATOR)
    void copyToClipboard(text, 'all-linkedin')
  }

  function copyAllPrompts() {
    const text = filteredPosts.map(formatPromptsForCopy).join(SEPARATOR)
    void copyToClipboard(text, 'all-prompts')
  }

  return (
    <main className="container admin-shell admin-shell-places admin-shell-updates">
      <section className="admin-places-intro admin-places-header-panel">
        <div className="admin-places-intro-copy">
          <h1 className="admin-places-title">Sosyal Medya — LinkedIn Paylaşım Deposu</h1>
          <p className="admin-places-subtitle">
            50 hazır LinkedIn postu ve her biri için 2 metinsiz AI görsel promptu. İçerik
            {' '}<code>src/lib/admin-shell/social-linkedin-posts.ts</code> dosyasından yönetilir.
            Görseller bu panelde üretilmez — promptu kopyala, istediğin görsel motoruna
            (ChatGPT, Midjourney, Higgsfield vb.) yapıştır.
          </p>
        </div>

        <div className="admin-status admin-status-neutral admin-status-places">
          <span>{SOCIAL_LINKEDIN_POSTS.length} post hazır</span>
        </div>
      </section>

      <section className="admin-toolbar-actions admin-updates-topbar">
        <div className="admin-updates-tabs">
          {CATEGORY_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              variant={activeCategory === filter.value ? 'primary' : 'secondary'}
              onClick={() => setActiveCategory(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <label className="admin-updates-search">
          <span>Arama</span>
          <input
            className="admin-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Başlık veya post metninde ara"
          />
        </label>

        <div className="admin-card-actions">
          <Button type="button" variant="ghost" onClick={copyAllLinkedin}>
            {copiedId === 'all-linkedin' ? 'Kopyalandı!' : `Tüm LinkedIn Postları (${filteredPosts.length})`}
          </Button>
          <Button type="button" variant="ghost" onClick={copyAllPrompts}>
            {copiedId === 'all-prompts' ? 'Kopyalandı!' : 'Tüm Görsel Promptları'}
          </Button>
        </div>
      </section>

      <section className="admin-updates-list admin-social-post-list">
        {filteredPosts.map((post) => (
          <article key={post.id} className="admin-updates-panel admin-social-post-card">
            <div className="admin-list-header admin-list-header-places">
              <div>
                <span className="admin-updates-meta">
                  {post.order}. {SOCIAL_POST_CATEGORY_LABELS[post.category]}
                </span>
                <h2 className="admin-section-title">{post.title}</h2>
              </div>
            </div>

            <div className="admin-social-post-body">
              <label className="admin-social-field-label">LinkedIn Postu</label>
              <Textarea value={post.linkedinPost} />
              <div className="admin-card-actions">
                <Button type="button" variant="secondary" onClick={() => copyToClipboard(post.linkedinPost, post.id)}>
                  {copiedId === post.id ? 'Kopyalandı!' : 'Postu Kopyala'}
                </Button>
              </div>
            </div>

            <div className="admin-social-post-body">
              <label className="admin-social-field-label">Görsel Promptu 1 (İngilizce)</label>
              <Textarea value={post.imagePrompts[0]} />
              <div className="admin-card-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => copyToClipboard(post.imagePrompts[0], `${post.id}-prompt-1`)}
                >
                  {copiedId === `${post.id}-prompt-1` ? 'Kopyalandı!' : 'Prompt 1 Kopyala'}
                </Button>
              </div>
            </div>

            <div className="admin-social-post-body">
              <label className="admin-social-field-label">Görsel Promptu 2 (İngilizce)</label>
              <Textarea value={post.imagePrompts[1]} />
              <div className="admin-card-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => copyToClipboard(post.imagePrompts[1], `${post.id}-prompt-2`)}
                >
                  {copiedId === `${post.id}-prompt-2` ? 'Kopyalandı!' : 'Prompt 2 Kopyala'}
                </Button>
              </div>
            </div>
          </article>
        ))}

        {filteredPosts.length === 0 ? (
          <p className="admin-section-copy">Bu filtre için sonuç bulunamadı.</p>
        ) : null}
      </section>
    </main>
  )
}

function Textarea({ value }: { value: string }) {
  return (
    <textarea
      className="admin-input admin-social-textarea"
      readOnly
      rows={4}
      value={value}
      onFocus={(event) => event.currentTarget.select()}
    />
  )
}
