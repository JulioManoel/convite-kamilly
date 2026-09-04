<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import capaImage from '../assets/capa.png'
import paperTexture from '../assets/starry-night-paper.webp'
import swirlImage from '../assets/starry-night-swirl.webp'
import swirlTrImage from '../assets/starry-night-swirl.webp'
import { gifts, invitation, isRsvpConfirmed, location, quote } from '../data/invite.js'
import AmbientMusic from './AmbientMusic.vue'
import CountdownBlock from './CountdownBlock.vue'
import DateBadge from './DateBadge.vue'
import FloatingGallery from './FloatingGallery.vue'
import GoldDivider from './GoldDivider.vue'
import InviteActionModal from './InviteActionModal.vue'

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger)

defineProps({
  isOpen: { type: Boolean, default: false },
  isCentered: { type: Boolean, default: false },
  isExpanded: { type: Boolean, default: false },
})

const SPARKLE_COUNT = 12

const letterMouthRef = ref(null)
const letterRef = ref(null)
const letterSheetRef = ref(null)
const backdropRef = ref(null)
const sparklesRef = ref(null)
const contentRef = ref(null)
const coverRef = ref(null)
const coverImageRef = ref(null)
const coverVeilRef = ref(null)
const coverFooterRef = ref(null)
const quoteSectionRef = ref(null)

const isModalOpen = ref(false)
const rsvpConfirmed = ref(false)

const sparkles = ref(
  Array.from({ length: SPARKLE_COUNT }, (_, index) => {
    const angle = (index / SPARKLE_COUNT) * Math.PI * 2
    const radius = 38 + (index % 4) * 10
    return {
      id: index,
      left: `${50 + Math.cos(angle) * radius * 0.42}%`,
      top: `${48 + Math.sin(angle) * radius * 0.55}%`,
      size: index % 5 === 0 ? 3.2 : index % 2 === 0 ? 2.1 : 1.3,
    }
  }),
)

let revealTl
let sparkleTl
let arrowTl
let coverScrollTl
let coverObserver
let scrollRevealObserver
let isScrolling = false

const ctaLabel = computed(() =>
  rsvpConfirmed.value ? 'Presença confirmada' : 'Confirmar presença',
)

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getRevealTargets() {
  return contentRef.value?.querySelectorAll('[data-scroll-reveal]') ?? []
}

function prepareContentReveal() {
  revealTl?.kill()
  const targets = getRevealTargets()
  if (!targets.length) return
  gsap.set(targets, { autoAlpha: 0, y: 28 })
}

function playContentReveal() {
  revealTl?.kill()
  const targets = getRevealTargets()
  if (!targets.length) return

  if (prefersReducedMotion()) {
    gsap.set(targets, { autoAlpha: 1, y: 0, clearProps: 'transform' })
    return
  }

  gsap.set(targets, { autoAlpha: 0, y: 28 })
  revealTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  revealTl.to(targets, {
    autoAlpha: 1,
    y: 0,
    duration: 0.65,
    stagger: 0.08,
  })
}

function playSparkles() {
  sparkleTl?.kill()
  const nodes = sparklesRef.value?.querySelectorAll('.invite-sparkle')
  if (!nodes?.length || prefersReducedMotion()) return

  const mobile = window.matchMedia('(max-width: 768px)').matches
  gsap.set(nodes, { autoAlpha: 0, scale: 0.35, force3D: true })
  sparkleTl = gsap.timeline()
  sparkleTl.to(nodes, {
    autoAlpha: 0.9,
    scale: 1,
    duration: 0.45,
    stagger: 0.03,
    ease: 'power2.out',
    force3D: true,
  })
  if (!mobile) {
    sparkleTl.to(
      nodes,
      {
        autoAlpha: 0.28,
        y: '-=5',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { each: 0.08, from: 'random' },
      },
      0.35,
    )
  }
}

