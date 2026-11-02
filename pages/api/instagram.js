// Live Instagram numbers (and, with a token, the latest posts) for the "SEE THE POP." section.
//
// BEST (official, reliable): set IG_ACCESS_TOKEN in Vercel -> Settings -> Environment Variables.
//   Needs an Instagram Business/Creator account + a long-lived token from the
//   "Instagram API with Instagram Login" (Meta developer dashboard). Gives followers,
//   following, post count AND your latest posts/reels with playable video.
// FALLBACK (no token): tries Instagram's public profile endpoint for the counts only.
//   Instagram often blocks this from server IPs, so it can fail; the page then keeps
//   the numbers set in components/instagramPosts.js.

const HANDLE = 'upliftt.ind'

let lastRefresh = 0

async function viaGraphApi(token) {
  const base = 'https://graph.instagram.com'

  // Keep the 60-day token alive: ask Instagram to extend it at most once a day (best effort).
  if (Date.now() - lastRefresh > 24 * 3600 * 1000) {
    lastRefresh = Date.now()
    fetch(`${base}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`).catch(() => {})
  }

  const meRes = await fetch(`${base}/me?fields=username,followers_count,follows_count,media_count&access_token=${token}`)
  if (!meRes.ok) throw new Error(`graph me ${meRes.status}`)
  const me = await meRes.json()

  // Whole feed: follow Instagram's pagination (up to 100 posts).
  let media = []
  let url = `${base}/me/media?fields=id,media_type,media_url,thumbnail_url,permalink&limit=50&access_token=${token}`
  for (let page = 0; url && page < 4; page++) {
    const r = await fetch(url)
    if (!r.ok) break
    const j = await r.json()
    media = media.concat(j.data || [])
    url = j.paging && j.paging.next
  }

  const items = media.map((m) => {
    const isVideo = m.media_type === 'VIDEO'
    const code = (m.permalink.match(/\/(?:reel|p|tv)\/([^/?#]+)/) || [])[1] || ''
    return {
      image: isVideo ? m.thumbnail_url || m.media_url : m.media_url,
      video: isVideo ? m.media_url : '',
      type: isVideo ? 'reel' : 'image',
      shortcode: code,
      permalink: m.permalink,
      live: true,
    }
  })

  return { followers: me.followers_count, following: me.follows_count, posts: me.media_count, items }
}

// Behold (behold.so) connects to Instagram once (free plan works) and then keeps a JSON feed
// updated by itself, with no token to renew. Set BEHOLD_FEED_URL to that feed's URL.
async function viaBehold(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`behold ${res.status}`)
  const d = await res.json()
  const list = Array.isArray(d) ? d : d.posts || []
  const items = list.map((m) => {
    const isVideo = m.mediaType === 'VIDEO' || m.isReel
    const link = m.permalink || ''
    const code = (link.match(/\/(?:reel|p|tv)\/([^/?#]+)/) || [])[1] || ''
    return {
      image: (isVideo ? m.thumbnailUrl : null) || m.sizes?.medium?.mediaUrl || m.mediaUrl,
      video: isVideo ? m.mediaUrl : '',
      type: isVideo ? 'reel' : 'image',
      shortcode: code,
      permalink: link || undefined,
      live: true,
    }
  })
  const num = (v) => (typeof v === 'number' ? v : undefined)
  return {
    followers: num(d.followersCount),
    following: num(d.followsCount),
    posts: num(d.mediaCount),
    items,
  }
}

async function viaPublicProfile() {
  const res = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${HANDLE}`, {
    headers: {
      'x-ig-app-id': '936619743392459',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      accept: '*/*',
    },
  })
  if (!res.ok) throw new Error(`public ${res.status}`)
  const user = (await res.json())?.data?.user
  if (!user) throw new Error('public: no user')
  return {
    followers: user.edge_followed_by?.count,
    following: user.edge_follow?.count,
    posts: user.edge_owner_to_timeline_media?.count,
    items: [],
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
  try {
    const token = process.env.IG_ACCESS_TOKEN
    const behold = process.env.BEHOLD_FEED_URL
    const data = token ? await viaGraphApi(token) : behold ? await viaBehold(behold) : await viaPublicProfile()
    return res.status(200).json({ ok: true, ...data })
  } catch (err) {
    // Don't cache failures for long; the page falls back to its built-in numbers.
    res.setHeader('Cache-Control', 's-maxage=60')
    return res.status(200).json({ ok: false })
  }
}
