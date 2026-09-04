<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { event } from '../data/invite.js'

const units = ref([
  { key: 'days', label: 'dias', value: '00' },
  { key: 'hours', label: 'horas', value: '00' },
  { key: 'minutes', label: 'min', value: '00' },
  { key: 'seconds', label: 'seg', value: '00' },
])

const unitRefs = ref([])
let intervalId

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getTargetTime() {
  return new Date(event.targetISO).getTime()
}

function computeRemaining() {
  const diff = Math.max(0, getTargetTime() - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
}

function tickDigit(index, newValue) {
  const el = unitRefs.value[index]?.querySelector('.countdown__number')
  if (!el || prefersReducedMotion()) return
  gsap.fromTo(el, { scale: 1.08 }, { scale: 1, duration: 0.2, ease: 'power2.out' })
}

function updateCountdown() {
  const remaining = computeRemaining()
  const keys = ['days', 'hours', 'minutes', 'seconds']

  keys.forEach((key, index) => {
    const newVal = remaining[key]
    if (units.value[index].value !== newVal) {
      units.value[index].value = newVal
      tickDigit(index, newVal)
    }
  })
}

onMounted(() => {
  updateCountdown()
  intervalId = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <section class="countdown" aria-live="polite" data-scroll-reveal>
    <h3 class="countdown__title">Faltam</h3>
    <div class="countdown__grid">
      <div
        v-for="(unit, index) in units"
        :key="unit.key"
        ref="unitRefs"
        class="countdown__unit"
      >
        <span class="countdown__number">{{ unit.value }}</span>
        <span class="countdown__label">{{ unit.label }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.countdown {
  text-align: center;
  padding-block: clamp(2rem, 6vw, 3rem);
}

.countdown__title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--vn-blue-mid);
  margin-bottom: 1.25rem;
}

.countdown__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.countdown__unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.countdown__number {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2.1rem, 7vw, 3.2rem);
  font-weight: 600;
  color: var(--vn-gold);
  line-height: 1;
}

.countdown__label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--vn-ink-soft);
}

@media (max-width: 768px) {
  .countdown__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem 0.5rem;
  }
}
</style>