async function fadeBackdrop(show) {
  const el = backdropRef.value
  if (!el) return
  if (prefersReducedMotion()) {
    gsap.set(el, { autoAlpha: show ? 1 : 0 })
    return
  }
  await gsap.to(el, {
    autoAlpha: show ? 1 : 0,
    duration: show ? 0.95 : 0.4,
    ease: show ? 'power2.out' : 'power1.in',
  })
}

function presentInvite() {
  fadeBackdrop(true)
  playCoverEntrance()
  playSparkles()
  requestAnimationFrame(() => {
    setupCoverScrollTransition()
    setupScrollReveal()
    ScrollTrigger.refresh()
  })
}

function playCoverEntrance() {
  const image = coverImageRef.value
  const footer = coverFooterRef.value
  const veil = coverVeilRef.value
  if (!image || prefersReducedMotion()) {
    if (image) gsap.set(image, { autoAlpha: 1, scale: 1 })
    if (footer) gsap.set(footer, { autoAlpha: 1, y: 0 })
    if (veil) gsap.set(veil, { autoAlpha: 0 })
    return
  }

  gsap.set(veil, { autoAlpha: 0 })
  gsap.fromTo(
    image,
    { scale: 1.08, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 1.05, ease: 'power2.out' },
  )
  gsap.fromTo(
    footer,
    { autoAlpha: 0, y: 18 },
    { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out', delay: 0.45 },
  )
}

function setupCoverScrollTransition() {
  const sheet = letterSheetRef.value
  const cover = coverRef.value
  const image = coverImageRef.value
  const veil = coverVeilRef.value
  if (!sheet || !cover || !image || !veil || prefersReducedMotion()) return

  coverScrollTl?.scrollTrigger?.kill()
  coverScrollTl?.kill()

  gsap.set(image, { scale: 1, autoAlpha: 1, transformOrigin: 'center center' })
  gsap.set(veil, { autoAlpha: 0 })

  coverScrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: cover,
      scroller: sheet,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.85,
    },
  })

  coverScrollTl
    .to(image, { scale: 1.1, autoAlpha: 0.45, ease: 'none' }, 0)
    .to(veil, { autoAlpha: 1, ease: 'none' }, 0)
}

function openModal() {
  if (rsvpConfirmed.value) return
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function onRsvpSuccess() {
  rsvpConfirmed.value = true
}

function scrollToContent() {
  const sheet = letterSheetRef.value
  const quoteSection = quoteSectionRef.value
  const image = coverImageRef.value
  const veil = coverVeilRef.value
  const footer = coverFooterRef.value
  if (!sheet || !quoteSection || isScrolling) return

  if (prefersReducedMotion()) {
    quoteSection.scrollIntoView({ behavior: 'auto', block: 'start' })
    return
  }

  isScrolling = true
  arrowTl?.pause()

  const tl = gsap.timeline({
    onComplete: () => {
      isScrolling = false
      arrowTl?.resume()
    },
  })

  tl.to(footer, { autoAlpha: 0, y: 8, duration: 0.35, ease: 'power2.in' }, 0)

  if (image) {
    tl.to(
      image,
      { scale: 1.12, autoAlpha: 0.35, duration: 1.15, ease: 'power2.inOut', force3D: true },
      0,
    )
  }

  if (veil) {
    tl.to(veil, { autoAlpha: 1, duration: 1.15, ease: 'power2.inOut' }, 0)
  }

  tl.to(
    sheet,
    {
      scrollTo: { y: quoteSection, offsetY: 0 },
      duration: 1.2,
      ease: 'power2.inOut',
    },
    0,
  )

  tl.fromTo(
    quoteSection,
    { autoAlpha: 0, y: 32 },
    { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' },
    0.55,
  )
}

function setupArrowAnimation() {
  const arrow = coverFooterRef.value?.querySelector('.cover-hero__arrow')
  if (!arrow || prefersReducedMotion()) return

  arrowTl?.kill()
  arrowTl = gsap.timeline({ repeat: -1 })
  arrowTl
    .to(arrow, { y: 8, opacity: 1, duration: 0.8, ease: 'sine.inOut' })
    .to(arrow, { y: 0, opacity: 0.6, duration: 0.8, ease: 'sine.inOut' })
}

function setupCoverObserver() {
  const cover = coverRef.value
  const footer = coverFooterRef.value
  const sheet = letterSheetRef.value
  if (!cover || !footer || !sheet) return

  coverObserver = new IntersectionObserver(
    ([entry]) => {
      if (prefersReducedMotion()) return
      gsap.to(footer, {
        autoAlpha: entry.isIntersecting ? 1 : 0,
        duration: 0.35,
        ease: 'power2.out',
      })
    },
    { root: sheet, threshold: 0.85 },
  )
  coverObserver.observe(cover)
}

function setupScrollReveal() {
  const targets = getRevealTargets()
  if (!targets.length || prefersReducedMotion()) {
    gsap.set(targets, { autoAlpha: 1, y: 0 })
    return
  }

  scrollRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            ease: 'power3.out',
          })
          scrollRevealObserver?.unobserve(entry.target)
        }
      })
    },
    { root: letterSheetRef.value, threshold: 0.2 },
  )

  targets.forEach((el) => {
    gsap.set(el, { autoAlpha: 0, y: 28 })
    scrollRevealObserver.observe(el)
  })
}

