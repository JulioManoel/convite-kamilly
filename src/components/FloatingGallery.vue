<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { galleryPhotos } from '../data/gallery.js'

const MOBILE_QUERY = '(max-width: 768px)'

const containerRef = ref(null)
const photoRefs = ref([])
const lightboxPhoto = ref(null)
const isMobile = ref(false)

let revealObserver
let floatTl

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function checkMobile() {
  isMobile.value = window.matchMedia(MOBILE_QUERY).matches
}

const photos = computed(() =>
  galleryPhotos.map((photo) => {
    const pos = isMobile.value && photo.mobile ? photo.mobile : photo
    return {
      ...photo,
      style: {
        top: pos.top,
        left: pos.left,
        transform: `rotate(${pos.rotate}deg) scale(${pos.scale})`,
      },
    }
  }),
)

function openLightbox(photo) {
  lightboxPhoto.value = photo
}

function closeLightbox() {
  lightboxPhoto.value = null
}

function setupReveal() {
  const container = containerRef.value
  if (!container || prefersReducedMotion()) return

  const nodes = photoRefs.value.filter(Boolean)
  gsap.set(nodes, { autoAlpha: 0, scale: 0.9 })

  revealObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        gsap.to(nodes, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.65,
          stagger: 0.12,
          ease: 'power3.out',
        })
        revealObserver?.disconnect()
      }
    },
    { threshold: 0.15 },
  )
  revealObserver.observe(container)
}

function setupFloat() {
  if (prefersReducedMotion() || isMobile.value) return

  const nodes = photoRefs.value.filter(Boolean)
  floatTl = gsap.timeline({ repeat: -1 })
  nodes.forEach((node, index) => {
    gsap.to(node, {
      y: '+=4',
      duration: 3 + index * 0.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: index * 0.3,
    })
  })
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  setupReveal()
  setupFloat()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  revealObserver?.disconnect()
  floatTl?.kill()
})
</script>

<template>
  <section class="floating-gallery" data-scroll-reveal>
    <h3 class="floating-gallery__title">Galeria</h3>
    <div ref="containerRef" class="floating-gallery__container">
      <button
        v-for="(photo, index) in photos"
        :key="photo.id"
        ref="photoRefs"
        type="button"
        class="floating-gallery__photo"
        :style="photo.style"
        :aria-label="photo.alt"
        @click="openLightbox(photo)"
      >
        <div class="floating-gallery__placeholder" aria-hidden="true" />
      </button>
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
        <div class="floating-gallery__lightbox-content">
          <div class="floating-gallery__placeholder floating-gallery__placeholder--large" />
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.floating-gallery {
  padding-block: clamp(2rem, 6vw, 3rem);
}

.floating-gallery__title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--vn-blue-mid);
  text-align: center;
  margin-bottom: 1.5rem;
}

.floating-gallery__container {
  position: relative;
  width: 100%;
  min-height: 420px;
  overflow: visible;
}

.floating-gallery__photo {
  position: absolute;
  width: clamp(100px, 28vw, 140px);
  aspect-ratio: 3 / 4;
  padding: 0;
  border: 2px solid var(--vn-gold-soft);
  border-radius: 4px;
  background: var(--vn-cream);
  box-shadow: 0 8px 24px rgba(27, 45, 79, 0.15);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.floating-gallery__photo:hover {
  transform: scale(1.04) !important;
  z-index: 2;
  box-shadow: 0 12px 32px var(--vn-gold-glow);
}

.floating-gallery__placeholder {
  width: 100%;
  height: 100%;
  background: var(--vn-gradient-paper);
  border-radius: 2px;
}

.floating-gallery__placeholder--large {
  width: min(80vw, 320px);
  aspect-ratio: 3 / 4;
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

.floating-gallery__lightbox-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 769px) {
  .floating-gallery__container {
    min-height: 580px;
  }
}
</style>
