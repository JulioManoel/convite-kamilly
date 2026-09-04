<script setup>
import { event } from '../data/invite.js'

const ariaLabel = `${event.weekday}, ${event.day} de setembro de ${event.year}, ${event.timeLabel.replace('às ', '')} horas`
</script>

<template>
  <div class="date-badge" :aria-label="ariaLabel">
    <div class="date-badge__row">
      <span class="date-badge__line date-badge__line--left" aria-hidden="true" />
      <span class="date-badge__weekday">{{ event.weekday }}</span>
      <span class="date-badge__day">{{ event.day }}</span>
      <span class="date-badge__year">{{ event.year }}</span>
      <span class="date-badge__line date-badge__line--right" aria-hidden="true" />
    </div>

    <svg class="date-badge__month-arc" viewBox="0 0 200 40" aria-hidden="true">
      <defs>
        <path id="month-arc-path" d="M 20 35 Q 100 5 180 35" fill="none" />
      </defs>
      <text
        font-family="'Cormorant Garamond', serif"
        font-size="13"
        font-weight="500"
        letter-spacing="3"
        fill="var(--vn-ink)"
      >
        <textPath href="#month-arc-path" startOffset="50%" text-anchor="middle">
          {{ event.month }}
        </textPath>
      </text>
    </svg>

    <div class="date-badge__line date-badge__line--bottom" aria-hidden="true" />
  </div>
  <p class="date-badge__time">{{ event.timeLabel }}</p>
</template>

<style scoped>
.date-badge {
  text-align: center;
}

.date-badge__row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: clamp(0.6em, 2vw, 1em);
}

.date-badge__line {
  display: block;
  height: 1px;
  background: var(--vn-ink);
  opacity: 0.45;
}

.date-badge__line--left,
.date-badge__line--right {
  flex: 1;
  max-width: 2.5rem;
  align-self: center;
}

.date-badge__line--bottom {
  width: 60%;
  max-width: 12rem;
  margin: 0.25rem auto 0;
}

.date-badge__weekday,
.date-badge__year {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--vn-ink);
}

.date-badge__day {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.8rem, 11vw, 5rem);
  font-weight: 600;
  line-height: 1;
  color: var(--vn-ink);
  position: relative;
  z-index: 1;
  background: var(--vn-cream);
  padding-inline: 0.15em;
}

.date-badge__month-arc {
  display: block;
  width: min(200px, 70vw);
  height: 40px;
  margin: -0.25em auto 0;
}

.date-badge__time {
  margin-top: 0.75rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem;
  font-style: italic;
  color: var(--vn-ink-soft);
  text-align: center;
}
</style>