function onCtaHover(event, enter) {
  if (prefersReducedMotion() || rsvpConfirmed.value) return
  gsap.to(event.currentTarget, {
    scale: enter ? 1.03 : 1,
    boxShadow: enter
      ? '0 4px 20px var(--vn-gold-glow)'
      : '0 2px 12px rgba(6, 18, 41, 0.15)',
    duration: 0.2,
    ease: 'power2.out',
  })
}

onMounted(() => {
  rsvpConfirmed.value = isRsvpConfirmed()
  setupArrowAnimation()
  setupCoverObserver()
})

onUnmounted(() => {
  revealTl?.kill()
  sparkleTl?.kill()
  arrowTl?.kill()
  coverScrollTl?.scrollTrigger?.kill()
  coverScrollTl?.kill()
  coverObserver?.disconnect()
  scrollRevealObserver?.disconnect()
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
})

defineExpose({
  letterMouthRef,
  letterRef,
  letterSheetRef,
  backdropRef,
  prepareContentReveal,
  playContentReveal,
  playSparkles,
  fadeBackdrop,
  presentInvite,
})
</script>

<template>
  <div
    ref="letterMouthRef"
    class="letter-mouth"
    :class="{ open: isOpen, centered: isCentered, expanded: isExpanded }"
  >
    <div ref="backdropRef" class="invite-backdrop" aria-hidden="true" />

    <article
      ref="letterRef"
      class="letter"
      :class="{ open: isOpen, centered: isCentered, expanded: isExpanded }"
      aria-live="polite"
    >
      <div ref="sparklesRef" class="invite-sparkles" aria-hidden="true">
        <span
          v-for="sparkle in sparkles"
          :key="sparkle.id"
          class="invite-sparkle"
          :style="{
            left: sparkle.left,
            top: sparkle.top,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
          }"
        />
      </div>

      <div class="letter-framed">
        <div
          ref="letterSheetRef"
          class="letter-sheet"
          :style="{ '--paper-texture': `url(${paperTexture})` }"
        >
          <img
            class="letter-sheet__swirl letter-sheet__swirl--tl"
            :src="swirlImage"
            alt=""
            aria-hidden="true"
          />
          <img
            class="letter-sheet__swirl letter-sheet__swirl--tr"
            :src="swirlTrImage"
            alt=""
            aria-hidden="true"
          />

          <div ref="contentRef" class="invite-content">
            <!-- 1. Capa -->
            <section ref="coverRef" class="cover-hero" data-scroll-snap-align="start">
              <img
                ref="coverImageRef"
                class="cover-hero__image"
                :src="capaImage"
                alt="Convite Kamilly XV — Noite Estrelada"
              />
              <div ref="coverVeilRef" class="cover-hero__veil" aria-hidden="true" />

              <div ref="coverFooterRef" class="cover-hero__footer">
                <button
                  type="button"
                  class="cover-hero__cta"
                  :disabled="rsvpConfirmed"
                  :aria-disabled="rsvpConfirmed"
                  aria-haspopup="dialog"
                  aria-controls="invite-action-modal"
                  @click="openModal"
                  @mouseenter="onCtaHover($event, true)"
                  @mouseleave="onCtaHover($event, false)"
                >
                  {{ ctaLabel }}
                </button>

                <button
                  type="button"
                  class="cover-hero__scroll"
                  aria-label="Rolar para o convite"
                  @click="scrollToContent"
                >
                  <svg class="cover-hero__arrow" aria-hidden="true" viewBox="0 0 24 24">
                    <path
                      d="M6 9l6 6 6-6"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                </button>
              </div>
            </section>

            <GoldDivider />

            <!-- 2. Citação -->
            <section
              id="quote-section"
              ref="quoteSectionRef"
              class="invite-section invite-section--quote"
              data-scroll-reveal
            >
              <blockquote class="invite-quote">
                <p>"{{ quote.text }}"</p>
                <cite>— {{ quote.author }}</cite>
              </blockquote>
            </section>

            <GoldDivider />

            <!-- 3. Com muito amor -->
            <section class="invite-section" data-scroll-reveal>
              <p class="invite-love">{{ invitation.loveMessage }}</p>
            </section>

            <GoldDivider />

            <!-- 4. Nome -->
            <section class="invite-section" data-scroll-reveal>
              <h2 class="invite-guest-name">{{ invitation.guestName }}</h2>
            </section>

            <GoldDivider />

            <!-- 5. Data -->
            <section class="invite-section invite-section--date" data-scroll-reveal>
              <DateBadge />
            </section>

            <GoldDivider />

            <!-- 6. Countdown -->
            <CountdownBlock />

            <GoldDivider />

            <!-- 7. Localização -->
            <section class="invite-section invite-section--location" data-scroll-reveal>
              <h3 class="invite-section__label">Localização</h3>
              <p class="invite-location__address">{{ location.address }}</p>
              <p v-if="location.note" class="invite-location__note">{{ location.note }}</p>
              <a
                class="invite-location__maps"
                :href="location.mapsUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  />
                </svg>
                {{ location.mapsLabel }}
              </a>
            </section>

            <GoldDivider />

            <!-- 8. Presentes -->
            <section class="invite-section invite-section--gifts" data-scroll-reveal>
              <h3 class="invite-section__label">{{ gifts.title }}</h3>
              <div class="invite-gifts__sizes">
                <p v-for="size in gifts.sizes" :key="size.label">
                  <span class="invite-gifts__size-label">{{ size.label }}</span>
                  <span class="invite-gifts__size-value">{{ size.value }}</span>
                </p>
              </div>
              <ul class="invite-gifts__list">
                <li v-for="(item, index) in gifts.suggestions" :key="index">
                  <template v-if="typeof item === 'string'">{{ item }}</template>
                  <template v-else>
                    {{ item.label }}
                    <ul v-if="item.details" class="invite-gifts__sublist">
                      <li v-for="detail in item.details" :key="detail">{{ detail }}</li>
                    </ul>
                  </template>
                </li>
              </ul>
            </section>

            <GoldDivider />

            <!-- 9. Galeria -->
            <FloatingGallery />
          </div>
        </div>

      </div>
    </article>

    <InviteActionModal
      :open="isModalOpen"
      @close="closeModal"
      @rsvp-success="onRsvpSuccess"
    />

    <AmbientMusic v-if="isCentered" />
  </div>
