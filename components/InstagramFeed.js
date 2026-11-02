import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, FALLBACK_STATS, FALLBACK_POSTS } from './instagramPosts'

const REFRESH_MS = 5 * 60 * 1000

const fmt = (n) => {
  if (typeof n !== 'number' || Number.isNaN(n)) return '–'
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1e4) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}K`
  return n.toLocaleString('en-US')
}

function PlayBadge() {
  return (
    <span className="insta-badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
    </span>
  )
}

// In-page player: reels play here instead of sending people to instagram.com.
function Lightbox({ post, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, onPrev, onNext])

  let media
  if (post.video) {
    media = <video key={post.video} src={post.video} poster={post.image} controls autoPlay loop playsInline />
  } else if (post.shortcode) {
    const kind = post.type === 'reel' ? 'reel' : 'p'
    media = (
      <iframe
        key={post.shortcode}
        src={`https://www.instagram.com/${kind}/${post.shortcode}/embed`}
        title="Instagram post"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        scrolling="no"
      />
    )
  } else {
    media = (
      <div className="insta-lb-still">
        <img src={post.image} alt={post.alt || ''} />
        {post.type === 'reel' && (
          <a className="insta-lb-open" href={post.permalink} target="_blank" rel="noopener noreferrer">Watch on Instagram</a>
        )}
      </div>
    )
  }

  return (
    <div className="insta-lb" role="dialog" aria-modal="true" aria-label="Instagram post" onClick={onClose}>
      <button type="button" className="insta-lb-close" onClick={onClose} aria-label="Close">×</button>
      <button type="button" className="insta-lb-nav insta-lb-nav--prev" onClick={(e) => { e.stopPropagation(); onPrev() }} aria-label="Previous">‹</button>
      <div className="insta-lb-frame" onClick={(e) => e.stopPropagation()}>{media}</div>
      <button type="button" className="insta-lb-nav insta-lb-nav--next" onClick={(e) => { e.stopPropagation(); onNext() }} aria-label="Next">›</button>
    </div>
  )
}

export default function InstagramFeed() {
  const track = useRef(null)
  const [stats, setStats] = useState(FALLBACK_STATS)
  const [posts, setPosts] = useState(FALLBACK_POSTS)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [open, setOpen] = useState(null) // index of post in the player
  const [fits, setFits] = useState(false) // all posts already visible -> arrows rotate the row instead
  const [rot, setRot] = useState(0)
  const [shift, setShift] = useState(0)
  const [animate, setAnimate] = useState(false)
  const busy = useRef(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Live numbers (+ live posts when a token is configured). Falls back silently.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/instagram')
        const d = await res.json()
        if (cancelled || !d.ok) return
        setStats((s) => ({
          posts: typeof d.posts === 'number' ? d.posts : s.posts,
          followers: typeof d.followers === 'number' ? d.followers : s.followers,
          following: typeof d.following === 'number' ? d.following : s.following,
        }))
        if (Array.isArray(d.items) && d.items.length) {
          setPosts(d.items.map((p, i) => ({ ...p, alt: `Instagram post ${i + 1} from @${INSTAGRAM_HANDLE}` })))
        }
      } catch (e) { /* keep fallback */ }
    }
    load()
    const id = setInterval(load, REFRESH_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { cancelled = true; clearInterval(id); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  // Show the arrows only when there is something to scroll to.
  const updateArrows = useCallback(() => {
    const el = track.current
    if (!el) return
    const card = el.querySelector('.insta-card')
    const allFit = !!card && posts.length * (card.offsetWidth + 20) - 20 <= el.clientWidth + 4
    setFits(allFit)
    if (allFit) {
      setCanPrev(posts.length > 1)
      setCanNext(posts.length > 1)
    } else {
      setCanPrev(el.scrollLeft > 4)
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }
  }, [posts.length])

  useEffect(() => {
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [posts, updateArrows])

  const scrollByCards = (dir) => {
    const el = track.current
    if (!el) return
    const card = el.querySelector('.insta-card')
    if (fits) {
      if (busy.current || posts.length < 2 || !card) return
      busy.current = true
      const one = card.offsetWidth + 20
      const n = posts.length
      if (dir > 0) {
        setAnimate(true)
        setShift(-one)
        setTimeout(() => {
          setAnimate(false)
          setRot((r) => (r + 1) % n)
          setShift(0)
          busy.current = false
        }, 380)
      } else {
        setAnimate(false)
        setRot((r) => (r - 1 + n) % n)
        setShift(-one)
        requestAnimationFrame(() => requestAnimationFrame(() => {
          setAnimate(true)
          setShift(0)
          setTimeout(() => { busy.current = false }, 380)
        }))
      }
      return
    }
    const step = card ? (card.offsetWidth + 20) * 3 : el.clientWidth * 0.6
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  // Order shown on screen (rotated when everything fits), each card remembers its real index.
  const order = posts.map((_, i) => (i + (fits ? rot : 0)) % posts.length)
  if (fits && posts.length > 1) order.push(order[0]) // spare card that slides in

  const close = useCallback(() => setOpen(null), [])
  const prev = useCallback(() => setOpen((i) => (i === null ? i : (i - 1 + posts.length) % posts.length)), [posts.length])
  const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % posts.length)), [posts.length])

  const STATS = [
    { value: fmt(stats.posts), label: 'posts' },
    { value: fmt(stats.followers), label: 'followers' },
    { value: fmt(stats.following), label: 'following' },
  ]

  return (
    <section id="instagram" className="insta-editorial">
      <header className="insta-header">
        <h2>SEE THE<br /><em>POP.</em></h2>
        <div className="insta-follow">
          <p>New drops, behind the scenes and second acts, as they happen.</p>
          <a className="oval-link oval-link--dark" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            FOLLOW @{INSTAGRAM_HANDLE.toUpperCase()}
          </a>
        </div>
      </header>

      <div className="insta-widget">
        <div className="insta-profile">
          <a className="insta-avatar" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={`@${INSTAGRAM_HANDLE} on Instagram`}>
            <img src="/instagram/avatar.png" alt="" />
          </a>
          <a className="insta-name" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">{INSTAGRAM_HANDLE}</a>
          <ul className="insta-stats">
            {STATS.map((s) => (
              <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>
            ))}
          </ul>
          <a className="insta-followbtn" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
            </svg>
            Follow
          </a>
        </div>

        <div className="insta-carousel">
          <div className={`insta-track${fits ? ' insta-track--rot' : ''}`} ref={track} onScroll={updateArrows} style={{ '--shift': `${shift}px`, '--ease': animate ? 'transform .38s ease' : 'none' }}>
            {order.map((i, pos) => {
              const post = posts[i]
              return (
              <button type="button" className="insta-card" key={`${post.image}-${i}-${pos >= posts.length ? 'dup' : ''}`} onClick={() => setOpen(i)} aria-label={post.type === 'reel' ? 'Play reel' : 'View post'}>
                <img src={post.image} alt={post.alt || ''} loading="lazy" referrerPolicy="no-referrer" />
                {post.live && post.type === 'reel' && <PlayBadge />}
              </button>
              )
            })}
          </div>
          {canPrev && (
            <button type="button" className="insta-next insta-prev" onClick={() => scrollByCards(-1)} aria-label="Previous posts">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
          )}
          {canNext && (
            <button type="button" className="insta-next" onClick={() => scrollByCards(1)} aria-label="Next posts">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      </div>

      {mounted && open !== null && posts[open] &&
        createPortal(<Lightbox post={posts[open]} onClose={close} onPrev={prev} onNext={next} />, document.body)}
    </section>
  )
}
