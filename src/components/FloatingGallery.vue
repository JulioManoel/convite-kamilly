<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { galleryRows } from '../data/gallery.js'

const MOBILE_QUERY = '(max-width: 768px)'

const sectionRef = ref(null)
const containerRef = ref(null)
const photoRefs = ref([])
const lightboxPhoto = ref(null)
const isMobile = ref(false)

let ctx
let revealObserver
let throwTl
let floatTweens = []

const flatPhotos = computed(() => galleryRows.flatMap((row) => row.photos))

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function checkMobile() {
  isMobile.value = window.matchMedia(MOBILE_QUERY).matches
}

function openLightbox(photo) {
  lightboxPhoto.value = photo
}

function closeLightbox() {
  lightboxPhoto.value = null
}

function onKeydown(event) {
  if (event.key === 'Escape' && lightboxPhoto.value) {
    closeLightbox()
  }
}

function getNodes() {
  return photoRefs.value.filter(Boolean)
}

function clearFloat() {
  floatTweens.forEach((tween) => tween.kill())
  floatTweens = []
}

function placeAtRest(nodes) {
  nodes.forEach((node, index) => {
    const photo = flatPhotos.value[index]
    gsap.set(node, {
      autoAlpha: 1,
      x: photo?.nudgeX ?? 0,
      y: photo?.nudgeY ?? 0,
      rotation: photo?.rotate ?? 0,
      scale: 1,
      transformOrigin: '50% 50%',
    })
  })
}

function stackPhotos(nodes) {
  const container = containerRef.value
  if (!container || !nodes.length) return

  const containerRect = container.getBoundingClientRect()
  const stackX = containerRect.left + containerRect.width / 2
  const stackY = containerRect.top + containerRect.height * 0.28

  nodes.forEach((node, index) => {
    const rect = node.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const photo = flatPhotos.value[index]
    const spin = index % 2 === 0 ? -38 - index * 3 : 42 + index * 2

    gsap.set(node, {
      autoAlpha: 1,
      x: stackX - centerX + (index % 3) * 2,
      y: stackY - centerY - index * 3,
      rotation: spin,
      scale: 0.72,
      zIndex: index + 1,
      transformOrigin: '50% 50%',
      force3D: true,
    })

    // Keep final rest values for the throw tween
    node._rest = {
      x: photo?.nudgeX ?? 0,
      y: photo?.nudgeY ?? 0,
      rotation: photo?.rotate ?? 0,
    }
  })
}

function playThrowAnimation(nodes) {
  throwTl?.kill()

  throwTl = gsap.timeline({
    delay: 0.18,
    defaults: { force3D: true },
    onComplete: () => {
      nodes.forEach((node, index) => {
        node.style.zIndex = ''
        const photo = flatPhotos.value[index]
        gsap.set(node, {
          x: photo?.nudgeX ?? 0,
          y: photo?.nudgeY ?? 0,
          rotation: photo?.rotate ?? 0,
          scale: 1,
        })
      })
      setupFloat()
    },
  })

  nodes.forEach((node, index) => {
    const rest = node._rest ?? {
      x: flatPhotos.value[index]?.nudgeX ?? 0,
      y: flatPhotos.value[index]?.nudgeY ?? 0,
      rotation: flatPhotos.value[index]?.rotate ?? 0,
    }

    throwTl.to(
      node,
      {
        x: rest.x,
        y: rest.y,
        rotation: rest.rotation,
        scale: 1,
        duration: 0.78,
        ease: 'back.out(1.55)',
        zIndex: 10 + index,
      },
      index * 0.13,
    )

    // Soft settle after bounce overshoot
    throwTl.to(
      node,
      {
        y: rest.y,
        rotation: rest.rotation,
        duration: 0.22,
        ease: 'power2.out',
      },
      index * 0.13 + 0.72,
    )
  })
}

function setupFloat() {
  clearFloat()
  if (prefersReducedMotion() || isMobile.value) return

  const nodes = getNodes()
  nodes.forEach((node, index) => {
    const tween = gsap.to(node, {
      y: `+=${4 + (index % 3)}`,
      duration: 3 + index * 0.35,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: index * 0.2,
    })
    floatTweens.push(tween)
  })
}

function setupThrowReveal() {
  const container = containerRef.value
  const nodes = getNodes()
  if (!container || !nodes.length) return

  if (prefersReducedMotion()) {
    placeAtRest(nodes)
    return
  }

  // Hide until measured, then stack off-layout briefly
  gsap.set(nodes, { autoAlpha: 0 })

  revealObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      revealObserver?.disconnect()

      // Measure natural layout while hidden, then stack and throw
      requestAnimationFrame(() => {
        gsap.set(nodes, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 0 })
        stackPhotos(nodes)
        playThrowAnimation(nodes)
      })
    },
    { threshold: 0.18 },
  )
  revealObserver.observe(container)
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('keydown', onKeydown)
  await nextTick()

  ctx = gsap.context(() => {
    setupThrowReveal()
  }, sectionRef.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('keydown', onKeydown)
  revealObserver?.disconnect()
  throwTl?.kill()
  clearFloat()
  ctx?.revert()
})
</script>