</template>

<style scoped>
.letter-mouth {
  --exit-room: min(68vh, 480px);
  --tuck: 160px;
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 2;
  width: 90%;
  max-width: 280px;
  height: calc(100% + var(--exit-room));
  transform: translateX(-50%);
  overflow: hidden;
  pointer-events: none;
  visibility: hidden;
  contain: layout paint;
}

.letter-mouth.open {
  visibility: visible;
  pointer-events: auto;
}

.letter {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% - var(--exit-room));
  width: 100%;
  max-width: 100%;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  backface-visibility: hidden;
}

.letter.open {
  pointer-events: auto;
}

.letter.is-exiting {
  will-change: transform;
}

.letter.is-exiting .letter-sheet {
  box-shadow: 0 10px 22px rgba(42, 36, 48, 0.14);
}

.letter.is-exiting .invite-sparkles,
.letter:not(.centered) .invite-sparkles {
  display: none;
}

.letter-mouth.open.centered {
  position: fixed;
  inset: 0;
  z-index: 1000;
  width: 100%;
  max-width: 100%;
  height: 100%;
  height: 100svh;
  transform: none;
  overflow: hidden;
  visibility: visible;
  pointer-events: auto;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0.5rem;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  contain: none;
  overscroll-behavior: none;
}

.invite-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 246, 236, 0.18), transparent 70%),
    linear-gradient(180deg, #0a1c3d 0%, #061229 100%);
}

