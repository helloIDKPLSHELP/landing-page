import React, { useCallback, useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import SiteMenu from '../components/SiteMenu'
import ProblemStatement from '../components/ProblemStatement'
import StressBall from '../components/StressBall'
import InstagramFeed from '../components/InstagramFeed'
import InteractiveAtmosphere from '../components/InteractiveAtmosphere'
import BALLOON_FACTS, { BALLOON_FACT_EVENT } from '../components/balloonFacts'

const TEAM = [
  { name: 'ADITYA BAHUKHANDI', role: 'CEO', photo: '/team/aditya.png' },
  { name: 'ANVAY SHAH CHAWLA', role: 'COO', photo: '/team/anvay.png' },
  { name: 'AHANA SURYAVANSHI', role: 'CMO', photo: '/team/ahana.png' },
  { name: 'DEVASYA MADAN', role: 'CFO', photo: '/team/devasya.png' },
  { name: 'MANPREET KAUR', role: 'TEACHER ADVISOR', photo: '/team/manpreet.png' },
]

// The fact panel moves to a different spot around the ball each time it changes
const FACT_SLOTS = ['a', 'b', 'c', 'd']

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [stressFactIndex, setStressFactIndex] = useState(0)
  const [stressFactChanging, setStressFactChanging] = useState(false)
  const menuRef = useRef(null)
  const heroBallRef = useRef(null)
  const stressFactTimerRef = useRef(0)
  const getScrollTop = useCallback((element) => window.scrollY + element.getBoundingClientRect().top, [])

  const openMenu = useCallback(() => {
    if (menuRef.current && !menuRef.current.open) menuRef.current.showModal()
    setMenuOpen(true)
  }, [])

  useEffect(() => {
    const ball = heroBallRef.current
    if (!ball) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const draw = () => {
      frame = 0
      const heroDistance = Math.max(1, window.innerHeight * 0.78)
      const heroProgress = Math.min(Math.max(window.scrollY / heroDistance, 0), 1)
      const eased = 1 - Math.pow(1 - heroProgress, 1.6)
      ball.style.setProperty('--ball-p', reduced.matches ? '0' : eased.toFixed(4))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    reduced.addEventListener('change', schedule)
    draw()
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      reduced.removeEventListener('change', schedule)
    }
  }, [])

  useEffect(() => {
    const updateFact = (event) => {
      const nextIndex = Number(event.detail?.index)
      if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= BALLOON_FACTS.length) return
      window.clearTimeout(stressFactTimerRef.current)
      setStressFactChanging(true)
      stressFactTimerRef.current = window.setTimeout(() => {
        setStressFactIndex(nextIndex)
        setStressFactChanging(false)
      }, 140)
    }
    window.addEventListener(BALLOON_FACT_EVENT, updateFact)
    return () => {
      window.clearTimeout(stressFactTimerRef.current)
      window.removeEventListener(BALLOON_FACT_EVENT, updateFact)
    }
  }, [])

  useEffect(() => {
    let active = true
    const settleHashTarget = async () => {
      if (!window.location.hash) return
      const images = Array.from(document.images)
      await Promise.all([
        document.fonts?.ready || Promise.resolve(),
        ...images.map((image) =>
          image.decode ? image.decode().catch(() => undefined) : Promise.resolve()
        ),
      ])
      if (!active) return
      const target = document.querySelector(window.location.hash)
      if (!target) return
      requestAnimationFrame(() => requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' })))
    }
    settleHashTarget()
    return () => { active = false }
  }, [])

  return (
    <>
      <Head>
        <title>UPLIFT — Give waste a second act.</title>
        <meta name="description" content="UPLIFT turns discarded party balloons into useful, playful products." />
      </Head>
      <InteractiveAtmosphere />
      <SiteMenu ref={menuRef} open={menuOpen} onClose={() => setMenuOpen(false)} getScrollTop={getScrollTop} />
      <button className="menu-trigger" type="button" aria-label="Open navigation menu" aria-expanded={menuOpen} aria-controls="site-nav-dialog" onClick={openMenu}>
        <span /><span />
      </button>

      <main className="uplift-site">
        <section id="home" className="cinema-hero">
          <div className="hero-topline">
            <a href="#home" className="wordmark">UPLIFT<span>.</span></a>
          </div>
          <div className="hero-orbit hero-orbit--a" aria-hidden="true" />
          <div className="hero-orbit hero-orbit--b" aria-hidden="true" />
          <div className="hero-image-wrap">
            <img className="hero-photo" src="/frontimage-noball.png" alt="A hand reaching into a clear blue sky" />
            <img ref={heroBallRef} className="hero-tennis-ball" src="/tennis-ball.png" alt="" aria-hidden="true" draggable={false} />
          </div>
          <div className="hero-heading" aria-label="Give waste a second act">
            <span>GIVE WASTE</span><span>A SECOND ACT</span>
          </div>
          <p className="hero-intro">We take what the party leaves behind and turn it into something worth keeping.</p>
          <a className="oval-link" href="#problem">DECODE THE PROBLEM</a>
          <span className="scroll-cue">SCROLL TO BEGIN <i /></span>
        </section>

        <ProblemStatement />

        <section id="relax" className="stress-scene">
          <div className="stress-copy">
            <h2>PRESS.<br />PULL.<br /><em>LET GO.</em></h2>
            <p>Give the ball a squeeze. Its surface gives way, warms to yellow, and every squeeze shares a new fact from the world it came from.</p>
          </div>
          <div className="stress-canvas"><StressBall /></div>
          <div className={`stress-fact-stack${stressFactChanging ? ' is-changing' : ''}`} data-slot={FACT_SLOTS[stressFactIndex % FACT_SLOTS.length]}>
            <aside className="stress-fact-panel" aria-live="polite" aria-atomic="true">
              <div className="stress-fact-header">
                <span>BALLOON FACT</span>
                <small>{String(stressFactIndex + 1).padStart(2, '0')} / {String(BALLOON_FACTS.length).padStart(2, '0')}</small>
              </div>
              <p className={stressFactChanging ? 'is-changing' : ''}>{BALLOON_FACTS[stressFactIndex]}</p>
            </aside>
            <p className="stress-instruction">PRESS · DRAG · SQUISH</p>
          </div>
        </section>

        <section id="shop" className="shop-editorial">
          <header className="shop-header"><h2>PLAY<br />IT<br /><em>FORWARD.</em></h2></header>
          <div className="product-showcase">
            <div className="product-grid">
              <article className="product-card product-card--tennis">
                <div className="product-number">01 / COURT</div><img src="/products/tennis.jpg" alt="UPLIFT recycled tennis balls" />
                <div className="product-info"><h3>TENNIS BALLS</h3><span>₹59</span><p>For athletes, streets, and second chances.</p></div>
              </article>
              <article className="product-card product-card--stress">
                <div className="product-number">02 / CALM</div><img src="/products/stress.jpg" alt="UPLIFT recycled stress balls" />
                <div className="product-info"><h3>STRESS BALLS</h3><span>₹199</span><p>A softer landing for material and mind.</p></div>
              </article>
            </div>
            <a className="oval-link oval-link--dark" href="mailto:uplifttisvv@gmail.com">ASK ABOUT AN ORDER</a>
          </div>
        </section>

        <section id="team" className="team-editorial">
          <h2>SMALL TEAM.<br /><em>BIG LIFT.</em></h2>
          <div className="team-grid">
            {TEAM.map((member, index) => (
              <article className={`team-person team-person--${index + 1}`} key={member.name}>
                <img src={member.photo} alt={member.name} /><h3>{member.name}</h3><p>{member.role}</p>
              </article>
            ))}
          </div>
        </section>

        <InstagramFeed />

        <section className="closing-image">
          <img src="/stressball2028-bfh-1500h.png" alt="Bright red and pink stress balls held in a hand" />
          <div className="closing-shade" />
          <div className="closing-copy"><p>THE PARTY ISN’T OVER.</p><h2>IT JUST<br />CHANGED<br /><em>SHAPE.</em></h2></div>
        </section>
      </main>

      <footer id="footer" className="site-footer">
        <div className="footer-brand">
          <a className="wordmark wordmark--footer" href="#home">UPLIFT<span>.</span></a>
          <p>We recycle party balloons to make products.</p>
          <div className="footer-socials" aria-label="Social platforms">
            <a href="https://www.instagram.com/upliftt.ind/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src="/sociallink12028-6wef.svg" alt="" />
            </a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <img src="/sociallink22028-67pg.svg" alt="" />
            </a>
            <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
              <img src="/sociallink32028-7os.svg" alt="" />
            </a>
          </div>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <h2>Explore</h2>
          <a href="#problem">Our impact</a>
          <a href="#relax">Relax</a>
          <a href="#shop">Shop</a>
          <a href="#team">Meet the team</a>
        </nav>
        <div className="footer-info">
          <h2>Information</h2>
          <address>Paschimi Marg, Vasant Vihar,<br />New Delhi — 110057</address>
        </div>
        <div className="footer-contact">
          <h2>Contact</h2>
          <a href="tel:+918851587068">+91 88515 87068</a>
          <a href="tel:+919650622211">+91 96506 22211</a>
          <a href="mailto:uplifttisvv@gmail.com">uplifttisvv@gmail.com</a>
        </div>
        <small>© {new Date().getFullYear()} UPLIFT · New Delhi</small>
      </footer>
    </>
  )
}
