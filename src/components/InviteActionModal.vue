<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'
import sealImage from '../assets/k.webp'
import { dressCode } from '../data/invite.js'
import GoldDivider from './GoldDivider.vue'
import RsvpForm from './RsvpForm.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'rsvp-success'])

const overlayRef = ref(null)
const modalRef = ref(null)
const dressRingRef = ref(null)
const closeTimer = ref(null)

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

function handleClose() {
  animateClose(() => emit('close'))
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
      await nextTick()
      animateOpen()
      setupFocusTrap()
    } else {
      teardownFocusTrap()
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
        aria-labelledby="invite-modal-title"
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

        <section class="dress-code" aria-labelledby="dress-code-title">
          <h3 id="dress-code-title" class="dress-code__title">{{ dressCode.title }}</h3>

          <div
            ref="dressRingRef"
            class="dress-code__ring"
            role="img"
            aria-label="Cores sugeridas: azul noite, azul Van Gogh, dourado, neutro claro e azul escuro"
            :style="{ '--swatch-count': dressCode.colors.length }"
          >
            <ul class="dress-code__swatches">
              <li
                v-for="(color, index) in dressCode.colors"
                :key="color.hex"
                class="dress-code__swatch"
                :style="{ '--swatch-color': color.hex, '--swatch-index': index }"
                :title="color.label"
              />
            </ul>
          </div>

          <p class="dress-code__description">{{ dressCode.description }}</p>
        </section>

        <GoldDivider />

        <h2 id="invite-modal-title" class="invite-modal__title">Confirmar presença</h2>
        <RsvpForm @success="onRsvpSuccess" />
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

.dress-code__ring {
  position: relative;
  width: clamp(120px, 38vw, 180px);
  aspect-ratio: 1;
  margin-inline: auto;
  border: 2px solid var(--vn-gold);
  border-radius: 50%;
  background: rgba(255, 250, 244, 0.5);
}

.dress-code__swatches {
  position: absolute;
  inset: 18%;
  list-style: none;
  margin: 0;
  padding: 0;
}

.dress-code__swatch {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(20px, 6vw, 32px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--swatch-color);
  border: 1px solid rgba(27, 45, 79, 0.15);
  transform:
    rotate(calc(var(--swatch-index) * (360deg / var(--swatch-count, 5))))
    translateY(-72%)
    rotate(calc(var(--swatch-index) * (-360deg / var(--swatch-count, 5))));
  transition: transform 0.2s, box-shadow 0.2s;
}

.dress-code__swatch:hover {
  transform:
    rotate(calc(var(--swatch-index) * (360deg / var(--swatch-count, 5))))
    translateY(-72%)
    rotate(calc(var(--swatch-index) * (-360deg / var(--swatch-count, 5))))
    scale(1.12);
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
