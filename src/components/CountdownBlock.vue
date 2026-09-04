<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { event } from '../data/invite.js'

const remaining = ref({
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00',
})

const timeRef = ref(null)
let intervalId
let previousSeconds = '00'

const timeDisplay = computed(
  () => `${remaining.value.hours}:${remaining.value.minutes}:${remaining.value.seconds}`,
)

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

function tickDisplay() {
  const el = timeRef.value
  if (!el || prefersReducedMotion()) return
  gsap.fromTo(el, { scale: 1.04 }, { scale: 1, duration: 0.2, ease: 'power2.out' })
}

function updateCountdown() {
  const next = computeRemaining()
  const secondsChanged = next.seconds !== previousSeconds
  remaining.value = next
  previousSeconds = next.seconds
  if (secondsChanged) tickDisplay()
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
    <div
      class="countdown__row"
      :aria-label="`Faltam ${remaining.days} dias, ${remaining.hours} horas, ${remaining.minutes} minutos e ${remaining.seconds} segundos`"
    >
      <div class="countdown__days">
        <span class="countdown__number">{{ remaining.days }}</span>
        <span class="countdown__label">dias</span>
      </div>

      <div class="countdown__time">
        <span ref="timeRef" class="countdown__number countdown__number--time">{{ timeDisplay }}</span>
        <div class="countdown__time-labels" aria-hidden="true">
          <span>horas</span>
          <span>min</span>
          <span>seg</span>
        </div>
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

.countdown__row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(1.25rem, 5vw, 2.5rem);
}

.countdown__days,
.countdown__time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
}

.countdown__number {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2.8rem, 11vw, 4.5rem);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: var(--vn-gold);
  line-height: 1;
}

.countdown__number--time {
  letter-spacing: 0.04em;
}

.countdown__label,
.countdown__time-labels {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vn-ink-soft);
}

.countdown__time-labels {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  min-width: 9.5em;
}
</style>
