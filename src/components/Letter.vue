<script setup>
import { onUnmounted, ref } from 'vue'
import gsap from 'gsap'

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

const sparkles = ref(
  Array.from({ length: SPARKLE_COUNT }, (_, index) => {
    const angle = (index / SPARKLE_COUNT) * Math.PI * 2
    const radius = 38 + (index % 4) * 10
    return {
      id: index,
      left: `${50 + Math.cos(angle) * radius * 0.42}%`,
      top: `${48 + Math.sin(angle) * radius * 0.55}%`,
      size: index % 5 === 0 ? 3.2 : index % 2 === 0 ? 2.1 : 1.3,
      delay: (index % 7) * 0.08,
    }
  }),
)

let revealTl
let sparkleTl

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getRevealTargets() {
  return contentRef.value?.querySelectorAll('[data-reveal]') ?? []
}

function prepareContentReveal() {
  revealTl?.kill()
  const targets = getRevealTargets()
  if (!targets.length) return
  gsap.set(targets, { autoAlpha: 0, y: 22 })
}

function playContentReveal() {
  revealTl?.kill()
  const targets = getRevealTargets()
  if (!targets.length) return

  if (prefersReducedMotion()) {
    gsap.set(targets, { autoAlpha: 1, y: 0, clearProps: 'transform' })
    return
  }

  gsap.set(targets, { autoAlpha: 0, y: 18 })
  revealTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  revealTl.to(targets, {
    autoAlpha: 1,
    y: 0,
    duration: 0.72,
    stagger: 0.1,
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
        stagger: {
          each: 0.08,
          from: 'random',
        },
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
  playContentReveal()
  playSparkles()
}

onUnmounted(() => {
  revealTl?.kill()
  sparkleTl?.kill()
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
    <div
      ref="backdropRef"
      class="invite-backdrop"
      aria-hidden="true"
    />

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

      <div ref="letterSheetRef" class="letter-sheet">
        <div class="invitation-glow" aria-hidden="true" />
        <div ref="contentRef" class="invite-content">
          <p class="invite-eyebrow" data-reveal>Você está convidado</p>
          <h2 class="invite-name" data-reveal>Kamilly</h2>
          <div class="invite-ornament" data-reveal aria-hidden="true">
            <span />
            <i />
            <span />
          </div>
          <p class="invite-message" data-reveal>
            Com muito carinho, convido você para celebrar este momento especial ao meu lado.
          </p>
          <div class="invite-details" data-reveal>
            <p><strong>Data</strong><span>Sábado, 15 de agosto</span></p>
            <p><strong>Horário</strong><span>16h00</span></p>
            <p><strong>Local</strong><span>Espaço a confirmar</span></p>
          </div>
          <p class="invite-closing" data-reveal>Espero por você</p>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
/* Letter rises behind the pocket, filling the full V opening */
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
  /* Rest line = envelope top; tucked fully below until exit starts */
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

.letter.is-exiting .invitation-glow,
.letter:not(.centered) .invite-sparkles {
  display: none;
}

/* After exit: invite card locked to the viewport center */
.letter-mouth.open.centered {
  position: fixed;
  inset: 0;
  z-index: 1000;
  width: 100%;
  max-width: 100%;
  height: 100%;
  height: 100dvh;
  transform: none;
  overflow-x: hidden;
  overflow-y: auto;
  visibility: visible;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  contain: none;
}

.invite-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  background:
    radial-gradient(ellipse 70% 55% at 50% 42%, rgba(255, 246, 236, 0.16), transparent 68%),
    radial-gradient(ellipse 100% 80% at 50% 100%, rgba(6, 18, 41, 0.55), transparent 60%),
    linear-gradient(180deg, rgba(6, 18, 41, 0.35) 0%, rgba(8, 20, 40, 0.72) 100%);
}

.letter.open.centered {
  position: relative;
  z-index: 1;
  left: auto;
  right: auto;
  bottom: auto;
  width: min(90vw, 320px);
  max-width: 100%;
  min-height: auto;
  transform: none;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  flex-shrink: 0;
  will-change: auto;
}

.letter.open.centered .letter-sheet {
  width: 100%;
  max-width: 100%;
  will-change: transform;
}

.invite-sparkles {
  position: absolute;
  inset: -18% -14%;
  z-index: 2;
  pointer-events: none;
  overflow: visible;
}

.invite-sparkle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #fff8e7 0%, var(--gold-soft) 55%, transparent 75%);
  box-shadow: 0 0 8px rgba(226, 201, 154, 0.75);
  opacity: 0;
}

.letter-sheet {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  padding: 2rem 1.5rem 1.8rem;
  text-align: center;
  border-radius: 6px;
  overflow: hidden;
  background:
    linear-gradient(165deg, #fffaf7 0%, var(--paper) 48%, #f0e8e2 100%);
  border: 1px solid rgba(201, 164, 108, 0.28);
  box-shadow:
    0 28px 56px rgba(42, 36, 48, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}

.invitation-glow {
  position: absolute;
  inset: 15% -10% auto;
  height: 55%;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255, 248, 242, 0.7), transparent 65%);
  pointer-events: none;
}

.invite-content {
  position: relative;
}

.invite-eyebrow {
  position: relative;
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 400;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.invite-name {
  position: relative;
  margin-top: 0.35rem;
  font-family: 'Great Vibes', cursive;
  font-size: clamp(2.6rem, 10vw, 3.8rem);
  font-weight: 400;
  line-height: 1;
  color: var(--ink);
}

.invite-ornament {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  margin: 0.9rem 0 1rem;
}

.invite-ornament span {
  display: block;
  width: 48px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

.invite-ornament i {
  width: 7px;
  height: 7px;
  border: 1px solid var(--gold);
  transform: rotate(45deg);
}

.invite-message {
  position: relative;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.12rem;
  font-weight: 400;
  line-height: 1.55;
  color: var(--ink-soft);
  max-width: 28ch;
  margin-inline: auto;
}

.invite-details {
  position: relative;
  margin-top: 1.25rem;
  display: grid;
  gap: 0.65rem;
}

.invite-details p {
  display: grid;
  gap: 0.15rem;
}

.invite-details strong {
  font-family: 'Outfit', sans-serif;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--blush-deep);
}

.invite-details span {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem;
  color: var(--ink);
}

.invite-closing {
  position: relative;
  margin-top: 1.35rem;
  font-family: 'Great Vibes', cursive;
  font-size: 1.45rem;
  color: var(--rose-seal);
}

@media (max-width: 768px) {
  .letter-mouth:not(.centered) {
    --exit-room: min(72vh, 520px);
    --tuck: 96px;
    width: 97%;
    max-width: 280px;
  }

  .letter-sheet {
    padding: 1.7rem 1.2rem 1.5rem;
  }

  .invitation-glow {
    opacity: 0.55;
  }

  /* Fullscreen invite after centered settle */
  .letter-mouth.open.centered.expanded {
    padding: 0;
    display: block;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: none;
  }

  .letter.open.centered.expanded {
    width: 100%;
    max-width: 100%;
    min-height: 100%;
    min-height: 100dvh;
  }

  .letter.open.centered.expanded .invite-sparkles {
    inset: 4% 2%;
  }

  .letter.open.centered.expanded .letter-sheet {
    width: 100%;
    max-width: 100%;
    min-height: 100%;
    min-height: 100dvh;
    border-radius: 0;
    border: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding:
      max(2.2rem, env(safe-area-inset-top, 0px))
      max(1.35rem, env(safe-area-inset-right, 0px))
      max(2.2rem, env(safe-area-inset-bottom, 0px))
      max(1.35rem, env(safe-area-inset-left, 0px));
    box-shadow: none;
    will-change: auto;
  }

  .letter.open.centered.expanded .invite-backdrop {
    background:
      radial-gradient(ellipse 90% 70% at 50% 30%, rgba(255, 244, 236, 0.22), transparent 70%),
      linear-gradient(180deg, rgba(247, 242, 238, 0.08), rgba(247, 242, 238, 0));
  }
}
</style>
