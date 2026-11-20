import Head from 'next/head'
import Link from 'next/link'
import AwardsBoard from '../components/AwardsBoard'
import getAwardsData from '../lib/getAwardsData'

export async function getStaticProps() {
  return { props: getAwardsData() }
}

export default function Awards({ videos, photos }) {
  return (
    <>
      <Head>
        <title>We did this — UPLIFT</title>
        <meta name="description" content="UPLIFT in the news: awards, recognition and news segments." />
      </Head>
      <main className="awards-page">
        <header className="awards-topline">
          <Link href="/"><a className="wordmark" aria-label="UPLIFT home">UPLIFT<span>.</span></a></Link>
          <Link href="/"><a className="awards-back">← BACK TO HOME</a></Link>
        </header>
        <section className="awards-hero">
          <p className="awards-eyebrow">AWARDS &amp; IN THE NEWS</p>
          <h1>WE DID <em>THIS.</em></h1>
        </section>
        <section className="vision-board" aria-label="Awards and news coverage">
          <AwardsBoard videos={videos} photos={photos} />
        </section>
        <footer className="awards-footer">
          <Link href="/"><a className="oval-link oval-link--inline">BACK TO UPLIFT</a></Link>
        </footer>
      </main>
    </>
  )
}
