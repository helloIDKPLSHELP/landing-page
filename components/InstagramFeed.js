import Script from 'next/script'

const INSTAGRAM_HANDLE = 'upliftt.ind'
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`

export default function InstagramFeed() {
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

      {/* Elfsight Instagram Feed | Untitled Instagram Feed */}
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
      <div className="elfsight-wrap">
        {/* The clip box crops the bottom of the widget, which is where Elfsight puts its badge */}
        <div className="elfsight-clip">
          <div className="elfsight-app-e1c13923-141f-4453-9ce5-1a31e299dab0" data-elfsight-app-lazy />
        </div>
      </div>
    </section>
  )
}
