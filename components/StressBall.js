import React, { useEffect, useRef } from 'react'
import { showNextBalloonFact } from './balloonFacts'

// three.js is bundled with the site so the interaction also works offline.

// Colours: resting pink -> yellowish while the ball is being touched
const PINK = 0xff65bd
const PINK_SHEEN = 0xffb5e0
const YELLOW = 0xffd23f

export default function StressBall() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    let disposed = false
    let cleanup = () => {}

    ;(async () => {
      let THREE
      try {
        THREE = await import('three')
      } catch (err) {
        console.error('Could not load three.js for the stress ball', err)
        return
      }
      if (disposed) return

      const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

      // SCENE
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
      camera.position.z = 7

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.15

      const canvas = renderer.domElement
      canvas.style.display = 'block'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      canvas.style.touchAction = 'none'
      canvas.style.cursor = 'grab'
      mount.appendChild(canvas)

      // LIGHTING
      scene.add(new THREE.AmbientLight(0xffffff, 1.1))

      const keyLight = new THREE.DirectionalLight(0xffffff, 3)
      keyLight.position.set(-3, 5, 5)
      scene.add(keyLight)

      const pinkLight = new THREE.PointLight(0xff5cbd, 35)
      pinkLight.position.set(3, -2, 3)
      scene.add(pinkLight)

      const rimLight = new THREE.PointLight(0x8b4dff, 30)
      rimLight.position.set(-3, 1, -3)
      scene.add(rimLight)

      // BALL
      const radius = 1.25
      const geometry = new THREE.SphereGeometry(radius, 128, 96)
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, // tint comes from per-vertex colours (see deform)
        vertexColors: true,
        roughness: 0.18,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        sheen: 1,
        sheenColor: new THREE.Color(PINK_SHEEN),
        sheenRoughness: 0.25,
      })
      const ball = new THREE.Mesh(geometry, material)
      scene.add(ball)

      const position = geometry.attributes.position
      const original = position.array.slice()
      const count = position.count

      // Per-vertex colours so only the area around the pinch turns yellow
      const colors = new Float32Array(count * 3)
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      // Colour blending helpers
      const cPink = new THREE.Color(PINK)
      const cYellow = new THREE.Color(YELLOW)

      // INVISIBLE HIT SPHERE
      const hitBall = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 64, 64),
        new THREE.MeshBasicMaterial({ visible: false })
      )
      scene.add(hitBall)

      // INTERACTION STATE
      const raycaster = new THREE.Raycaster()
      const pointer = new THREE.Vector2()
      const anchor = new THREE.Vector3(0, 0, 1)
      const direction = new THREE.Vector3(1, 0, 0)

      let pressed = false
      let depth = 0
      let targetDepth = 0
      let stretch = 0
      let targetStretch = 0
      let jiggle = 0
      let jiggleVelocity = 0

      // warm = 0 (pink) .. 1 (yellow)
      let warm = 0
      let targetWarm = 0

      const JIGGLE_BASE = 0.005
      const JIGGLE_MULTIPLIER = 0.01
      const JIGGLE_DAMPING = 0.88
      const MAX_STRETCH = 1.5
      const DENT_SIGMA = 0.25
      const DENT_RECOVERY_SPEED = 1.5
      const STRETCH_AREA_EXPANSION = 0.12
      const MAX_STRETCH_SIGMA = 0.38
      const RING_CENTER = 0.38
      const COLOR_SIGMA = 0.34 // size of the yellow patch (radians on the ball)
      const WARM_IN_SPEED = 9 // how fast it turns yellow
      const WARM_OUT_SPEED = 1.6 // how slowly it fades back to pink

      // Canvas rect helpers (the page is CSS-scaled, so always use the live rect)
      const getRect = () => canvas.getBoundingClientRect()

      const toNDC = (clientX, clientY, rect) => {
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
      }

      function getHit(event) {
        toNDC(event.clientX, event.clientY, getRect())
        raycaster.setFromCamera(pointer, camera)
        const hits = raycaster.intersectObject(hitBall)
        if (hits.length > 0) {
          anchor.copy(hits[0].point).normalize()
          return true
        }
        return false
      }

      function updateDirection(dx, dy) {
        const screenDirection = new THREE.Vector3(dx, -dy, 0).normalize()
        const normal = anchor.clone().normalize()
        screenDirection.addScaledVector(normal, -screenDirection.dot(normal))
        if (screenDirection.length() > 0.001) {
          direction.copy(screenDirection.normalize())
        }
      }

      const onPointerDown = (event) => {
        if (!getHit(event)) return
        showNextBalloonFact()
        pressed = true
        targetDepth = 0.42
        targetStretch = 0
        targetWarm = 1
        jiggle = 0.05
        jiggleVelocity = 0.05
        canvas.style.cursor = 'grabbing'
        canvas.setPointerCapture(event.pointerId)
        dirty = true
      }

      const onPointerMove = (event) => {
        if (!pressed) return

        const rect = getRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const mouseDX = event.clientX - centerX
        const mouseDY = event.clientY - centerY
        const distance = Math.hypot(mouseDX, mouseDY)

        const projectedRadius =
          (radius / camera.position.z) *
          (rect.height /
            (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))))

        const outsideDistance = Math.max(0, distance - projectedRadius)
        const transitionDistance = projectedRadius * 0.26

        let t = clamp(outsideDistance / transitionDistance, 0, 1)
        t = t * t * (3 - 2 * t)

        targetDepth = 0.42 * (1 - t)
        targetStretch = MAX_STRETCH * t

        if (outsideDistance === 0 || distance < 0.001) {
          getHit(event)
        } else {
          const edgeX = mouseDX / distance
          const edgeY = mouseDY / distance
          const edgePointer = new THREE.Vector2(
            ((centerX + edgeX * projectedRadius - rect.left) / rect.width) * 2 - 1,
            -(((centerY + edgeY * projectedRadius - rect.top) / rect.height) * 2 - 1)
          )
          raycaster.setFromCamera(edgePointer, camera)
          const hits = raycaster.intersectObject(hitBall)
          if (hits.length > 0) anchor.copy(hits[0].point).normalize()
        }

        updateDirection(mouseDX, mouseDY)
        dirty = true
      }

      const release = () => {
        if (!pressed) return
        pressed = false
        targetDepth = 0
        targetStretch = 0
        targetWarm = 0
        jiggleVelocity = JIGGLE_BASE + stretch * JIGGLE_MULTIPLIER
        canvas.style.cursor = 'grab'
        dirty = true
      }

      canvas.addEventListener('pointerdown', onPointerDown)
      canvas.addEventListener('pointermove', onPointerMove)
      canvas.addEventListener('pointerup', release)
      canvas.addEventListener('pointercancel', release)
      canvas.addEventListener('lostpointercapture', release)

      // Hover cursor feedback (only when not dragging)
      const onHover = (event) => {
        if (pressed) return
        canvas.style.cursor = getHit(event) ? 'grab' : 'default'
      }
      canvas.addEventListener('pointermove', onHover)

      // Reusable vectors (avoid per-vertex allocations)
      const vx = new THREE.Vector3()
      const vn = new THREE.Vector3()
      const normalAnchor = new THREE.Vector3()

      let dirty = true

      function deform(delta) {
        // Pressing response (frame-based) vs slower recovery (time-based)
        if (pressed) {
          depth += (targetDepth - depth) * 0.17
        } else {
          depth += (targetDepth - depth) * (1 - Math.exp(-DENT_RECOVERY_SPEED * delta))
        }

        stretch += (targetStretch - stretch) * 0.13

        jiggleVelocity -= jiggle * 0.12
        jiggleVelocity *= JIGGLE_DAMPING
        jiggle += jiggleVelocity

        // Colour: quick to yellow, slow to fade back
        const warmSpeed = targetWarm > warm ? WARM_IN_SPEED : WARM_OUT_SPEED
        warm += (targetWarm - warm) * (1 - Math.exp(-warmSpeed * delta))
        if (Math.abs(targetWarm - warm) < 0.002) warm = targetWarm

        normalAnchor.copy(anchor).normalize()

        const stretchSigma = Math.min(
          DENT_SIGMA + stretch * STRETCH_AREA_EXPANSION,
          MAX_STRETCH_SIGMA
        )
        // Yellow patch: a soft spot around the pinch point that grows a little
        // while stretching
        const colorSigma = COLOR_SIGMA + stretch * 0.06

        for (let i = 0; i < count; i++) {
          const index = i * 3
          const ox = original[index]
          const oy = original[index + 1]
          const oz = original[index + 2]

          vn.set(ox, oy, oz).normalize()
          const angle = Math.acos(clamp(vn.dot(normalAnchor), -1, 1))
          const a2 = angle * angle

          const dent = Math.exp(-a2 / (2 * DENT_SIGMA * DENT_SIGMA))
          const stretchInfluence = Math.exp(-a2 / (2 * stretchSigma * stretchSigma))
          const ring = Math.exp(-Math.pow(angle - RING_CENTER, 2) / 0.012)

          const radialAmount = 1 - depth * dent + depth * ring * 0.1

          vx.set(ox, oy, oz).multiplyScalar(radialAmount)
          vx.addScaledVector(direction, stretch * stretchInfluence)

          const wobble = jiggle * Math.exp(-a2 / 0.5)
          vx.multiplyScalar(1 + wobble)

          position.setXYZ(i, vx.x, vx.y, vx.z)

          // Local yellow tint (strongest at the pinch point, fading out)
          const tint = warm * Math.exp(-a2 / (2 * colorSigma * colorSigma))
          colors[index] = cPink.r + (cYellow.r - cPink.r) * tint
          colors[index + 1] = cPink.g + (cYellow.g - cPink.g) * tint
          colors[index + 2] = cPink.b + (cYellow.b - cPink.b) * tint
        }

        position.needsUpdate = true
        geometry.attributes.color.needsUpdate = true
        geometry.computeVertexNormals()
      }

      // Is everything at rest? (lets us skip the heavy deform when idle)
      const isSettled = () =>
        !pressed &&
        Math.abs(depth) < 0.0005 &&
        Math.abs(stretch) < 0.0005 &&
        Math.abs(jiggle) < 0.0005 &&
        Math.abs(jiggleVelocity) < 0.0005 &&
        warm === targetWarm

      // RESIZE
      const resize = () => {
        // layout size (unaffected by the CSS scale transform)
        const w = mount.clientWidth || 1
        const h = mount.clientHeight || 1
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h, false)
        dirty = true
      }
      resize()
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
      if (ro) ro.observe(mount)

      // Only animate while on screen
      let visible = true
      const io =
        typeof IntersectionObserver !== 'undefined'
          ? new IntersectionObserver(
              (entries) => {
                visible = entries.some((e) => e.isIntersecting)
                if (visible) dirty = true
              },
              { threshold: 0 }
            )
          : null
      if (io) io.observe(mount)

      // ANIMATION
      const clock = new THREE.Clock()
      let raf = 0
      const animate = () => {
        raf = requestAnimationFrame(animate)
        const delta = Math.min(clock.getDelta(), 0.033)
        if (!visible) return

        if (dirty || !isSettled()) {
          deform(delta)
          renderer.render(scene, camera)
          dirty = !isSettled() ? true : false
        }
      }
      animate()

      cleanup = () => {
        cancelAnimationFrame(raf)
        if (ro) ro.disconnect()
        if (io) io.disconnect()
        canvas.removeEventListener('pointerdown', onPointerDown)
        canvas.removeEventListener('pointermove', onPointerMove)
        canvas.removeEventListener('pointermove', onHover)
        canvas.removeEventListener('pointerup', release)
        canvas.removeEventListener('pointercancel', release)
        canvas.removeEventListener('lostpointercapture', release)
        geometry.dispose()
        material.dispose()
        hitBall.geometry.dispose()
        hitBall.material.dispose()
        renderer.dispose()
        if (canvas.parentNode === mount) mount.removeChild(canvas)
      }
    })()

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