<template>
  <section ref="sectionRef" class="floating-gallery" data-scroll-reveal>
    <h3 class="floating-gallery__title">Galeria</h3>
    <div ref="containerRef" class="floating-gallery__container">
      <div
        v-for="row in galleryRows"
        :key="row.id"
        class="floating-gallery__row"
        :class="`floating-gallery__row--${row.photos.length}`"
      >
        <button
          v-for="photo in row.photos"
          :key="photo.id"
          ref="photoRefs"
          type="button"
          class="floating-gallery__photo"
          :aria-label="photo.caption ? `${photo.alt}. ${photo.caption}` : photo.alt"
          @click="openLightbox(photo)"
        >
          <figure class="floating-gallery__polaroid">
            <div class="floating-gallery__frame">
              <img
                v-if="photo.src"
                class="floating-gallery__image"
                :src="photo.src"
                :alt="photo.alt"
                loading="lazy"
                decoding="async"
                draggable="false"
              />
              <div v-else class="floating-gallery__placeholder" aria-hidden="true" />
            </div>
            <figcaption v-if="photo.caption" class="floating-gallery__caption">
              {{ photo.caption }}
            </figcaption>
          </figure>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="lightboxPhoto"
        class="floating-gallery__lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="lightboxPhoto.alt"
        @click.self="closeLightbox"
      >
        <button
          type="button"
          class="floating-gallery__close"
          aria-label="Fechar"
          @click="closeLightbox"
        >
          &times;
        </button>
        <figure class="floating-gallery__polaroid floating-gallery__polaroid--lightbox">
          <div class="floating-gallery__frame">
            <img
              v-if="lightboxPhoto.src"
              class="floating-gallery__image"
              :src="lightboxPhoto.src"
              :alt="lightboxPhoto.alt"
              draggable="false"
            />
            <div v-else class="floating-gallery__placeholder" aria-hidden="true" />
          </div>
          <figcaption v-if="lightboxPhoto.caption" class="floating-gallery__caption">
            {{ lightboxPhoto.caption }}
          </figcaption>
        </figure>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.floating-gallery {
  padding-block: clamp(1.75rem, 5vw, 2.75rem);
}

.floating-gallery__title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--vn-blue-mid);
  text-align: center;
  margin-bottom: 1.25rem;
}

.floating-gallery__container {
  display: flex;
  flex-direction: column;
  gap: clamp(0.35rem, 2vw, 0.85rem);
  width: 100%;
  overflow: visible;
  padding-inline: 0.15rem;
}

.floating-gallery__row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: clamp(0.15rem, 2vw, 0.55rem);
  position: relative;
}

.floating-gallery__row + .floating-gallery__row {
  margin-top: clamp(-0.85rem, -2.5vw, -0.35rem);
}

.floating-gallery__photo {
  flex: 0 1 auto;
  width: clamp(100px, 30vw, 138px);
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transform-origin: center center;
  transition: filter 0.25s ease;
  z-index: 1;
  will-change: transform, opacity;
  visibility: hidden;
}

.floating-gallery__row--3 .floating-gallery__photo {
  width: clamp(90px, 27vw, 122px);
}

.floating-gallery__row--3 .floating-gallery__photo:nth-child(1) {
  z-index: 2;
}

.floating-gallery__row--3 .floating-gallery__photo:nth-child(2) {
  z-index: 3;
  margin-inline: clamp(-0.35rem, -1.5vw, -0.1rem);
}

.floating-gallery__row--3 .floating-gallery__photo:nth-child(3) {
  z-index: 2;
}

.floating-gallery__row--2 .floating-gallery__photo:nth-child(1) {
  z-index: 2;
}

.floating-gallery__row--2 .floating-gallery__photo:nth-child(2) {
  z-index: 3;
  margin-left: clamp(-0.5rem, -2vw, -0.15rem);
}

.floating-gallery__photo:hover,
.floating-gallery__photo:focus-visible {
  z-index: 5;
  filter: brightness(1.03);
}

.floating-gallery__photo:hover .floating-gallery__polaroid,
.floating-gallery__photo:focus-visible .floating-gallery__polaroid {
  box-shadow:
    0 14px 36px rgba(27, 45, 79, 0.24),
    0 0 0 1px var(--vn-gold-glow);
}

.floating-gallery__photo:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 4px;
}

.floating-gallery__polaroid {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0.45rem 0.45rem 0;
  background: #fffef9;
  border: 1px solid rgba(212, 168, 67, 0.35);
  box-shadow: 0 8px 22px rgba(27, 45, 79, 0.16);
  transition: box-shadow 0.25s ease;
}

.floating-gallery__polaroid--lightbox {
  width: min(78vw, 300px);
  padding: 0.7rem 0.7rem 0;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
}

.floating-gallery__frame {
  aspect-ratio: 3 / 4;
  width: 100%;
  overflow: hidden;
  background: var(--vn-paper-shadow);
}

.floating-gallery__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.floating-gallery__placeholder {
  width: 100%;
  height: 100%;
  background: var(--vn-gradient-paper);
}

.floating-gallery__caption {
  min-height: 2.1rem;
  padding: 0.45rem 0.2rem 0.65rem;
  font-family: 'Parisienne', cursive;
  font-size: clamp(0.72rem, 2.2vw, 0.92rem);
  line-height: 1.2;
  color: var(--vn-ink);
  text-align: center;
  letter-spacing: 0.01em;
}

.floating-gallery__polaroid--lightbox .floating-gallery__caption {
  min-height: 2.6rem;
  padding: 0.65rem 0.35rem 0.9rem;
  font-size: clamp(1.05rem, 3.5vw, 1.35rem);
}

.floating-gallery__lightbox {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 18, 41, 0.85);
  padding: 1.5rem;
}

.floating-gallery__close {
  position: absolute;
  top: max(1rem, env(safe-area-inset-top));
  right: max(1rem, env(safe-area-inset-right));
  width: 44px;
  height: 44px;
  font-size: 1.75rem;
  color: var(--vn-gold-soft);
  display: grid;
  place-items: center;
}
</style>
