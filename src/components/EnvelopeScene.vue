<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import Letter from './Letter.vue'

const LETTER_EXIT_END = 2.2
const OPEN_SEQUENCE_END = 3.2
const LETTER_TUCK = 220
const MOBILE_QUERY = '(max-width: 768px)'

const phase = ref('idle') // idle | open
const isCentered = ref(false)
const isExpanded = ref(false)

const sceneRef = ref(null)
const introRef = ref(null)
const introHintRef = ref(null)
const envelopeStageRef = ref(null)
const envelopeRef = ref(null)
const envelopeShadowRef = ref(null)
const envelopeBodyRef = ref(null)
const pocketRef = ref(null)
const flapRef = ref(null)
const flapLiningRef = ref(null)
const sealRef = ref(null)
const sealRingRef = ref(null)
const letterComponentRef = ref(null)

const isOpen = computed(() => phase.value === 'open')

const letterMouthRef = computed(() => letterComponentRef.value?.letterMouthRef ?? null)
const letterRef = computed(() => letterComponentRef.value?.letterRef ?? null)
const letterSheetRef = computed(() => letterComponentRef.value?.letterSheetRef ?? null)

let ctx
let idleTl
let openTl

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getShellParts() {
  return [
    envelopeShadowRef.value,
    envelopeBodyRef.value,
    pocketRef.value,
    flapRef.value,
  ].filter(Boolean)
}

function killIdleMotion() {
  idleTl?.kill()
  idleTl = null
  if (envelopeStageRef.value) gsap.set(envelopeStageRef.value, { y: 0 })
  if (envelopeShadowRef.value) gsap.set(envelopeShadowRef.value, { clearProps: 'scaleX,opacity' })
}

function startIdleMotion() {
  if (prefersReducedMotion()) return

  killIdleMotion()

  idleTl = gsap.timeline({ defaults: { ease: 'power1.inOut' } })

  idleTl
    .to(
      envelopeStageRef.value,
      { y: -10, duration: 2.25, repeat: -1, yoyo: true },
      0,
    )
    .to(
      envelopeShadowRef.value,
      { scaleX: 0.92, opacity: 0.55, duration: 2.25, repeat: -1, yoyo: true },
      0,
    )
    .to(
      introHintRef.value,
      { opacity: 1, duration: 1.2, repeat: -1, yoyo: true },
      0,
    )
    .to(
      sealRingRef.value,
      { rotation: 360, duration: 18, ease: 'none', repeat: -1 },
      0,
    )
}

async function animateSheetFromRect(first) {
  const sheet = letterSheetRef.value
  if (!sheet || prefersReducedMotion()) return

  await nextTick()
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  })

  const last = sheet.getBoundingClientRect()
  if (!last.width || !last.height) return

  const dx = first.left - last.left
  const dy = first.top - last.top
  const sx = first.width / last.width
  const sy = first.height / last.height

  gsap.fromTo(
    sheet,
    {
      x: dx,
      y: dy,
      scaleX: sx,
      scaleY: sy,
      transformOrigin: '0% 0%',
    },
    {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.85,
      ease: 'power3.out',
      clearProps: 'transform',
    },
  )
}

function lockPageOverflow() {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
}

async function centerInvite() {
  const sheet = letterSheetRef.value
  const first = sheet?.getBoundingClientRect()

  if (letterRef.value) {
    gsap.set(letterRef.value, { clearProps: 'transform,opacity,visibility' })
  }

  isCentered.value = true
  lockPageOverflow()
  if (first) await animateSheetFromRect(first)
}

async function expandInviteFullscreen() {
  const sheet = letterSheetRef.value
  const first = sheet?.getBoundingClientRect()
  isExpanded.value = true
  lockPageOverflow()
  if (first) await animateSheetFromRect(first)
}

function snapOpenInstant() {
  killIdleMotion()

  gsap.set(introRef.value, { autoAlpha: 0, y: -12 })
  gsap.set(flapRef.value, { rotationX: 180, transformOrigin: '50% 0%' })
  gsap.set(flapLiningRef.value, { autoAlpha: 1 })
  gsap.set(sealRef.value, { autoAlpha: 0 })
  gsap.set(letterMouthRef.value, { autoAlpha: 1 })
  gsap.set(letterRef.value, { autoAlpha: 1, clearProps: 'transform' })
  gsap.set(getShellParts(), { autoAlpha: 0 })

  centerInvite().then(() => {
    if (window.matchMedia(MOBILE_QUERY).matches) expandInviteFullscreen()
  })
}

