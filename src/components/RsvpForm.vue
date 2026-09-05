<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { invitation, saveRsvp } from '../data/invite.js'

const MAX_CHILDREN = 10

const emit = defineEmits(['success'])

const isSubmitting = ref(false)
const isSuccess = ref(false)
const submitError = ref('')

const form = reactive({
  name: '',
  guestCount: '',
  hasChild: null,
  childNames: [''],
})

const errors = reactive({
  name: '',
  guestCount: '',
  hasChild: '',
  childNames: [''],
})

const showChildFields = computed(() => form.hasChild === true)
const canAddChild = computed(() => form.childNames.length < MAX_CHILDREN)

watch(
  () => form.hasChild,
  (value) => {
    if (value === true) {
      if (form.childNames.length === 0) {
        form.childNames = ['']
        errors.childNames = ['']
      }
    } else {
      form.childNames = ['']
      errors.childNames = ['']
    }
  },
)

function clearErrors() {
  errors.name = ''
  errors.guestCount = ''
  errors.hasChild = ''
  errors.childNames = form.childNames.map(() => '')
}

function addChildField() {
  if (!canAddChild.value) return
  form.childNames.push('')
  errors.childNames.push('')
}

function removeChildField(index) {
  if (form.childNames.length <= 1) return
  form.childNames.splice(index, 1)
  errors.childNames.splice(index, 1)
}

function validate() {
  clearErrors()
  let valid = true

  const trimmedName = form.name.trim()
  if (!trimmedName || trimmedName.length < 2) {
    errors.name = 'Informe seu nome completo.'
    valid = false
  }

  const guestCount = Number(form.guestCount)
  if (!Number.isInteger(guestCount) || guestCount < 1) {
    errors.guestCount = 'Informe quantas pessoas virão.'
    valid = false
  }

  if (form.hasChild === null) {
    errors.hasChild = 'Selecione se haverá criança.'
    valid = false
  }

  if (form.hasChild === true) {
    form.childNames.forEach((name, index) => {
      if (!name.trim()) {
        errors.childNames[index] = 'Informe o nome da criança.'
        valid = false
      }
    })
  }

  return valid
}

