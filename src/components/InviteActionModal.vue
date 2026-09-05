<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'
import sealImage from '../assets/k.webp'
import { dressCode } from '../data/invite.js'
import RsvpForm from './RsvpForm.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'rsvp-success'])

const overlayRef = ref(null)
const modalRef = ref(null)
const stepPanelRef = ref(null)
const dressRingRef = ref(null)
const closeTimer = ref(null)
const step = ref('dress-code')

const titleId = computed(() =>
  step.value === 'dress-code' ? 'dress-code-title' : 'invite-modal-title',
)

let focusTrapHandler

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function animateOpen() {
  const overlay = overlayRef.value
  const modal = modalRef.value
  if (!overlay || !modal) return

  if (prefersReducedMotion()) {
    gsap.set([overlay, modal], { autoAlpha: 1, scale: 1 })
    animateDressCode()
    return
  }

  gsap.set(overlay, { autoAlpha: 0 })
  gsap.set(modal, { autoAlpha: 0, scale: 0.92 })
  gsap.to(overlay, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' })
  gsap.to(modal, {
    autoAlpha: 1,
    scale: 1,
    duration: 0.45,
    ease: 'back.out(1.4)',
    onComplete: animateDressCode,
  })
}

function animateClose(callback) {
  const overlay = overlayRef.value
  const modal = modalRef.value
  if (!overlay || !modal) {
    callback?.()
    return
  }

  if (prefersReducedMotion()) {
    gsap.set([overlay, modal], { autoAlpha: 0 })
    callback?.()
    return
  }

  gsap.to(modal, { autoAlpha: 0, scale: 0.95, duration: 0.3, ease: 'power2.in' })
  gsap.to(overlay, {
    autoAlpha: 0,
    duration: 0.3,
    ease: 'power2.in',
    onComplete: callback,
  })
}

function animateDressCode() {
  const ring = dressRingRef.value
  if (!ring || prefersReducedMotion()) return

  const swatches = ring.querySelectorAll('.dress-code__swatch')
  gsap.fromTo(ring, { scale: 0.85 }, { scale: 1, duration: 0.4, ease: 'back.out(1.4)' })
  gsap.fromTo(
    swatches,
    { autoAlpha: 0, scale: 0.5 },
    { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.15 },
  )
}

async function animateStepChange(nextStep) {
  const panel = stepPanelRef.value

  if (!panel || prefersReducedMotion()) {
    step.value = nextStep
    await nextTick()
    teardownFocusTrap()
    setupFocusTrap()
    if (nextStep === 'dress-code') animateDressCode()
    return
  }

  await gsap.to(panel, { autoAlpha: 0, y: -8, duration: 0.2, ease: 'power2.in' })
  step.value = nextStep
  await nextTick()
  gsap.set(panel, { y: 8 })
  await gsap.to(panel, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' })
  teardownFocusTrap()
  setupFocusTrap()
  if (nextStep === 'dress-code') animateDressCode()
}

function goToRsvp() {
  animateStepChange('rsvp')
}

function goToDressCode() {
  animateStepChange('dress-code')
}

function handleClose() {
  animateClose(() => {
    step.value = 'dress-code'
    emit('close')
  })
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.open) {
    handleClose()
  }
}

function setupFocusTrap() {
  const modal = modalRef.value
  if (!modal) return

  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  focusTrapHandler = (event) => {
    if (event.key !== 'Tab') return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  modal.addEventListener('keydown', focusTrapHandler)
  first?.focus()
}

function teardownFocusTrap() {
  modalRef.value?.removeEventListener('keydown', focusTrapHandler)
}

function onRsvpSuccess(payload) {
  emit('rsvp-success', payload)
  closeTimer.value = setTimeout(() => {
    handleClose()
  }, 2500)
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      step.value = 'dress-code'
      await nextTick()
      animateOpen()
      setupFocusTrap()
    } else {
      teardownFocusTrap()
      step.value = 'dress-code'
      if (closeTimer.value) {
        clearTimeout(closeTimer.value)
        closeTimer.value = null
      }
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  teardownFocusTrap()
  if (closeTimer.value) clearTimeout(closeTimer.value)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="overlayRef"
      class="invite-modal-overlay"
      @click.self="handleClose"
    >
      <div
        id="invite-action-modal"
        ref="modalRef"
        class="invite-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <button type="button" class="invite-modal__close" aria-label="Fechar" @click="handleClose">
          &times;
        </button>

        <header class="invite-modal__header">
          <img
            class="invite-modal__logo"
            :src="sealImage"
            alt="Kamilly XV"
            width="48"
            height="48"
            draggable="false"
          />
        </header>

        <div ref="stepPanelRef" class="invite-modal__step">
          <section v-if="step === 'dress-code'" class="dress-code" aria-labelledby="dress-code-title">
            <h2 id="dress-code-title" class="dress-code__title">{{ dressCode.title }}</h2>

            <div
              ref="dressRingRef"
              class="dress-code__palette"
              role="img"
              aria-label="Cores sugeridas: azul noite, azul Van Gogh, dourado, neutro claro e azul escuro"
            >
              <ul class="dress-code__swatches">
                <li
                  v-for="color in dressCode.colors"
                  :key="color.hex"
                  class="dress-code__swatch"
                  :style="{ '--swatch-color': color.hex }"
                  :title="color.label"
                />
              </ul>
            </div>

            <p class="dress-code__description">{{ dressCode.description }}</p>

            <button type="button" class="invite-modal__next" @click="goToRsvp">
              Confirmar presença
            </button>
          </section>

          <section v-else class="invite-modal__rsvp" aria-labelledby="invite-modal-title">
            <button type="button" class="invite-modal__back" @click="goToDressCode">
              ← Dress Code
            </button>
            <h2 id="invite-modal-title" class="invite-modal__title">Confirmar presença</h2>
            <RsvpForm @success="onRsvpSuccess" />
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.invite-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(6, 18, 41, 0.75);
}

.invite-modal {
  position: relative;
  width: min(92vw, 400px);
  max-height: 90dvh;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--vn-gradient-paper);
  border-radius: 12px;
  box-shadow: 0 24px 64px rgba(6, 18, 41, 0.4);
}

.invite-modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 44px;
  height: 44px;
  font-size: 1.5rem;
  color: var(--vn-ink-soft);
  display: grid;
  place-items: center;
  z-index: 1;
}

