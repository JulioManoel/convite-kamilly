<script setup>
import { event } from '../data/invite.js'
import dateImage from '../assets/data.svg'

const ariaLabel = `${event.weekday}, ${event.day} de setembro de ${event.year}, ${event.timeLabel.replace('às ', '')} horas`
</script>

<template>
  <div class="date-badge">
    <img
      class="date-badge__image"
      :src="dateImage"
      :alt="ariaLabel"
      width="874"
      height="285"
      decoding="async"
    />
  </div>
  <p class="date-badge__time">{{ event.timeLabel }}</p>
</template>

<style scoped>
.date-badge {
  width: min(100%, 22rem);
  margin-inline: auto;
}

.date-badge__image {
  display: block;
  width: 100%;
  height: auto;
}

.date-badge__time {
  margin-top: 0.85rem;
  font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  font-size: clamp(1.25rem, 4vw, 1.5rem);
  font-weight: 500;
  font-style: normal;
  letter-spacing: 0.04em;
  color: var(--vn-ink);
  text-align: center;
}

@media (max-width: 768px) {
  .date-badge {
    width: min(100%, 17.5rem);
  }
}
</style>