function playOpenSequence() {
  killIdleMotion()
  openTl?.kill()

  const run = () => {
    gsap.set(sealRef.value, {
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      autoAlpha: 1,
    })
    gsap.set(flapRef.value, {
      rotationX: 0,
      transformOrigin: '50% 0%',
      transformPerspective: 1200,
    })
    gsap.set(flapLiningRef.value, { autoAlpha: 0 })
    gsap.set(letterRef.value, { autoAlpha: 0, yPercent: 100, y: LETTER_TUCK })
    gsap.set(letterMouthRef.value, { autoAlpha: 1 })

    openTl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    openTl
      .addLabel('open', 0)
      .to(introRef.value, { autoAlpha: 0, y: -12, duration: 0.45, ease: 'power1.out' }, 'open')
      .to(
        flapRef.value,
        { rotationX: 180, duration: 0.55, ease: 'power2.inOut' },
        'open',
      )
      .to(flapLiningRef.value, { autoAlpha: 1, duration: 0.2, ease: 'power1.out' }, 'open+=0.2')
      .to(
        sealRef.value,
        {
          keyframes: [
            {
              yPercent: -58,
              scale: 1.14,
              rotation: -8,
              duration: 0.1925,
              ease: 'power2.out',
            },
            {
              xPercent: -8,
              yPercent: 0,
              y: 78,
              scale: 0.68,
              rotation: 28,
              autoAlpha: 0,
              duration: 0.3575,
              ease: 'power3.out',
            },
          ],
        },
        'open',
      )
      .to(
        letterRef.value,
        {
          autoAlpha: 1,
          yPercent: 0,
          y: 0,
          duration: 1.6,
          ease: 'power3.out',
        },
        'open+=0.55',
      )
      .to(
        getShellParts(),
        { autoAlpha: 0, duration: 0.65, ease: 'power1.inOut' },
        'open+=2.25',
      )
      .add(() => {
        centerInvite()
      }, `open+=${LETTER_EXIT_END}`)
      .add(() => {
        if (window.matchMedia(MOBILE_QUERY).matches) {
          expandInviteFullscreen()
        }
      }, `open+=${OPEN_SEQUENCE_END}`)
  }

  if (ctx) ctx.add(run)
  else run()
}

function openEnvelope() {
  if (phase.value !== 'idle') return
  phase.value = 'open'

  if (prefersReducedMotion()) {
    snapOpenInstant()
    return
  }

  playOpenSequence()
}

function onKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openEnvelope()
  }
}

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.set(introRef.value, { xPercent: -50 })
    gsap.set(sealRef.value, { xPercent: -50, yPercent: -50 })
    gsap.set(flapLiningRef.value, { autoAlpha: 0 })
    gsap.set(introHintRef.value, { opacity: 0.55 })
    startIdleMotion()
  }, sceneRef)

  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  openTl?.kill()
  idleTl?.kill()
  ctx?.revert()
})
</script>

<template>
  <main
    ref="sceneRef"
    class="scene"
    :class="{ 'is-open': isOpen, 'is-centered': isCentered, 'is-expanded': isExpanded }"
  >
    <header ref="introRef" class="intro" :class="{ 'is-hidden': isOpen }">
      <p class="intro-label">Para você</p>
      <h1 class="brand">Kamilly</h1>
      <p ref="introHintRef" class="intro-hint">Toque na carta para abrir</p>
    </header>

    <div class="stage">
      <div ref="envelopeStageRef" class="envelope-stage" :class="{ opened: isOpen }">
        <div
          ref="envelopeRef"
          class="envelope"
          role="button"
          tabindex="0"
          :class="{ open: isOpen, close: !isOpen }"
          :aria-label="isOpen ? 'Carta aberta' : 'Abrir carta'"
          :aria-disabled="isOpen ? 'true' : undefined"
          @click="openEnvelope"
        >
          <div ref="envelopeShadowRef" class="envelope-shadow" />
          <div ref="envelopeBodyRef" class="envelope-body" />

          <div ref="pocketRef" class="front pocket" aria-hidden="true" />
          <div ref="flapRef" class="front flap" aria-hidden="true">
            <div ref="flapLiningRef" class="flap-lining" />
          </div>

          <div ref="sealRef" class="seal" aria-hidden="true">
            <span ref="sealRingRef" class="seal-ring" />
            <span class="seal-core">K</span>
          </div>

          <Teleport to="body" :disabled="!isCentered">
            <Letter
              ref="letterComponentRef"
              :is-open="isOpen"
              :is-centered="isCentered"
              :is-expanded="isExpanded"
            />
          </Teleport>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.scene {
  position: relative;
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 2.5rem 1.25rem 3rem;
  overflow: hidden;
}

