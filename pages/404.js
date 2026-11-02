import Head from 'next/head'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 — UPLIFT</title>
      </Head>
      <main className="not-found-page">
        <p className="not-found-eyebrow">Oops!</p>
        <h1 className="not-found-code">404</h1>
        <p className="not-found-message">
          We are sorry, but the page you requested was not found.
        </p>
        <Link href="/" className="not-found-link">
          Back to home
        </Link>
      </main>
      <style jsx>{`
        .not-found-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          font-family: Inter, sans-serif;
          background: #fff;
        }
        .not-found-eyebrow {
          margin: 0 0 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(154, 47, 23, 1);
        }
        .not-found-code {
          margin: 0;
          font-size: clamp(5rem, 18vw, 9rem);
          font-weight: 900;
          line-height: 1;
          color: #262626;
        }
        .not-found-message {
          max-width: 24rem;
          margin: 1rem 0 1.5rem;
          color: rgba(0, 0, 0, 0.65);
        }
        .not-found-link {
          font-weight: 600;
          color: #000;
          padding: 0.65rem 1.25rem;
          border-radius: 999px;
          border: 1px solid rgba(154, 47, 23, 0.5);
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .not-found-link:hover {
          background: rgba(154, 47, 23, 0.12);
          transform: translateY(-2px);
        }
      `}</style>
    </>
  )
}
