// UPLIFT Instagram page, used by the "SEE THE POP." section.
export const INSTAGRAM_HANDLE = 'upliftt.ind'
export const INSTAGRAM_URL = 'https://www.instagram.com/upliftt.ind/'

// Shown instantly, and kept if the live feed (/api/instagram) is unavailable.
export const FALLBACK_STATS = { posts: 13, followers: 241, following: 5 }

// Fallback posts (used until / unless live data from /api/instagram arrives).
// To make a reel play inside the site, give it ONE of:
//   shortcode: the bit after /reel/ in the reel's URL
//              (instagram.com/reel/ABC123xyz/  ->  'ABC123xyz')  -> plays via Instagram's embed player
//   video:     a path to an mp4 you host, e.g. '/instagram/reel1.mp4' -> plays natively
// Add more entries (any number) and the arrow button will scroll through them.
export const FALLBACK_POSTS = [
  { image: '/instagram/post1.jpg', type: 'reel', shortcode: '', video: '' },
  { image: '/instagram/post2.jpg', type: 'reel', shortcode: '', video: '' },
  { image: '/instagram/post3.jpg', type: 'image', shortcode: '', video: '' },
  { image: '/instagram/post4.jpg', type: 'reel', shortcode: '', video: '' },
  { image: '/instagram/post5.jpg', type: 'reel', shortcode: '', video: '' },
  { image: '/instagram/post6.jpg', type: 'reel', shortcode: '', video: '' },
].map((p, i) => ({
  ...p,
  permalink: p.shortcode ? `${INSTAGRAM_URL.replace(/\/$/, '')}/${p.type === 'reel' ? 'reel' : 'p'}/${p.shortcode}/` : INSTAGRAM_URL,
  alt: `Instagram post ${i + 1} from @${INSTAGRAM_HANDLE}`,
}))