.letter.open.centered {
  position: relative;
  z-index: 1;
  left: auto;
  right: auto;
  bottom: auto;
  width: min(94vw, 460px);
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  transform: none;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  flex-shrink: 0;
  will-change: auto;
  display: flex;
  flex-direction: column;
}

.letter.open.centered .letter-sheet {
  width: 100%;
  max-width: 100%;
  flex: 1;
  min-height: 0;
}

.invite-sparkles {
  position: absolute;
  inset: -18% -14%;
  z-index: 3;
  pointer-events: none;
  overflow: visible;
}

.invite-sparkle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--vn-star-glow) 0%, var(--vn-gold-soft) 55%, transparent 75%);
  box-shadow: 0 0 8px var(--vn-gold-glow);
  opacity: 0;
}

.letter-framed {
  position: relative;
  width: 100%;
}

.letter-sheet {
  --sheet-height: min(96svh, 900px);
  --cover-height: var(--sheet-height);
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  height: var(--sheet-height);
  max-height: var(--sheet-height);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  text-align: center;
  border-radius: 8px;
  background: var(--vn-gradient-paper);
  box-shadow: 0 28px 56px rgba(6, 18, 41, 0.35);
  scroll-snap-type: y proximity;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.letter-sheet::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: var(--paper-texture);
  background-size: cover;
  opacity: 0.1;
  mix-blend-mode: multiply;
  pointer-events: none;
}

.letter-sheet__swirl {
  position: absolute;
  width: 100px;
  opacity: 0.22;
  mix-blend-mode: screen;
  pointer-events: none;
  z-index: 0;
}

.letter-sheet__swirl--tl {
  top: 2%;
  left: -5%;
}

.letter-sheet__swirl--tr {
  top: 0;
  right: -5%;
  transform: rotate(90deg);
}

.invite-content {
  position: relative;
  z-index: 1;
}

.invite-content > :not(.cover-hero) {
  padding-inline: clamp(1.25rem, 4vw, 2rem);
}

/* Cover hero */
.cover-hero {
  position: relative;
  height: var(--cover-height);
  min-height: var(--cover-height);
  max-height: var(--cover-height);
  width: 100%;
  margin: 0;
  overflow: hidden;
  scroll-snap-align: start;
  flex-shrink: 0;
  contain: layout style paint;
}

.cover-hero__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 32%;
  display: block;
  will-change: transform, opacity;
}

.cover-hero__veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    180deg,
    rgba(6, 18, 41, 0.05) 0%,
    rgba(245, 240, 232, 0.55) 55%,
    var(--vn-cream) 100%
  );
}

.cover-hero__footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
  z-index: 2;
  background: linear-gradient(to top, rgba(6, 18, 41, 0.55) 0%, transparent 100%);
  padding-top: 2.5rem;
  will-change: transform, opacity;
}

.cover-hero__cta {
  min-height: 44px;
  padding: 0.75rem 1.5rem;
  margin-bottom: 0.75rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  color: var(--vn-sky-deep);
  background: var(--vn-gold);
  border-radius: 999px;
  box-shadow: 0 2px 12px rgba(6, 18, 41, 0.15);
}

