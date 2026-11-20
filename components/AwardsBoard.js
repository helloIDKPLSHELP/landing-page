// Mix videos and photos so the board feels scattered, not sorted
const interleave = (videos, photos) => {
  const items = []
  const total = videos.length + photos.length
  let v = 0
  let p = 0
  for (let i = 0; i < total; i++) {
    const wantVideo = v < videos.length && (p >= photos.length || i % 3 === 0 || (i + 1) * videos.length >= (v + 1) * total)
    if (wantVideo) items.push({ type: 'video', ...videos[v++] })
    else items.push({ type: 'photo', ...photos[p++] })
  }
  return items
}

export default function AwardsBoard({ videos = [], photos = [] }) {
  const items = interleave(videos, photos)
  if (items.length === 0) {
    return <p className="awards-empty">News coverage is on its way. Check back soon.</p>
  }
  return (
    <div className="board">
      {items.map((item, i) => (
        <figure className={`board__item board__item--${item.type} board__item--${i % 8}`} key={item.src}>
          {i % 2 === 0 ? <span className="board__tape" aria-hidden="true" /> : <span className="board__pin" aria-hidden="true" />}
          {item.type === 'video' ? (
            <div className="board__video">
              <video controls playsInline preload="metadata" poster={item.poster || undefined} src={item.poster ? item.src : `${item.src}#t=0.1`}>
                Your browser can’t play this video.
              </video>
            </div>
          ) : (
            <img src={item.src} alt={item.caption || 'UPLIFT moment'} loading="lazy" />
          )}
          {item.type === 'video' ? (
            <figcaption>
              <strong>{item.title}</strong>
              {(item.outlet || item.date) && <span>{[item.outlet, item.date].filter(Boolean).join(' · ')}</span>}
            </figcaption>
          ) : (
            item.caption && <figcaption>{item.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}
