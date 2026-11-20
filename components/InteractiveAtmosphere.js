import { useEffect, useRef } from 'react'

export default function InteractiveAtmosphere() {
  const overlayRef = useRef(null)
  const pointerRef = useRef(null)
  const ballRef = useRef(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const pointer = pointerRef.current
    const ball = ballRef.current
    if (!overlay || !pointer || !ball) return undefined

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches) {
      overlay.dataset.visible = 'true'
      return undefined
    }

    let pointerX = innerWidth / 2
    let pointerY = innerHeight / 2
    let ballX = pointerX + 18
    let ballY = pointerY + 18
    let ambientX = pointerX
    let ambientY = pointerY
    let previousBallX = ballX
    let rotation = 0
    let frame = 0
    let visible = false
    let hoveringControl = false

    const paint = () => {
      frame = 0
      const ease = reducedMotion.matches ? 1 : 0.18
      ballX += (pointerX + 18 - ballX) * ease
      ballY += (pointerY + 18 - ballY) * ease
      const ambientEase = reducedMotion.matches ? 1 : 0.34
      ambientX += (pointerX - ambientX) * ambientEase
      ambientY += (pointerY - ambientY) * ambientEase
      rotation += (ballX - previousBallX) * 1.6
      previousBallX = ballX

      pointer.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%) scale(${hoveringControl ? 1.45 : 1})`
      ball.style.transform = `translate3d(${ballX}px, ${ballY}px, 0) translate(-50%, -50%) rotate(${rotation}deg)`
      document.documentElement.style.setProperty('--ambient-x', `${(ambientX / innerWidth) * 100}%`)
      document.documentElement.style.setProperty('--ambient-y', `${(ambientY / innerHeight) * 100}%`)

      if (
        Math.abs(pointerX + 18 - ballX) > .15 ||
        Math.abs(pointerY + 18 - ballY) > .15 ||
        Math.abs(pointerX - ambientX) > .15 ||
        Math.abs(pointerY - ambientY) > .15
      ) frame = requestAnimationFrame(paint)
    }

    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint) }
    const onMove = (event) => {
      pointerX = event.clientX
      pointerY = event.clientY
      const contentBelow = document.elementsFromPoint(pointerX, pointerY).find((element) => !overlay.contains(element))
      hoveringControl = Boolean(contentBelow?.closest?.('a, button, input, textarea, select, [role="button"]'))
      if (!visible) {
        visible = true
        overlay.dataset.visible = 'true'
        document.documentElement.classList.add('custom-cursor-ready')
      }
      schedule()
    }
    const onLeave = () => { visible = false; overlay.dataset.visible = 'false' }
    const onEnter = () => { if (visible) overlay.dataset.visible = 'true' }
    const onResize = () => schedule()

    addEventListener('pointermove', onMove, { passive: true })
    addEventListener('resize', onResize)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      removeEventListener('pointermove', onMove)
      removeEventListener('resize', onResize)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      document.documentElement.classList.remove('custom-cursor-ready')
      document.documentElement.style.removeProperty('--ambient-x')
      document.documentElement.style.removeProperty('--ambient-y')
    }
  }, [])

  return (
    <div ref={overlayRef} className="pointer-overlay">
      <span ref={ballRef} className="tennis-ball-trigger" aria-hidden="true">
        <img src="/tennis-ball.png" alt="" draggable={false} />
      </span>
      <span ref={pointerRef} className="ivory-pointer" aria-hidden="true" />
    </div>
  )
}
