<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import ambientTrack from '../assets/musica.mp3'

defineProps({
  visible: { type: Boolean, default: true },
})

const AMBIENT_MUTED_KEY = 'ambient_muted'
const DEFAULT_VOLUME = 0.3
const START_OFFSET_SEC = 2

const audioRef = ref(null)
const isMuted = ref(false)
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

function seekToStartOffset(audio) {
  try {
    audio.currentTime = START_OFFSET_SEC
  } catch {
    // ignore until metadata is ready
  }
}

function tryPlay({ fromStart = false } = {}) {
  const audio = audioRef.value
  if (!audio || isMuted.value || prefersReducedMotion()) return

  audio.volume = DEFAULT_VOLUME

  const start = () => {
    if (fromStart) seekToStartOffset(audio)
    audio.play().catch(() => {
      // iOS may block autoplay outside a user gesture
    })
  }

  if (audio.readyState >= 1) {
    start()
  } else {
    audio.addEventListener('loadedmetadata', start, { once: true })
    audio.load()
  }
}

function onEnded() {
  const audio = audioRef.value
  if (!audio || isMuted.value) return
  seekToStartOffset(audio)
  audio.play().catch(() => {})
}

function playOnOpen() {
  hasInteracted.value = true
  if (prefersReducedMotion()) return
  if (isMuted.value) return

  tryPlay({ fromStart: true })
}

function enableOnInteraction() {
  if (hasInteracted.value) return
  hasInteracted.value = true
  if (!isMuted.value) tryPlay({ fromStart: true })
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
    tryPlay({ fromStart: audio.currentTime < START_OFFSET_SEC })
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

defineExpose({
  playOnOpen,
})
</script>

<template>
  <button
    v-show="visible"
    type="button"
    class="ambient-music"
    :aria-label="isMuted ? 'Ativar música ambiente' : 'Desativar música ambiente'"
    :aria-pressed="!isMuted"
    @click="toggleMute"
  >
    <span class="ambient-music__icon" aria-hidden="true">{{ isMuted ? '🔇' : '🔊' }}</span>
  </button>

  <audio
    ref="audioRef"
    :src="ambientTrack"
    preload="auto"
    @ended="onEnded"
  />
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
