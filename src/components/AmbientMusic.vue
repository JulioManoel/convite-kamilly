<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const AMBIENT_MUTED_KEY = 'ambient_muted'
const DEFAULT_VOLUME = 0.3

const audioRef = ref(null)
const isMuted = ref(true)
const hasInteracted = ref(false)

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function loadPreference() {
  try {
    const stored = localStorage.getItem(AMBIENT_MUTED_KEY)
    if (stored !== null) {
      isMuted.value = stored === 'true'
    }
  } catch {
    // ignore
  }
}

function savePreference() {
  try {
    localStorage.setItem(AMBIENT_MUTED_KEY, String(isMuted.value))
  } catch {
    // ignore
  }
}

function tryPlay() {
  const audio = audioRef.value
  if (!audio || isMuted.value || prefersReducedMotion()) return
  audio.volume = DEFAULT_VOLUME
  audio.play().catch(() => {
    // iOS may block autoplay
  })
}

function enableOnInteraction() {
  if (hasInteracted.value) return
  hasInteracted.value = true
  if (!isMuted.value) tryPlay()
}

function toggleMute() {
  enableOnInteraction()
  isMuted.value = !isMuted.value
  savePreference()

  const audio = audioRef.value
  if (!audio) return

  if (isMuted.value) {
    audio.pause()
  } else {
    tryPlay()
  }
}

onMounted(() => {
  loadPreference()
  window.addEventListener('click', enableOnInteraction, { once: true })
  window.addEventListener('keydown', enableOnInteraction, { once: true })
})

onUnmounted(() => {
  window.removeEventListener('click', enableOnInteraction)
  window.removeEventListener('keydown', enableOnInteraction)
})
</script>

<template>
  <button
    type="button"
    class="ambient-music"
    :aria-label="isMuted ? 'Ativar música ambiente' : 'Desativar música ambiente'"
    :aria-pressed="!isMuted"
    @click="toggleMute"
  >
  <span class="ambient-music__icon" aria-hidden="true">{{ isMuted ? '🔇' : '🔊' }}</span>
  </button>

  <!-- Placeholder: replace src with ambient.mp3 when available -->
  <audio ref="audioRef" loop preload="none" />
</template>

<style scoped>
.ambient-music {
  position: fixed;
  bottom: max(1rem, env(safe-area-inset-bottom));
  right: max(1rem, env(safe-area-inset-right));
  z-index: 50;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--vn-sky-deep);
  border: 1px solid var(--vn-gold);
  display: grid;
  place-items: center;
  box-shadow: 0 4px 16px rgba(6, 18, 41, 0.4);
}

.ambient-music:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.ambient-music__icon {
  font-size: 1.1rem;
  line-height: 1;
}
</style>
