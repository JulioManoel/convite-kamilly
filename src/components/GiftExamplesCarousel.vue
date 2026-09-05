<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="gift-carousel" aria-label="Exemplos de presentes">
    <div class="gift-carousel__track" tabindex="0">
      <article
        v-for="item in items"
        :key="item.id"
        class="gift-carousel__slide"
      >
        <div class="gift-carousel__card">
          <div class="gift-carousel__frame">
            <img
              class="gift-carousel__image"
              :src="item.image"
              :alt="item.label"
              loading="lazy"
              draggable="false"
            />
          </div>
          <p class="gift-carousel__caption">{{ item.label }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.gift-carousel {
  --gift-gap: 0.75rem;
  width: 100%;
  margin-inline: 0;
}

.gift-carousel__track {
  display: flex;
  gap: var(--gift-gap);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  width: 100%;
  padding: 0.35rem 0 0.6rem;
}

.gift-carousel__track::-webkit-scrollbar {
  display: none;
}

/* 2 full slides + half of the next one */
.gift-carousel__slide {
  flex: 0 0 calc((100% - (2 * var(--gift-gap))) / 2.5);
  width: calc((100% - (2 * var(--gift-gap))) / 2.5);
}

.gift-carousel__card {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.55rem 0.55rem 0.85rem;
  border-radius: 0.8rem;
  border: 1.5px solid var(--vn-gold-soft);
  background: transparent;
  text-align: center;
}

.gift-carousel__frame {
  aspect-ratio: 3 / 4;
  width: 100%;
  border-radius: 0.45rem;
  overflow: hidden;
  background: transparent;
}

.gift-carousel__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gift-carousel__caption {
  margin: 0.7rem 0.2rem 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.15rem;
  font-weight: 500;
  line-height: 1.3;
  color: var(--vn-ink);
}

@media (max-width: 768px) {
  .gift-carousel__caption {
    font-size: 1.05rem;
  }
}
</style>