.intro {
  position: absolute;
  top: clamp(1.5rem, 5vh, 3rem);
  left: 50%;
  text-align: center;
  z-index: 2;
}

.intro.is-hidden {
  pointer-events: none;
}

.intro-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.brand {
  font-family: 'Great Vibes', cursive;
  font-size: clamp(3.2rem, 10vw, 5rem);
  font-weight: 400;
  line-height: 1;
  color: var(--ink);
  margin-top: 0.15rem;
}

.intro-hint {
  margin-top: 0.65rem;
  font-size: 0.85rem;
  font-weight: 300;
  letter-spacing: 0.08em;
  color: var(--ink-soft);
}

.stage {
  position: relative;
  width: min(100%, 440px);
  height: min(78vh, 620px);
  display: grid;
  place-items: center;
  perspective: 1200px;
}

.envelope-stage {
  position: relative;
  width: min(88vw, 300px);
  height: 200px;
  z-index: 1;
}

.envelope-stage.opened {
  pointer-events: none;
}

.envelope {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  background: linear-gradient(160deg, #758588 0%, var(--envelope-dark) 100%);
  box-shadow: 0 14px 36px rgba(42, 36, 48, 0.22);
  transform-style: preserve-3d;
  cursor: pointer;
  overflow: visible;
}

.envelope.open {
  cursor: default;
  background: transparent;
  box-shadow: none;
}

.envelope:not(.open):hover {
  transform: translateY(-4px);
}

.envelope:not(.open):focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 10px;
}

.envelope-shadow {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: -18px;
  height: 28px;
  border-radius: 50%;
  background: radial-gradient(ellipse, var(--shadow), transparent 70%);
  filter: blur(2px);
  opacity: 0.85;
  pointer-events: none;
}

.envelope-body {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  background:
    linear-gradient(145deg, #9aa9ad 0%, var(--envelope) 45%, var(--envelope-dark) 100%);
  pointer-events: none;
}

.front {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.pocket {
  z-index: 3;
  clip-path: polygon(0 45%, 50% 100%, 100% 45%, 100% 100%, 0 100%);
  background:
    linear-gradient(180deg, #7f9094 0%, var(--envelope-dark) 55%, #5f6d71 100%);
  box-shadow: inset 0 10px 16px rgba(42, 36, 48, 0.16);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.flap {
  z-index: 5;
  clip-path: polygon(0 0, 100% 0, 50% 58%);
  background:
    linear-gradient(180deg, #a8b6ba 0%, #87979b 70%, #758588 100%);
  transform-origin: top center;
  transform-style: preserve-3d;
  transform: rotateX(0deg);
}

.envelope.open .flap {
  z-index: 1;
}

.flap-lining {
  position: absolute;
  inset: 0;
  clip-path: polygon(0 0, 100% 0, 50% 58%);
  background: linear-gradient(180deg, var(--envelope-lining) 0%, #c48e97 100%);
  opacity: 0;
  backface-visibility: hidden;
  transform: rotateX(180deg);
}

.scene.is-centered .stage {
  perspective: none;
}

.scene.is-centered .envelope {
  transform: none;
  transform-style: flat;
}

.seal {
  position: absolute;
  top: 48%;
  left: 50%;
  z-index: 8;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 35% 30%, #c97886, var(--rose-seal) 55%, #8a4452 100%);
  box-shadow:
    0 6px 14px rgba(42, 36, 48, 0.28),
    inset 0 2px 4px rgba(255, 255, 255, 0.25),
    inset 0 -3px 6px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.seal::before {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  border: 1px solid rgba(226, 201, 154, 0.55);
}

.seal-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px dashed rgba(201, 164, 108, 0.45);
}

.seal-core {
  position: relative;
  font-family: 'Great Vibes', cursive;
  font-size: 1.45rem;
  color: var(--gold-soft);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);
}

.envelope.open .seal {
  z-index: 4;
}

@media (max-width: 768px) {
  .scene {
    min-height: 100%;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding:
      1.5rem
      1.25rem
      max(12.5rem, calc(env(safe-area-inset-bottom, 0px) + 10.25rem));
  }

  .intro {
    top: clamp(8.5rem, 28vh, 12rem);
  }

  .stage {
    width: 100%;
    height: auto;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    flex: 0 0 auto;
  }

  .envelope-stage {
    width: min(86vw, 280px);
    height: 186px;
  }

  .scene.is-expanded {
    overflow: hidden;
    padding: 0;
  }
}
</style>
