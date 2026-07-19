<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const OPEN_SEQUENCE_MS = 3200
const MOBILE_QUERY = '(max-width: 768px)'

const phase = ref('idle') // idle | open
const isExpanded = ref(false)
const letterSheetRef = ref(null)

const isOpen = computed(() => phase.value === 'open')

let expandTimer = 0

function clearExpandTimer() {
  if (expandTimer) {
    window.clearTimeout(expandTimer)
    expandTimer = 0
  }
}

async function expandInviteFullscreen() {
  const sheet = letterSheetRef.value
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!sheet || reduceMotion) {
    isExpanded.value = true
    return
  }

  const first = sheet.getBoundingClientRect()
  isExpanded.value = true
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

  sheet.style.transformOrigin = 'top left'
  sheet.style.transition = 'none'
  sheet.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`

  // Force reflow so the browser registers the starting transform
  void sheet.offsetWidth

  sheet.style.transition = 'transform 0.95s cubic-bezier(0.22, 1, 0.36, 1)'
  sheet.style.transform = 'translate(0px, 0px) scale(1, 1)'

  const clearInline = () => {
    sheet.style.transition = ''
    sheet.style.transform = ''
    sheet.style.transformOrigin = ''
    sheet.removeEventListener('transitionend', onEnd)
  }

  const onEnd = (event) => {
    if (event.propertyName !== 'transform') return
    clearInline()
  }

  sheet.addEventListener('transitionend', onEnd)
}

function scheduleMobileExpand() {
  clearExpandTimer()
  if (!window.matchMedia(MOBILE_QUERY).matches) return

  expandTimer = window.setTimeout(() => {
    expandInviteFullscreen()
  }, OPEN_SEQUENCE_MS)
}

function openEnvelope() {
  if (phase.value !== 'idle') return
  phase.value = 'open'
  scheduleMobileExpand()
}

function onKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openEnvelope()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearExpandTimer()
})
</script>

<template>
  <main class="scene" :class="{ 'is-open': isOpen, 'is-expanded': isExpanded }">
    <header class="intro" :class="{ 'is-hidden': isOpen }">
      <p class="intro-label">Para você</p>
      <h1 class="brand">Kamilly</h1>
      <p class="intro-hint">Toque na carta para abrir</p>
    </header>

    <div class="stage">
      <div class="envelope-stage" :class="{ opened: isOpen }">
        <div
          class="envelope"
          role="button"
          tabindex="0"
          :class="{ open: isOpen, close: !isOpen }"
          :aria-label="isOpen ? 'Carta aberta' : 'Abrir carta'"
          :aria-disabled="isOpen ? 'true' : undefined"
          @click="openEnvelope"
        >
          <div class="envelope-shadow" />
          <div class="envelope-body" />

          <div class="front pocket" aria-hidden="true" />
          <div class="front flap" aria-hidden="true" />

          <div class="seal" aria-hidden="true">
            <span class="seal-ring" />
            <span class="seal-core">K</span>
          </div>

          <Teleport to="body" :disabled="!isExpanded">
            <div class="letter-mouth" :class="{ open: isOpen, expanded: isExpanded }">
              <article
                class="letter"
                :class="{ open: isOpen, expanded: isExpanded }"
                aria-live="polite"
              >
                <div ref="letterSheetRef" class="letter-sheet">
                  <div class="invitation-glow" aria-hidden="true" />
                  <p class="invite-eyebrow">Você está convidado</p>
                  <h2 class="invite-name">Kamilly</h2>
                  <div class="invite-ornament" aria-hidden="true">
                    <span />
                    <i />
                    <span />
                  </div>
                  <p class="invite-message">
                    Com muito carinho, convido você para celebrar este momento especial ao meu lado.
                  </p>
                  <div class="invite-details">
                    <p><strong>Data</strong><span>Sábado, 15 de agosto</span></p>
                    <p><strong>Horário</strong><span>16h00</span></p>
                    <p><strong>Local</strong><span>Espaço a confirmar</span></p>
                  </div>
                  <p class="invite-closing">Espero por você</p>
                </div>
              </article>
            </div>
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
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
  transition:
    opacity 0.45s ease,
    transform 0.45s ease;
}

.intro.is-hidden {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
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
  animation: pulse-hint 2.4s ease-in-out infinite;
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
  animation: float 4.5s ease-in-out infinite;
  cursor: pointer;
  overflow: visible;
}

.envelope.open {
  animation: none;
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
  animation: shadow-breathe 4.5s ease-in-out infinite;
  pointer-events: none;
}

.envelope.open .envelope-shadow {
  animation: shell-fade 0.65s ease 2.25s forwards;
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

.envelope.open .envelope-body {
  animation: shell-fade 0.65s ease 2.25s forwards;
}

.front {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.envelope.open .front {
  animation: shell-fade 0.65s ease 2.25s forwards;
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
  animation:
    flap-open 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards,
    shell-fade 0.65s ease 2.25s forwards;
}

.flap::after {
  content: '';
  position: absolute;
  inset: 0;
  clip-path: inherit;
  background: linear-gradient(180deg, var(--envelope-lining) 0%, #c48e97 100%);
  opacity: 0;
  backface-visibility: hidden;
  transform: rotateX(180deg);
}

.envelope.open .flap::after {
  animation: lining-show 0.2s ease 0.2s forwards;
}

/* Letter rises behind the pocket, filling the full V opening */
.letter-mouth {
  --exit-room: min(72vh, 540px);
  --tuck: 220px;
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
}

.letter-mouth.open {
  visibility: visible;
  pointer-events: auto;
  animation: mouth-center 0.85s cubic-bezier(0.22, 1, 0.36, 1) 2.2s forwards;
}

.letter {
  position: absolute;
  left: 0;
  right: 0;
  /* Rest line = envelope top; tucked fully below until exit starts */
  bottom: calc(100% - var(--exit-room));
  width: 100%;
  transform: translateY(calc(100% + var(--tuck)));
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.letter.open {
  pointer-events: auto;
  animation:
    letter-exit 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.55s both,
    letter-center 0.85s cubic-bezier(0.22, 1, 0.36, 1) 2.2s forwards;
}

.letter-sheet {
  position: relative;
  width: 100%;
  padding: 2rem 1.5rem 1.8rem;
  text-align: center;
  border-radius: 6px;
  background:
    linear-gradient(165deg, #fffaf7 0%, var(--paper) 48%, #f0e8e2 100%);
  border: 1px solid rgba(201, 164, 108, 0.28);
  box-shadow:
    0 28px 56px rgba(42, 36, 48, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}

.invitation-glow {
  position: absolute;
  left: 50%;
  top: 40%;
  width: 120%;
  height: 70%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255, 248, 242, 0.7), transparent 65%);
  filter: blur(8px);
  pointer-events: none;
}

.seal {
  position: absolute;
  top: 48%;
  left: 50%;
  z-index: 8;
  width: 54px;
  height: 54px;
  transform: translate(-50%, -50%);
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
  animation: spin-slow 18s linear infinite;
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
  animation: seal-break 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
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

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes shadow-breathe {
  0%,
  100% {
    transform: scaleX(1);
    opacity: 0.85;
  }
  50% {
    transform: scaleX(0.92);
    opacity: 0.55;
  }
}

@keyframes pulse-hint {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@keyframes spin-slow {
  to {
    transform: rotate(360deg);
  }
}

@keyframes flap-open {
  from {
    transform: rotateX(0deg);
  }
  to {
    transform: rotateX(180deg);
  }
}

@keyframes lining-show {
  to {
    opacity: 1;
  }
}

@keyframes letter-exit {
  0% {
    opacity: 0;
    visibility: hidden;
    transform: translateY(calc(100% + var(--tuck)));
  }
  4% {
    opacity: 1;
    visibility: visible;
    transform: translateY(calc(100% + var(--tuck)));
  }
  100% {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

@keyframes letter-center {
  0% {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 1;
    visibility: visible;
    transform: translateY(40%) scale(1.03);
  }
}

@keyframes mouth-center {
  0% {
    bottom: 0;
    z-index: 6;
    overflow: hidden;
  }
  20% {
    overflow: visible;
    z-index: 10;
  }
  100% {
    bottom: -58%;
    z-index: 10;
    overflow: visible;
  }
}

@keyframes shell-fade {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes seal-break {
  0% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
  35% {
    transform: translate(-50%, -58%) scale(1.14) rotate(-8deg);
    opacity: 1;
  }
  100% {
    transform: translate(-8%, 78px) scale(0.68) rotate(28deg);
    opacity: 0;
  }
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

  .letter-mouth:not(.expanded) {
    width: 97%;
    max-width: 280px;
  }

  .letter-sheet {
    padding: 1.7rem 1.2rem 1.5rem;
  }

  /* Fullscreen invite — teleported to body so it escapes stage perspective */
  .letter-mouth.open.expanded {
    position: fixed;
    inset: 0;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    width: 100vw;
    max-width: none;
    height: 100%;
    height: 100dvh;
    transform: none;
    overflow: auto;
    visibility: visible;
    pointer-events: auto;
    animation: none;
    display: block;
    -webkit-overflow-scrolling: touch;
  }

  .letter.open.expanded {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    width: 100%;
    min-height: 100%;
    min-height: 100dvh;
    transform: none;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    animation: none;
  }

  .letter.open.expanded .letter-sheet {
    width: 100%;
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
    will-change: transform;
  }

  .scene.is-expanded {
    overflow: hidden;
    padding: 0;
  }

  .scene.is-expanded .stage {
    perspective: none;
  }

  .scene.is-expanded .envelope {
    transform: none;
    transform-style: flat;
  }
}

@media (prefers-reduced-motion: reduce) {
  .envelope,
  .envelope-shadow,
  .intro-hint,
  .seal-ring {
    animation: none !important;
  }

  .letter.open,
  .letter-mouth.open,
  .envelope.open .flap,
  .envelope.open .envelope-body,
  .envelope.open .front,
  .envelope.open .envelope-shadow,
  .envelope.open .seal {
    animation-duration: 0.01ms !important;
    animation-delay: 0s !important;
  }
}
</style>
