<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const phase = ref('idle') // idle | open

const isOpen = computed(() => phase.value === 'open')

function openEnvelope() {
  if (phase.value !== 'idle') return
  phase.value = 'open'
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
})
</script>

<template>
  <main class="scene" :class="{ 'is-open': isOpen }">
    <div class="atmosphere" aria-hidden="true">
      <span class="orb orb-a" />
      <span class="orb orb-b" />
      <span class="petal petal-1" />
      <span class="petal petal-2" />
      <span class="petal petal-3" />
    </div>

    <header class="intro" :class="{ 'is-hidden': isOpen }">
      <p class="intro-label">Para você</p>
      <h1 class="brand">Kamilly</h1>
      <p class="intro-hint">Toque na carta para abrir</p>
    </header>

    <div class="stage">
      <div class="envelope-stage" :class="{ opened: isOpen }">
        <button
          class="envelope"
          type="button"
          :class="{ open: isOpen, close: !isOpen }"
          :disabled="isOpen"
          :aria-label="isOpen ? 'Carta aberta' : 'Abrir carta'"
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

          <div class="hearts" aria-hidden="true">
            <span class="heart a1" />
            <span class="heart a2" />
            <span class="heart a3" />
            <span class="heart a4" />
          </div>
        </button>
      </div>

      <article class="letter" :class="{ open: isOpen }" aria-live="polite">
        <div class="letter-sheet">
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

.atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.55;
  animation: drift 12s ease-in-out infinite;
}

.orb-a {
  width: 280px;
  height: 280px;
  top: 8%;
  left: 12%;
  background: rgba(232, 180, 188, 0.55);
}

.orb-b {
  width: 320px;
  height: 320px;
  right: 8%;
  bottom: 10%;
  background: rgba(197, 212, 216, 0.5);
  animation-delay: -4s;
}

.petal {
  position: absolute;
  width: 18px;
  height: 28px;
  border-radius: 60% 60% 55% 55%;
  background: linear-gradient(160deg, #f0c8ce, #d89aa4);
  opacity: 0.35;
  animation: fall 16s linear infinite;
}

.petal-1 {
  left: 18%;
}

.petal-2 {
  left: 62%;
  width: 14px;
  height: 22px;
  animation-delay: -6s;
  animation-duration: 18s;
}

.petal-3 {
  left: 82%;
  width: 12px;
  height: 20px;
  animation-delay: -11s;
  animation-duration: 20s;
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
  animation: shell-fade 0.55s ease 0.7s forwards;
  pointer-events: none;
}

.envelope {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
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

.envelope:not(:disabled):hover {
  transform: translateY(-4px);
}

.envelope:not(:disabled):focus-visible {
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
  animation: shell-fade 0.55s ease 0.75s forwards;
}

.envelope-body {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(145deg, #9aa9ad 0%, var(--envelope) 45%, var(--envelope-dark) 100%);
  pointer-events: none;
}

.envelope.open .envelope-body {
  animation: shell-fade 0.55s ease 0.75s forwards;
}

.front {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.envelope.open .front {
  animation: shell-fade 0.55s ease 0.75s forwards;
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
    flap-open 0.4s ease forwards,
    shell-fade 0.55s ease 0.75s forwards;
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
  animation: lining-show 0.2s ease 0.12s forwards;
}

.letter {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  width: min(84vw, 292px);
  transform: translate(-50%, 18%);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.letter.open {
  z-index: 10;
  pointer-events: auto;
  animation: letter-reveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
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
  animation: seal-break 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.hearts {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  z-index: 4;
  height: 0;
  pointer-events: none;
}

.envelope.open .hearts {
  animation: shell-fade 0.4s ease 0.85s forwards;
}

.heart {
  position: absolute;
  bottom: 0;
  width: 18px;
  height: 18px;
  opacity: 0;
}

.heart::before,
.heart::after {
  position: absolute;
  content: '';
  top: 0;
  width: 18px;
  height: 28px;
  background: var(--blush-deep);
  border-radius: 18px 18px 0 0;
}

.heart::before {
  left: 18px;
  transform: rotate(-45deg);
  transform-origin: 0 100%;
}

.heart::after {
  left: 0;
  transform: rotate(45deg);
  transform-origin: 100% 100%;
  background: var(--rose-seal);
}

.envelope.open .heart.a1 {
  left: 18%;
  transform: scale(0.55);
  animation:
    heart-rise 3.8s linear 0.25s forwards,
    heart-sway 1.8s ease-in-out 0.25s 4 alternate;
}

.envelope.open .heart.a2 {
  left: 48%;
  transform: scale(0.9);
  animation:
    heart-rise 4.6s linear 0.4s forwards,
    heart-sway 2.4s ease-in-out 0.4s 3 alternate;
}

.envelope.open .heart.a3 {
  left: 72%;
  transform: scale(0.7);
  animation:
    heart-rise 5.2s linear 0.3s forwards,
    heart-sway 1.6s ease-in-out 0.3s 5 alternate;
}

.envelope.open .heart.a4 {
  left: 32%;
  transform: scale(0.45);
  animation:
    heart-rise 4.2s linear 0.5s forwards,
    heart-sway 2s ease-in-out 0.5s 4 alternate;
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

@keyframes drift {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(18px, -14px);
  }
}

@keyframes fall {
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.35;
  }
  100% {
    transform: translateY(110vh) rotate(220deg);
    opacity: 0;
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

@keyframes letter-reveal {
  0% {
    opacity: 0;
    visibility: hidden;
    transform: translate(-50%, 22%);
  }
  12% {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, 8%);
  }
  100% {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, -50%) scale(1.02);
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

@keyframes heart-rise {
  0% {
    bottom: 0;
    opacity: 0;
  }
  12% {
    opacity: 0.9;
  }
  100% {
    bottom: 520px;
    opacity: 0;
  }
}

@keyframes heart-sway {
  0% {
    margin-left: 0;
  }
  100% {
    margin-left: 36px;
  }
}

@media (max-width: 480px) {
  .stage {
    height: min(84vh, 640px);
  }

  .envelope-stage {
    width: min(86vw, 280px);
    height: 186px;
  }

  .letter {
    width: min(88vw, 280px);
  }

  .letter-sheet {
    padding: 1.7rem 1.2rem 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .envelope,
  .envelope-shadow,
  .intro-hint,
  .orb,
  .petal,
  .seal-ring,
  .heart {
    animation: none !important;
  }

  .letter.open,
  .envelope.open .flap,
  .envelope.open .envelope-body,
  .envelope.open .front,
  .envelope.open .envelope-shadow,
  .envelope.open .seal,
  .envelope.open .hearts,
  .envelope-stage.opened {
    animation-duration: 0.01ms !important;
    animation-delay: 0s !important;
  }
}
</style>
