import { useEffect, useRef } from 'react'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export default function ProblemStatement() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return undefined

    const panels = track.querySelectorAll('.story-panel')
    if (process.env.NODE_ENV !== 'production' && panels.length < 4) {
      console.error(`UPLIFT story regression: expected at least 4 panels, found ${panels.length}.`)
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let active = true

    const draw = () => {
      frame = 0
      if (!active) return
      const mobile = window.innerWidth < 700
      if (mobile || media.matches) {
        track.style.transform = 'none'
        section.style.height = 'auto'
        section.style.setProperty('--story-progress', '1')
        section.style.setProperty('--discard-progress', '1')
        section.style.setProperty('--discard-y', '0%')
        section.style.setProperty('--discard-text-opacity', '1')
        section.style.setProperty('--story-line', '0')
        return
      }

      const viewportWidth = section.clientWidth
      const horizontalDistance = Math.max(0, track.scrollWidth - viewportWidth)
      if (process.env.NODE_ENV !== 'production' && panels.length > 1 && horizontalDistance === 0) {
        console.warn('UPLIFT story regression: horizontal distance is zero with multiple panels.')
      }
      section.style.height = `${window.innerHeight + horizontalDistance}px`
      const bounds = section.getBoundingClientRect()
      const range = Math.max(1, horizontalDistance)
      const progress = clamp(-bounds.top / range, 0, 1)
      track.style.transform = `translate3d(${-horizontalDistance * progress}px, 0, 0)`
      section.style.setProperty('--story-progress', progress.toFixed(4))
      const discardProgress = clamp((progress - 0.86) / 0.1, 0, 1)
      section.style.setProperty('--discard-progress', discardProgress.toFixed(4))
      section.style.setProperty('--discard-y', `${((1 - discardProgress) * 112).toFixed(2)}%`)
      section.style.setProperty('--discard-text-opacity', `${Math.max(.35, discardProgress).toFixed(3)}`)
      section.style.setProperty('--story-line', `${100 - progress * 100}%`)
    }

    const schedule = () => {
      if (!active || frame) return
      frame = window.requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(schedule)
    observer.observe(section)
    observer.observe(track)
    const images = Array.from(track.querySelectorAll('img'))
    images.forEach((image) => {
      if (!image.complete) image.addEventListener('load', schedule, { once: true })
    })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    media.addEventListener('change', schedule)
    if (document.fonts?.ready) document.fonts.ready.then(schedule)
    draw()

    return () => {
      active = false
      if (frame) window.cancelAnimationFrame(frame)
      observer.disconnect()
      images.forEach((image) => image.removeEventListener('load', schedule))
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      media.removeEventListener('change', schedule)
    }
  }, [])

  return (
    <section id="problem" ref={sectionRef} className="story-sequence">
      <span id="impact" className="story-anchor" aria-hidden="true" />
      <div className="story-sticky">
        <div className="story-progress" aria-hidden="true">
          <span />
        </div>
        <div ref={trackRef} className="story-track">
          <article className="story-panel story-panel--manifesto">
            <div className="story-orbit story-orbit--one" aria-hidden="true" />
            <div className="story-copy story-copy--left">
              <h2>After<br />the pop.</h2>
              <p>
                The celebration lasts a night. The material can stay in nature for
                years. UPLIFT begins where the party usually ends.
              </p>
            </div>
            <figure className="story-image story-image--balloons">
              <img src="/rectangle52028-dygd-500w.png" alt="A bicycle carrying a large collection of balloons" />
            </figure>
            <p className="story-note story-note--one">
              Designed for moments.<br />Discarded for ecosystems.
            </p>
          </article>

          <article className="story-panel story-panel--ocean">
            <figure className="story-image story-image--ocean">
              <img src="/rectangle42028-uqyl-300h.png" alt="Plastic waste floating beneath the ocean surface" />
            </figure>
            <div className="story-copy story-copy--ocean">
              <p className="story-kicker">Wildlife ingestion · entanglement</p>
              <h2>The ocean<br />keeps score.</h2>
              <p>
                Floating balloon fragments can resemble food. Ribbons entangle;
                swallowed latex and mylar can obstruct digestion.
              </p>
            </div>
            <div className="story-circle-copy">
              <span>Soft material</span>
              <strong>Hard<br />consequences.</strong>
            </div>
          </article>

          <article className="story-panel story-panel--fragments">
            <div className="story-copy story-copy--fragments">
              <p className="story-kicker">Chemicals · fragments · food chains</p>
              <h2>It does not<br />disappear.</h2>
              <p>
                Sunlight and friction break balloons into smaller particles. Dyes,
                plasticizers, and preservatives can move into soil and water as the
                material weathers.
              </p>
            </div>
            <figure className="story-image story-image--landscape">
              <img src="/hero.jpg" alt="A shoreline scattered with persistent debris" />
            </figure>
            <div className="story-words" aria-hidden="true">
              <span>fragment</span><span>persist</span><span>enter</span>
            </div>
          </article>

          <article className="story-panel story-panel--comparison">
            <div className="comparison-intro">
              <p className="story-kicker">One brief use. One lasting trace.</p>
              <h2>Hours<br /><em>versus</em><br />years.</h2>
            </div>
            <div className="comparison-stats">
              <div className="comparison-stat">
                <span>Average party use</span>
                <strong>2–12</strong>
                <small>hours</small>
              </div>
              <span className="comparison-vs">vs.</span>
              <div className="comparison-stat">
                <span>Estimated biodegradation</span>
                <strong>4</strong>
                <small>years</small>
              </div>
            </div>
            <figure className="comparison-image">
              <img src="/stressball2028-bfh-1500h.png" alt="Red recycled stress balls held in a hand" />
            </figure>
          </article>

          <article id="catalogue" className="story-panel story-panel--discard">
            <h2 className="discard-title" aria-label="Discard">DISCARD</h2>
            <figure className="discard-frame" aria-label="Colourful reclaimed balls arranged on cream fabric">
              <img src="/rectangle82028-mmgy-600h.png" alt="" />
            </figure>
            <div className="discard-copy">
              <span>THE MATERIAL CHANGES.</span>
              <strong>The joy doesn’t have to.</strong>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
