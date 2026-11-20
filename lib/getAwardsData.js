import fs from 'fs'
import path from 'path'

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v']
const POSTER_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif']

const prettyTitle = (fileName) => {
  const base = fileName.replace(/\.[^.]+$/, '').replace(/^\d+[-_.\s]+/, '')
  const spaced = base.replace(/[-_]+/g, ' ').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

// Build-time only: reads /public/awards and returns { videos, photos } for the collage.
export default function getAwardsData() {
  const dir = path.join(process.cwd(), 'public', 'awards')
  let files = []
  let captions = {}

  try { files = fs.readdirSync(dir) } catch (err) { files = [] }
  try { captions = JSON.parse(fs.readFileSync(path.join(dir, 'captions.json'), 'utf8')) } catch (err) { captions = {} }

  const videos = files
    .filter((file) => VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => {
      const stem = file.replace(/\.[^.]+$/, '')
      const posterFile = files.find(
        (f) => f.replace(/\.[^.]+$/, '') === stem && POSTER_EXTENSIONS.includes(path.extname(f).toLowerCase())
      )
      const caption = captions[file] || {}
      return {
        src: `/awards/${encodeURIComponent(file)}`,
        poster: posterFile ? `/awards/${encodeURIComponent(posterFile)}` : null,
        title: caption.title || prettyTitle(file),
        outlet: caption.outlet || '',
        date: caption.date || '',
      }
    })

  let photos = []
  try {
    const photoCaptions = captions.photos || {}
    photos = fs
      .readdirSync(path.join(dir, 'photos'))
      .filter((file) => PHOTO_EXTENSIONS.includes(path.extname(file).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => ({
        src: `/awards/photos/${encodeURIComponent(file)}`,
        caption: photoCaptions[file] || '',
      }))
  } catch (err) {
    photos = []
  }

  return { videos, photos }
}
