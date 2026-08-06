<script setup>
import { ref } from 'vue'

defineProps({
  isOpen: { type: Boolean, default: false },
  isCentered: { type: Boolean, default: false },
  isExpanded: { type: Boolean, default: false },
})

const letterMouthRef = ref(null)
const letterRef = ref(null)
const letterSheetRef = ref(null)

defineExpose({
  letterMouthRef,
  letterRef,
  letterSheetRef,
})
</script>

<template>
  <div
    ref="letterMouthRef"
    class="letter-mouth"
    :class="{ open: isOpen, centered: isCentered, expanded: isExpanded }"
  >
    <article
      ref="letterRef"
      class="letter"
      :class="{ open: isOpen, centered: isCentered, expanded: isExpanded }"
      aria-live="polite"
    >
      <div ref="letterSheetRef" class="letter-sheet">
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
</template>

<style scoped>
/* Letter rises behind the pocket, filling the full V opening */
.letter-mouth {
  --exit-room: min(72vh, 540px);
  --tuck: 220px;
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 2;
  width: 90%;
  max-width: 280px;
  height: calc(100% + var(--exit-room));
  transform: translateX(-50%);
  overflow: hidden;
  pointer-events: none;
  visibility: hidden;
}

.letter-mouth.open {
  visibility: visible;
  pointer-events: auto;
}

.letter {
  position: absolute;
  left: 0;
  right: 0;
  /* Rest line = envelope top; tucked fully below until exit starts */
  bottom: calc(100% - var(--exit-room));
  width: 100%;
  max-width: 100%;
  transform: translateY(calc(100% + var(--tuck)));
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.letter.open {
  pointer-events: auto;
}

/* After exit: invite card locked to the viewport center */
.letter-mouth.open.centered {
  position: fixed;
  inset: 0;
  z-index: 1000;
  width: 100%;
  max-width: 100%;
  height: 100%;
  height: 100dvh;
  transform: none;
  overflow-x: hidden;
  overflow-y: auto;
  visibility: visible;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

.letter.open.centered {
  position: relative;
  left: auto;
  right: auto;
  bottom: auto;
  width: min(90vw, 300px);
  max-width: 100%;
  min-height: auto;
  transform: none;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  flex-shrink: 0;
}

.letter.open.centered .letter-sheet {
  width: 100%;
  max-width: 100%;
  will-change: transform;
}

.letter-sheet {
  position: relative;
  width: 100%;
  max-width: 100%;
  padding: 2rem 1.5rem 1.8rem;
  text-align: center;
  border-radius: 6px;
  overflow: hidden;
  background:
    linear-gradient(165deg, #fffaf7 0%, var(--paper) 48%, #f0e8e2 100%);
  border: 1px solid rgba(201, 164, 108, 0.28);
  box-shadow:
    0 28px 56px rgba(42, 36, 48, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}

.invitation-glow {
  position: absolute;
  inset: 15% -10% auto;
  height: 55%;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255, 248, 242, 0.7), transparent 65%);
  filter: blur(8px);
  pointer-events: none;
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

@media (max-width: 768px) {
  .letter-mouth:not(.centered) {
    width: 97%;
    max-width: 280px;
  }

  .letter-sheet {
    padding: 1.7rem 1.2rem 1.5rem;
  }

  /* Fullscreen invite after centered settle */
  .letter-mouth.open.centered.expanded {
    padding: 0;
    display: block;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: none;
  }

  .letter.open.centered.expanded {
    width: 100%;
    max-width: 100%;
    min-height: 100%;
    min-height: 100dvh;
  }

  .letter.open.centered.expanded .letter-sheet {
    width: 100%;
    max-width: 100%;
    min-height: 100%;
    min-height: 100dvh;
    border-radius: 0;
    border: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding:
      max(2.2rem, env(safe-area-inset-top, 0px))
      max(1.35rem, env(safe-area-inset-right, 0px))
      max(2.2rem, env(safe-area-inset-bottom, 0px))
      max(1.35rem, env(safe-area-inset-left, 0px));
    box-shadow: none;
  }
}
</style>