.cover-hero__cta:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cover-hero__cta:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.cover-hero__scroll {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vn-gold-soft);
  filter: drop-shadow(0 1px 4px rgba(6, 18, 41, 0.3));
  padding: 0.5rem;
}

.cover-hero__arrow {
  width: clamp(24px, 6vw, 32px);
  height: clamp(24px, 6vw, 32px);
}

/* Sections */
.invite-section {
  padding-block: clamp(2rem, 6vw, 3rem);
}

.invite-section__label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--vn-blue-mid);
  margin-bottom: 1rem;
}

.invite-section--quote {
  position: relative;
  z-index: 1;
}

.invite-quote {
  max-width: 36ch;
  margin-inline: auto;
}

.invite-quote p {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.45rem;
  font-style: italic;
  font-weight: 400;
  line-height: 1.55;
  color: var(--vn-ink-soft);
}

.invite-quote cite {
  display: block;
  margin-top: 0.75rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.15rem;
  font-style: normal;
  color: var(--vn-ink-muted);
}

.invite-love {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.35rem;
  font-weight: 400;
  line-height: 1.6;
  color: var(--vn-ink);
  max-width: 36ch;
  margin-inline: auto;
}

.invite-guest-name {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(3.2rem, 14vw, 4.8rem);
  font-weight: 400;
  line-height: 1;
  color: var(--vn-gold);
}

.invite-location__address {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.35rem;
  color: var(--vn-ink);
  margin-bottom: 0.5rem;
}

.invite-location__note {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem;
  color: var(--vn-ink-soft);
  margin-bottom: 1rem;
}

.invite-location__maps {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0.5rem 1.25rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--vn-gold);
  border: 1px solid var(--vn-gold);
  border-radius: 999px;
  text-decoration: none;
  transition: background 0.2s;
}

.invite-location__maps:hover {
  background: rgba(212, 168, 67, 0.1);
}

.invite-location__maps:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.invite-gifts__sizes {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.invite-gifts__sizes p {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.invite-gifts__size-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--vn-blue-mid);
}

.invite-gifts__size-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.25rem;
  color: var(--vn-ink);
}

.invite-gifts__list {
  list-style: none;
  text-align: left;
  max-width: 24ch;
  margin-inline: auto;
}

.invite-gifts__list > li {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.25rem;
  color: var(--vn-ink);
  padding-left: 1.25rem;
  position: relative;
  margin-bottom: 0.4rem;
}

.invite-gifts__list > li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  background: var(--vn-gold);
  border-radius: 50%;
  transform: rotate(45deg);
}

.invite-gifts__sublist {
  list-style: none;
  margin-top: 0.25rem;
  padding-left: 0.75rem;
}

.invite-gifts__sublist li {
  font-size: 1.1rem;
  color: var(--vn-ink-soft);
  margin-bottom: 0.15rem;
}

.invite-gifts__sublist li::before {
  content: '·';
  margin-right: 0.35rem;
  color: var(--vn-gold);
}

@media (max-width: 768px) {
  .letter-mouth:not(.centered) {
    --exit-room: min(72vh, 520px);
    --tuck: 96px;
    width: 97%;
    max-width: 280px;
  }

  .letter-mouth.open.centered.expanded {
    padding: 0;
    display: flex;
    overflow: hidden;
    overscroll-behavior: none;
  }

  .letter.open.centered.expanded {
    width: 100%;
    max-width: 100%;
    height: 100%;
    min-height: 0;
  }

  .letter.open.centered.expanded .invite-sparkles {
    inset: 4% 2%;
  }

  .letter.open.centered.expanded .letter-sheet {
    --sheet-height: 100svh;
    --cover-height: 100svh;
    width: 100%;
    max-width: 100%;
    height: var(--sheet-height);
    max-height: var(--sheet-height);
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .letter.open.centered {
    width: min(92vw, 440px);
  }
}
</style>
