<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'

const dividerRef = ref(null)
let observer

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  const el = dividerRef.value
  if (!el) return

  if (prefersReducedMotion()) {
    gsap.set(el, { scaleX: 1 })
    return
  }

  gsap.set(el, { scaleX: 0, transformOrigin: 'center' })
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        gsap.to(el, { scaleX: 1, duration: 0.5, ease: 'power2.out' })
        observer?.disconnect()
      }
    },
    { threshold: 0.2 },
  )
  observer.observe(el)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div ref="dividerRef" class="gold-divider" aria-hidden="true">
    <span class="gold-divider__line" />
    <span class="gold-divider__diamond" />
    <span class="gold-divider__line" />
  </div>
</template>

<style scoped>
.gold-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-block: 1.5rem;
  padding-inline: 1rem;
}

.gold-divider__line {
  flex: 1;
  height: 1px;
  max-width: 8rem;
  background: var(--vn-gradient-gold-line);
}

.gold-divider__diamond {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border: 1px solid var(--vn-gold);
  transform: rotate(45deg);
  background: var(--vn-gold-soft);
  box-shadow: 0 0 6px var(--vn-gold-glow);
}
</style>