.invite-modal__header {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.invite-modal__logo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  filter: drop-shadow(0 2px 8px var(--vn-gold-glow));
}

.invite-modal__step {
  will-change: transform, opacity;
}

.invite-modal__title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--vn-blue-mid);
  text-align: center;
  margin-bottom: 1rem;
}

.invite-modal__next {
  display: block;
  width: 100%;
  min-height: 44px;
  margin-top: 1.5rem;
  padding: 0.75rem 1.25rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  color: var(--vn-sky-deep);
  background: var(--vn-gold);
  border-radius: 999px;
  box-shadow: 0 2px 12px rgba(6, 18, 41, 0.15);
}

.invite-modal__next:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.invite-modal__back {
  display: block;
  margin: 0 auto 1rem;
  padding: 0.35rem 0.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vn-ink-soft);
}

.invite-modal__back:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.dress-code {
  text-align: center;
}

.dress-code__title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--vn-blue-mid);
  margin-bottom: 1rem;
}

.dress-code__palette {
  margin-inline: auto;
}

.dress-code__swatches {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.dress-code__swatch {
  width: clamp(40px, 12vw, 56px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--swatch-color);
  transition: transform 0.2s, box-shadow 0.2s;
}

.dress-code__swatch:hover {
  transform: scale(1.08);
  box-shadow: 0 0 8px var(--vn-gold-glow);
}

.dress-code__description {
  margin-top: 1rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  color: var(--vn-ink-soft);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .invite-modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .invite-modal {
    width: 100%;
    max-height: 90dvh;
    border-radius: 16px 16px 0 0;
    padding: max(1.25rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right))
      max(1.5rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left));
  }
}
</style>
