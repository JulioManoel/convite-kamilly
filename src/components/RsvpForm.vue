<script setup>
import { reactive, ref } from 'vue'
import { invitation, saveRsvp } from '../data/invite.js'

const emit = defineEmits(['success'])

const isSubmitting = ref(false)
const isSuccess = ref(false)

const form = reactive({
  name: '',
  guestCount: 1,
  hasChild: null,
  childName: '',
})

const errors = reactive({
  name: '',
  guestCount: '',
  hasChild: '',
  childName: '',
})

function clearErrors() {
  errors.name = ''
  errors.guestCount = ''
  errors.hasChild = ''
  errors.childName = ''
}

function validate() {
  clearErrors()
  let valid = true

  const trimmedName = form.name.trim()
  if (!trimmedName || trimmedName.length < 2) {
    errors.name = 'Informe seu nome.'
    valid = false
  }

  const count = Number(form.guestCount)
  if (!Number.isInteger(count) || count < 1) {
    errors.guestCount = 'Informe quantas pessoas virão.'
    valid = false
  }

  if (form.hasChild === null) {
    errors.hasChild = 'Selecione se haverá criança.'
    valid = false
  }

  if (form.hasChild === true && !form.childName.trim()) {
    errors.childName = 'Informe o nome da criança.'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (isSubmitting.value || isSuccess.value) return
  if (!validate()) return

  isSubmitting.value = true

  const payload = {
    name: form.name.trim(),
    guestCount: Number(form.guestCount),
    hasChild: form.hasChild === true,
    childName: form.hasChild === true ? form.childName.trim() : '',
  }

  saveRsvp(payload)
  isSuccess.value = true
  isSubmitting.value = false
  emit('success', payload)
}
</script>

<template>
  <div class="rsvp-form">
    <div v-if="isSuccess" class="rsvp-form__success">
      <p class="rsvp-form__success-message">Obrigado! Sua presença foi confirmada.</p>
      <p class="rsvp-form__closing">{{ invitation.closingMessage }}</p>
    </div>

    <form v-else class="rsvp-form__fields" @submit.prevent="handleSubmit">
      <div class="rsvp-form__field">
        <label for="rsvp-name">Seu nome</label>
        <input
          id="rsvp-name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          :aria-invalid="!!errors.name"
        />
        <span v-if="errors.name" class="rsvp-form__error" role="alert">{{ errors.name }}</span>
      </div>

      <div class="rsvp-form__field">
        <label for="rsvp-count">Quantidade de pessoas</label>
        <input
          id="rsvp-count"
          v-model.number="form.guestCount"
          type="number"
          min="1"
          max="10"
          :aria-invalid="!!errors.guestCount"
        />
        <span v-if="errors.guestCount" class="rsvp-form__error" role="alert">{{
          errors.guestCount
        }}</span>
      </div>

      <fieldset class="rsvp-form__field">
        <legend>Vai trazer criança?</legend>
        <div class="rsvp-form__radios">
          <label>
            <input v-model="form.hasChild" type="radio" :value="true" name="hasChild" />
            Sim
          </label>
          <label>
            <input v-model="form.hasChild" type="radio" :value="false" name="hasChild" />
            Não
          </label>
        </div>
        <span v-if="errors.hasChild" class="rsvp-form__error" role="alert">{{
          errors.hasChild
        }}</span>
      </fieldset>

      <div v-if="form.hasChild === true" class="rsvp-form__field">
        <label for="rsvp-child">Nome da criança</label>
        <input
          id="rsvp-child"
          v-model="form.childName"
          type="text"
          :aria-invalid="!!errors.childName"
        />
        <span v-if="errors.childName" class="rsvp-form__error" role="alert">{{
          errors.childName
        }}</span>
      </div>

      <button type="submit" class="rsvp-form__submit" :disabled="isSubmitting">
        Confirmar presença
      </button>
    </form>
  </div>
</template>

<style scoped>
.rsvp-form__fields {
  display: grid;
  gap: 1rem;
}

.rsvp-form__field label,
.rsvp-form__field legend {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--vn-blue-mid);
  margin-bottom: 0.4rem;
}

.rsvp-form__field input[type='text'],
.rsvp-form__field input[type='number'] {
  width: 100%;
  min-height: 44px;
  padding: 0.65rem 0.85rem;
  font-size: 16px;
  font-family: 'Cormorant Garamond', serif;
  color: var(--vn-ink);
  background: var(--vn-paper);
  border: 1px solid var(--vn-paper-shadow);
  border-radius: 6px;
}

.rsvp-form__field input:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.rsvp-form__field fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.rsvp-form__radios {
  display: flex;
  gap: 1.25rem;
}

.rsvp-form__radios label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem;
  text-transform: none;
  letter-spacing: normal;
  color: var(--vn-ink);
  cursor: pointer;
}

.rsvp-form__error {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: #c45a5a;
}

.rsvp-form__submit {
  margin-top: 0.5rem;
  min-height: 44px;
  padding: 0.75rem 1.5rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  color: var(--vn-sky-deep);
  background: var(--vn-gold);
  border-radius: 999px;
  transition: opacity 0.2s;
}

.rsvp-form__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rsvp-form__submit:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.rsvp-form__success {
  text-align: center;
  padding: 1rem 0;
}

.rsvp-form__success-message {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem;
  color: var(--vn-ink);
  margin-bottom: 0.75rem;
}

.rsvp-form__closing {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.35rem;
  font-style: italic;
  color: var(--vn-gold);
}
</style>
