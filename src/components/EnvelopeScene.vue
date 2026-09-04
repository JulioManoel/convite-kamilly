<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import Letter from './Letter.vue'
import sealImage from '../assets/k.webp'

const MOBILE_QUERY = '(max-width: 768px)'
const STAR_COUNT = 48
const PETAL_COUNT = 10
const LETTER_TUCK = 160
const LETTER_TUCK_MOBILE = 96

const phase = ref('idle') // idle | open
const isCentered = ref(false)
const isExpanded = ref(false)
const stars = ref(
  Array.from({ length: STAR_COUNT }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() < 0.18 ? 2.5 : Math.random() < 0.55 ? 1.6 : 1,
    delay: Math.random() * 4,
    duration: 1.6 + Math.random() * 2.8,
    opacity: 0.35 + Math.random() * 0.65,
  })),
)
const petals = ref(
  Array.from({ length: PETAL_COUNT }, (_, index) => {
    const angle = ((index / PETAL_COUNT) * 360 + (index % 3) * 12) * (Math.PI / 180)
    const distance = 70 + (index % 5) * 28
    return {
      id: index,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 40 - (index % 4) * 18,
      rotation: -40 + index * 18,
      scale: 0.55 + (index % 4) * 0.18,
      tone: index % 3,
    }
  }),
)

const sceneRef = ref(null)
const starsRef = ref(null)
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
const glowRef = ref(null)
const petalsRef = ref(null)
const letterComponentRef = ref(null)

const isOpen = computed(() => phase.value === 'open')

const letterMouthRef = computed(() => letterComponentRef.value?.letterMouthRef ?? null)
const letterRef = computed(() => letterComponentRef.value?.letterRef ?? null)
const letterSheetRef = computed(() => letterComponentRef.value?.letterSheetRef ?? null)

let ctx
let idleTl
let starsTl
let openTl

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isMobile() {
  return window.matchMedia(MOBILE_QUERY).matches
}

function getLetterTuck() {
  return isMobile() ? LETTER_TUCK_MOBILE : LETTER_TUCK
}

function getLetterExitDistance() {
  const letter = letterRef.value
  const tuck = getLetterTuck()
  if (!letter) return 280 + tuck
  const height = letter.offsetHeight || letter.getBoundingClientRect().height || 280
  return height + tuck
}

