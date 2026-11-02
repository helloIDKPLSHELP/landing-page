import { forwardRef, useEffect } from 'react'

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Catalogue', href: '#catalogue' },
  { label: 'Our Impact', href: '#impact' },
  { label: 'Relax', href: '#relax' },
  { label: 'Problem Statement', href: '#problem' },
  { label: 'Shop Now', href: '#shop' },
  { label: 'Meet the Team', href: '#team' },
  { label: 'Contact', href: '#footer' },
]

const SiteMenu = forwardRef(function SiteMenu(
  { open, onClose, getScrollTop },
  ref
) {
  useEffect(() => {
    const dialog = ref?.current
    if (!dialog) return undefined

    const syncClosedState = () => onClose()
    dialog.addEventListener('close', syncClosedState)
    return () => dialog.removeEventListener('close', syncClosedState)
  }, [onClose, ref])

  const navigate = (href) => {
    if (ref?.current?.open) {
      ref.current.close()
    }
    onClose()
    requestAnimationFrame(() => {
      const el = document.querySelector(href)
      if (!el) return
      const top =
        typeof getScrollTop === 'function'
          ? getScrollTop(el)
          : window.scrollY + el.getBoundingClientRect().top
      window.scrollTo({ top, behavior: 'smooth' })
    })
  }

  return (
    <dialog
      ref={ref}
      id="site-nav-dialog"
      className="site-menu-dialog"
      aria-label="Site navigation"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === ref?.current) {
          ref.current.close()
        }
      }}
    >
      <div className="site-menu-panel-inner">
        <div className="site-menu-header">
          <span className="site-menu-brand">UPLIFT</span>
          <button
            type="button"
            className="site-menu-close"
            onClick={() => ref?.current?.close()}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <ul className="site-menu-list">
          {LINKS.map((link, i) => (
            <li
              key={link.href}
              className={`site-menu-item${open ? ' is-open' : ''}`}
              style={{ animationDelay: open ? `${i * 45}ms` : '0ms' }}
            >
              <button
                type="button"
                className="site-menu-link"
                onClick={() => navigate(link.href)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  )
})

SiteMenu.displayName = 'SiteMenu'

export default SiteMenu