async function handleSubmit() {
  if (isSubmitting.value || isSuccess.value) return
  if (!validate()) return

  isSubmitting.value = true
  submitError.value = ''

  const childNames =
    form.hasChild === true ? form.childNames.map((name) => name.trim()).filter(Boolean) : []

  const payload = {
    name: form.name.trim(),
    guestCount: Number(form.guestCount),
    hasChild: form.hasChild === true,
    childNames,
  }

  try {
    await saveRsvp(payload)
    isSuccess.value = true
    emit('success', payload)
  } catch (error) {
    console.error('Failed to save RSVP', error)
    submitError.value = 'Não foi possível enviar. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
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
        <label for="rsvp-name">Nome completo</label>
        <input
          id="rsvp-name"
          v-model="form.name"
          type="text"
          autocomplete="name"
          placeholder="Digite seu nome completo"
          :aria-invalid="!!errors.name"
        />
        <span v-if="errors.name" class="rsvp-form__error" role="alert">{{ errors.name }}</span>
      </div>

      <div class="rsvp-form__field">
        <label for="rsvp-count">Quantas pessoas?</label>
        <input
          id="rsvp-count"
          v-model="form.guestCount"
          type="number"
          min="1"
          max="20"
          inputmode="numeric"
          placeholder="Ex.: 3"
          :aria-invalid="!!errors.guestCount"
        />
        <span v-if="errors.guestCount" class="rsvp-form__error" role="alert">{{
          errors.guestCount
        }}</span>
      </div>

      <fieldset class="rsvp-form__field rsvp-form__field--choice">
        <legend>Vai trazer criança? (10 anos)</legend>
        <div class="rsvp-form__radios" role="group" aria-label="Vai trazer criança?">
          <label class="rsvp-form__choice">
            <input v-model="form.hasChild" type="radio" :value="true" name="hasChild" />
            <span>Sim</span>
          </label>
          <label class="rsvp-form__choice">
            <input v-model="form.hasChild" type="radio" :value="false" name="hasChild" />
            <span>Não</span>
          </label>
        </div>
        <span v-if="errors.hasChild" class="rsvp-form__error" role="alert">{{
          errors.hasChild
        }}</span>
      </fieldset>

      <div v-if="showChildFields" class="rsvp-form__children">
        <div
          v-for="(_, index) in form.childNames"
          :key="`child-${index}`"
          class="rsvp-form__field rsvp-form__child-row"
        >
          <label :for="`rsvp-child-${index}`">
            {{ form.childNames.length > 1 ? `Nome da ${index + 1}ª criança` : 'Nome da criança' }}
          </label>
          <div class="rsvp-form__child-input">
            <input
              :id="`rsvp-child-${index}`"
              v-model="form.childNames[index]"
              type="text"
              placeholder="Digite o nome da criança"
              :aria-invalid="!!errors.childNames[index]"
            />
            <button
              v-if="form.childNames.length > 1"
              type="button"
              class="rsvp-form__remove-child"
              :aria-label="`Remover ${index + 1}ª criança`"
              @click="removeChildField(index)"
            >
              &times;
            </button>
          </div>
          <span v-if="errors.childNames[index]" class="rsvp-form__error" role="alert">{{
            errors.childNames[index]
          }}</span>
        </div>

        <button
          v-if="canAddChild"
          type="button"
          class="rsvp-form__add-child"
          @click="addChildField"
        >
          + Adicionar
        </button>
      </div>

      <button type="submit" class="rsvp-form__submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Enviando...' : 'Confirmar presença' }}
      </button>
      <span v-if="submitError" class="rsvp-form__error rsvp-form__error--submit" role="alert">{{
        submitError
      }}</span>
    </form>
  </div>
</template>

<style scoped>
.rsvp-form__fields {
  display: grid;
  gap: 1rem;
  text-align: left;
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

.rsvp-form__field--choice {
  border: none;
  padding: 0;
  margin: 0;
  text-align: center;
}

.rsvp-form__field--choice legend {
  width: 100%;
  text-align: center;
  margin-bottom: 0.75rem;
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

.rsvp-form__field input::placeholder {
  color: var(--vn-ink-muted);
  opacity: 0.85;
}

.rsvp-form__field input:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.rsvp-form__radios {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  border: none;
}

.rsvp-form__field--choice .rsvp-form__choice {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin: 0;
  margin-bottom: 0;
  padding: 0.35rem 0.25rem;
  border: none;
  background: none;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  color: var(--vn-ink);
  cursor: pointer;
}

.rsvp-form__choice input[type='radio'] {
  width: 1.05rem;
  height: 1.05rem;
  margin: 0;
  flex-shrink: 0;
  accent-color: var(--vn-gold);
  cursor: pointer;
  vertical-align: middle;
}

.rsvp-form__choice span {
  line-height: 1;
  display: inline-block;
}

.rsvp-form__children {
  display: grid;
  gap: 0.85rem;
}

.rsvp-form__child-input {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.rsvp-form__child-input input {
  flex: 1;
  min-width: 0;
}

.rsvp-form__remove-child {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  font-size: 1.35rem;
  line-height: 1;
  color: var(--vn-ink-soft);
  border-radius: 6px;
}

.rsvp-form__remove-child:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.rsvp-form__add-child {
  justify-self: center;
  min-height: 40px;
  padding: 0.4rem 1rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vn-blue-mid);
  border: 1px solid var(--vn-gold-soft);
  border-radius: 999px;
  background: transparent;
}

.rsvp-form__add-child:hover {
  color: var(--vn-gold);
  border-color: var(--vn-gold);
}

.rsvp-form__add-child:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.rsvp-form__error {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: #c45a5a;
  text-align: left;
}

.rsvp-form__error--submit {
  text-align: center;
  margin-top: 0.75rem;
}

.rsvp-form__field--choice .rsvp-form__error {
  text-align: center;
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