function startStarMotion() {
  starsTl?.kill()
  starsTl = null

  const nodes = starsRef.value?.querySelectorAll('.star')
  if (!nodes?.length || prefersReducedMotion()) return

  starsTl = gsap.timeline()
  nodes.forEach((star, index) => {
    const meta = stars.value[index]
    if (!meta) return

    gsap.set(star, { opacity: meta.opacity * 0.35 })
    starsTl.to(
      star,
      {
        opacity: meta.opacity,
        duration: meta.duration,
        delay: meta.delay,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      },
      0,
    )
  })
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
  if (sealRef.value) {
    gsap.set(sealRef.value, {
      xPercent: -50,
      yPercent: -50,
      z: 48,
      scale: 1,
      rotation: 0,
    })
  }
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

function waitFrames(count = 2) {
  return new Promise((resolve) => {
    const step = (left) => {
      if (left <= 0) resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

async function animateSheetFromRect(first, { duration = 1.05, ease = 'expo.inOut' } = {}) {
  const sheet = letterSheetRef.value
  if (!sheet || prefersReducedMotion()) return

  await nextTick()
  await waitFrames(2)

  const last = sheet.getBoundingClientRect()
  if (!last.width || !last.height) return

  const dx = first.left - last.left
  const dy = first.top - last.top
  const sx = first.width / last.width
  const sy = first.height / last.height

  await gsap.fromTo(
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
      duration,
      ease,
      clearProps: 'transform',
    },
  )
}

function lockPageOverflow() {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
}

async function centerInvite({ present = false, expand = false } = {}) {
  const sheet = letterSheetRef.value
  const first = sheet?.getBoundingClientRect()
  const mobile = isMobile()

  if (letterRef.value) {
    gsap.set(letterRef.value, { clearProps: 'transform,opacity,visibility' })
  }

  if (present) {
    letterComponentRef.value?.prepareContentReveal?.()
  }

  isCentered.value = true
  if (expand) isExpanded.value = true
  lockPageOverflow()

  if (present) {
    gsap.delayedCall(expand ? 0.28 : 0.24, () => {
      letterComponentRef.value?.presentInvite?.()
    })
  }

  if (first) {
    await animateSheetFromRect(first, {
      duration: mobile ? 0.95 : expand ? 1.25 : 1.15,
      ease: mobile ? 'power3.inOut' : expand ? 'expo.inOut' : 'power4.inOut',
    })
  } else if (present) {
    letterComponentRef.value?.presentInvite?.()
  }
}

async function presentAndExpand() {
  await centerInvite({
    present: true,
    expand: isMobile(),
  })
}

function burstPetals() {
  const nodes = petalsRef.value?.querySelectorAll('.petal')
  if (!nodes?.length || prefersReducedMotion()) return

  const count = isMobile() ? Math.min(6, nodes.length) : nodes.length
  const active = Array.from(nodes).slice(0, count)

  gsap.set(nodes, { autoAlpha: 0 })
  gsap.set(active, {
    x: 0,
    y: 0,
    scale: 0.25,
    rotation: 0,
    autoAlpha: 1,
    force3D: true,
  })

  gsap.to(active, {
    x: (index) => petals.value[index]?.dx ?? 0,
    y: (index) => petals.value[index]?.dy ?? -40,
    rotation: (index) => petals.value[index]?.rotation ?? 0,
    scale: (index) => petals.value[index]?.scale ?? 0.7,
    autoAlpha: 0,
    duration: isMobile() ? 0.75 : 0.95,
    ease: 'power2.out',
    stagger: 0.012,
    force3D: true,
  })
}

function snapOpenInstant() {
  killIdleMotion()
  starsTl?.kill()

  gsap.set(introRef.value, { autoAlpha: 0, y: -12 })
  gsap.set(starsRef.value, { autoAlpha: 0 })
  gsap.set(glowRef.value, { autoAlpha: 0 })
  gsap.set(flapRef.value, { rotationX: 180, transformOrigin: '50% 0%' })
  gsap.set(flapLiningRef.value, { autoAlpha: 1 })
  gsap.set(sealRef.value, { autoAlpha: 0 })
  gsap.set(letterMouthRef.value, { autoAlpha: 1 })
  gsap.set(letterRef.value, { autoAlpha: 1, clearProps: 'transform' })
  gsap.set(getShellParts(), { autoAlpha: 0 })

  presentAndExpand()
}

function playOpenSequence() {
  killIdleMotion()
  openTl?.kill()
  starsTl?.kill()

  const run = () => {
    const mobile = isMobile()
    const exitY = getLetterExitDistance()
    const letterEl = letterRef.value

    gsap.set(sealRef.value, {
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      z: 48,
      scale: 1,
      rotation: 0,
      autoAlpha: 1,
    })
    gsap.set(flapRef.value, {
      rotationX: 0,
      transformOrigin: '50% 0%',
      transformPerspective: mobile ? 900 : 1400,
      force3D: true,
    })
    gsap.set(flapLiningRef.value, { autoAlpha: 0 })
    letterEl?.classList.add('is-exiting')
    gsap.set(letterEl, {
      autoAlpha: 0,
      y: exitY,
      x: 0,
      force3D: true,
    })
    gsap.set(letterMouthRef.value, { autoAlpha: 1 })
    gsap.set(glowRef.value, {
      autoAlpha: 0,
      scale: 0.55,
      xPercent: -50,
      yPercent: -40,
      force3D: true,
    })
    gsap.set(petalsRef.value?.querySelectorAll('.petal') ?? [], {
      autoAlpha: 0,
      x: 0,
      y: 0,
      scale: 0.2,
      rotation: 0,
    })

    openTl = gsap.timeline({
      defaults: { ease: 'power2.out', force3D: true },
      onComplete: () => {
        gsap.set(glowRef.value, { autoAlpha: 0 })
        letterEl?.classList.remove('is-exiting')
      },
    })

    const riseAt = mobile ? 0.55 : 0.68
    const riseDuration = mobile ? 1.15 : 1.45
    const shellAt = riseAt + riseDuration * 0.62
    const presentAt = riseAt + riseDuration * 0.92

    openTl
      .addLabel('open', 0)
      .addLabel('flap', mobile ? 0.04 : 0.08)
      .addLabel('rise', riseAt)
      .addLabel('shellOut', shellAt)
      .addLabel('present', presentAt)

      .to(introRef.value, { autoAlpha: 0, y: -14, duration: 0.4, ease: 'power2.out' }, 'open')
      .to(starsRef.value, { autoAlpha: 0, duration: mobile ? 0.45 : 0.85, ease: 'power1.out' }, 'open')

      .to(
        sealRef.value,
        {
          keyframes: [
            {
              yPercent: -58,
              scale: 1.12,
              rotation: -8,
              duration: 0.18,
              ease: 'power2.out',
            },
            {
              xPercent: -6,
              yPercent: 10,
              y: 72,
              scale: 0.64,
              rotation: 28,
              autoAlpha: 0,
              duration: 0.34,
              ease: 'power3.in',
            },
          ],
        },
        'open',
      )
      .add(burstPetals, 'open+=0.12')

      .fromTo(
        glowRef.value,
        { autoAlpha: 0, scale: 0.5 },
        { autoAlpha: mobile ? 0.7 : 1, scale: 1.1, duration: 0.55, ease: 'power2.out' },
        'open+=0.1',
      )

      .to(
        flapRef.value,
        { rotationX: 180, duration: mobile ? 0.62 : 0.78, ease: 'power2.inOut' },
        'flap',
      )
      .to(
        flapLiningRef.value,
        { autoAlpha: 1, duration: 0.22, ease: 'none' },
        'flap+=0.22',
      )

      .to(
        letterEl,
        {
          autoAlpha: 1,
          y: 0,
          duration: riseDuration,
          ease: 'power3.out',
          force3D: true,
        },
        'rise',
      )

      .to(
        getShellParts(),
        { autoAlpha: 0, duration: mobile ? 0.5 : 0.7, ease: 'power2.out' },
        'shellOut',
      )
      .to(
        glowRef.value,
        { autoAlpha: 0, scale: 1.35, duration: 0.45, ease: 'power1.out' },
        'shellOut',
      )

      .add(() => {
        letterEl?.classList.remove('is-exiting')
        presentAndExpand()
      }, 'present')
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
    gsap.set(sealRef.value, { xPercent: -50, yPercent: -50, z: 48 })
    gsap.set(flapLiningRef.value, { autoAlpha: 0 })
    gsap.set(glowRef.value, { autoAlpha: 0, xPercent: -50, yPercent: -40 })
    gsap.set(introHintRef.value, { opacity: 0.55 })
    startStarMotion()
    startIdleMotion()
  }, sceneRef)

  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  openTl?.kill()
  idleTl?.kill()
  starsTl?.kill()
  ctx?.revert()
})
</script>

<template>
  <main
    ref="sceneRef"
    class="scene"
    :class="{ 'is-open': isOpen, 'is-centered': isCentered, 'is-expanded': isExpanded }"
  >
    <div ref="starsRef" class="starfield" aria-hidden="true">
      <span
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="{
          left: star.left,
          top: star.top,
          width: `${star.size}px`,
          height: `${star.size}px`,
        }"
      />
    </div>

    <header ref="introRef" class="intro" :class="{ 'is-hidden': isOpen }">
      <p class="intro-label">Para você de</p>
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

          <div ref="glowRef" class="mouth-glow" aria-hidden="true" />

          <div ref="pocketRef" class="front pocket" aria-hidden="true" />
          <div ref="flapRef" class="front flap" aria-hidden="true">
            <div ref="flapLiningRef" class="flap-lining" />
          </div>

          <div ref="sealRef" class="seal" aria-hidden="true">
            <span ref="sealRingRef" class="seal-ring" />
            <img
              class="seal-image"
              :src="sealImage"
              alt="Selo Kamilly"
              width="54"
              height="54"
              draggable="false"
            />
          </div>

          <div ref="petalsRef" class="petal-burst" aria-hidden="true">
            <span
              v-for="petal in petals"
              :key="petal.id"
              class="petal"
              :class="`tone-${petal.tone}`"
            />
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
  background:
    radial-gradient(ellipse 120% 80% at 50% -10%, #1a3a6b 0%, transparent 55%),
    radial-gradient(ellipse 90% 60% at 80% 100%, #0c1a38 0%, transparent 50%),
    linear-gradient(180deg, #061229 0%, #0a1c3d 42%, #081428 100%);
}

.starfield {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.star {
  position: absolute;
  border-radius: 50%;
  background: #fff8e7;
  box-shadow: 0 0 6px rgba(255, 248, 231, 0.85);
  will-change: opacity;
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
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--gold-soft);
}

.brand {
  font-family: 'Parisienne', cursive;
  font-size: clamp(3.8rem, 12vw, 5.8rem);
  font-weight: 400;
  line-height: 1;
  color: var(--gold);
  margin-top: 0.15rem;
  text-shadow: 0 2px 18px rgba(201, 164, 108, 0.35);
}

.intro-hint {
  margin-top: 0.65rem;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 0.08em;
  color: var(--gold-soft);
}

.stage {
  position: relative;
  width: min(100%, 440px);
  height: min(78vh, 620px);
  display: grid;
  place-items: center;
  perspective: 1200px;
  z-index: 1;
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
  box-shadow: 0 14px 36px rgba(6, 18, 41, 0.45);
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
  background: radial-gradient(ellipse, rgba(4, 10, 24, 0.55), transparent 70%);
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

.mouth-glow {
  position: absolute;
  left: 50%;
  top: 18%;
  z-index: 2;
  width: 140%;
  height: 110%;
  border-radius: 50%;
  pointer-events: none;
  background:
    radial-gradient(circle, rgba(255, 236, 206, 0.5) 0%, rgba(201, 164, 108, 0.22) 38%, transparent 68%);
  will-change: transform, opacity;
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
  backface-visibility: hidden;
  will-change: transform;
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
    0 6px 14px rgba(6, 18, 41, 0.35),
    inset 0 2px 4px rgba(255, 255, 255, 0.25),
    inset 0 -3px 6px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  overflow: visible;
}

.seal::before {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  border: 1px solid rgba(226, 201, 154, 0.55);
  z-index: 1;
  pointer-events: none;
}

.seal-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px dashed rgba(201, 164, 108, 0.45);
  pointer-events: none;
}

.seal-image {
  position: relative;
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

.envelope.open .seal {
  z-index: 4;
}

.petal-burst {
  position: absolute;
  top: 48%;
  left: 50%;
  z-index: 9;
  width: 0;
  height: 0;
  pointer-events: none;
}

.petal {
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
  height: 14px;
  margin: -7px 0 0 -5px;
  border-radius: 60% 60% 55% 55% / 70% 70% 40% 40%;
  opacity: 0;
  will-change: transform, opacity;
  background:
    radial-gradient(circle at 35% 30%, #f0c4cb, var(--blush) 55%, var(--blush-deep) 100%);
  box-shadow: 0 0 6px rgba(196, 122, 136, 0.35);
}

.petal.tone-1 {
  width: 7px;
  height: 11px;
  background:
    radial-gradient(circle at 40% 30%, #ffe8bf, var(--gold-soft) 60%, var(--gold) 100%);
}

.petal.tone-2 {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff8e7;
  box-shadow: 0 0 8px rgba(255, 248, 231, 0.8);
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
