<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { invitation, saveRsvp } from '../data/invite.js'

const MAX_GUESTS = 20

const emit = defineEmits(['success'])

const isSubmitting = ref(false)
const isSuccess = ref(false)
const submitError = ref('')
const draftName = ref('')
const draftError = ref('')
const listError = ref('')
const pendingGuest = ref(null)
const nameInputRef = ref(null)

const guests = reactive([])

const canAddMore = computed(() => guests.length < MAX_GUESTS)
const isAskingChild = computed(() => pendingGuest.value !== null)

function clearDraftErrors() {
  draftError.value = ''
  listError.value = ''
}

async function focusNameInput() {
  await nextTick()
  nameInputRef.value?.focus()
}

function startAddGuest() {
  if (!canAddMore.value || isAskingChild.value) return

  clearDraftErrors()
  const name = draftName.value.trim()

  if (!name || name.length < 2) {
    draftError.value = 'Informe o nome completo.'
    return
  }

  pendingGuest.value = { name }
}

function confirmIsChild(isChild) {
  if (!pendingGuest.value) return

  guests.push({
    name: pendingGuest.value.name,
    isChild,
  })

  pendingGuest.value = null
  draftName.value = ''
  clearDraftErrors()
  focusNameInput()
}

function cancelPending() {
  pendingGuest.value = null
  clearDraftErrors()
  focusNameInput()
}

function removeGuest(index) {
  guests.splice(index, 1)
  listError.value = ''
}

async function handleSubmit() {
  if (isSubmitting.value || isSuccess.value) return

  clearDraftErrors()

  if (isAskingChild.value) {
    draftError.value = 'Responda se a pessoa é criança antes de confirmar.'
    return
  }

  if (guests.length === 0) {
    listError.value = 'Adicione pelo menos uma pessoa.'
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  const childNames = guests.filter((guest) => guest.isChild).map((guest) => guest.name)
  const primaryGuest = guests.find((guest) => !guest.isChild) ?? guests[0]

  const payload = {
    name: primaryGuest.name,
    guestCount: guests.length,
    hasChild: childNames.length > 0,
    childNames,
    guests: guests.map((guest) => ({
      name: guest.name,
      isChild: guest.isChild,
    })),
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
      <ul v-if="guests.length" class="rsvp-form__guest-list" aria-label="Pessoas adicionadas">
        <li v-for="(guest, index) in guests" :key="`${guest.name}-${index}`" class="rsvp-form__guest">
          <div class="rsvp-form__guest-info">
            <span class="rsvp-form__guest-name">{{ guest.name }}</span>
            <span class="rsvp-form__guest-tag">{{ guest.isChild ? 'Criança' : 'Adulto' }}</span>
          </div>
          <button
            type="button"
            class="rsvp-form__remove-guest"
            :aria-label="`Remover ${guest.name}`"
            @click="removeGuest(index)"
          >
            &times;
          </button>
        </li>
      </ul>

      <div v-if="isAskingChild" class="rsvp-form__pending">
        <p class="rsvp-form__pending-name">{{ pendingGuest.name }}</p>
        <fieldset class="rsvp-form__field rsvp-form__field--choice">
          <legend>É criança? (até 10 anos)</legend>
          <div class="rsvp-form__radios" role="group" aria-label="É criança?">
            <button type="button" class="rsvp-form__choice-btn" @click="confirmIsChild(true)">
              Sim
            </button>
            <button type="button" class="rsvp-form__choice-btn" @click="confirmIsChild(false)">
              Não
            </button>
          </div>
        </fieldset>
        <button type="button" class="rsvp-form__cancel-pending" @click="cancelPending">
          Cancelar
        </button>
      </div>

      <div v-else class="rsvp-form__add-row">
        <div class="rsvp-form__field">
          <label for="rsvp-name">Nome</label>
          <div class="rsvp-form__name-row">
            <input
              id="rsvp-name"
              ref="nameInputRef"
              v-model="draftName"
              type="text"
              autocomplete="name"
              placeholder="Digite o nome completo"
              :disabled="!canAddMore"
              :aria-invalid="!!draftError"
              @keydown.enter.prevent="startAddGuest"
            />
            <button
              type="button"
              class="rsvp-form__add"
              :disabled="!canAddMore"
              @click="startAddGuest"
            >
              Adicionar
            </button>
          </div>
          <span v-if="draftError" class="rsvp-form__error" role="alert">{{ draftError }}</span>
        </div>
      </div>

      <span v-if="listError" class="rsvp-form__error" role="alert">{{ listError }}</span>

      <button
        type="submit"
        class="rsvp-form__submit"
        :disabled="isSubmitting || guests.length === 0 || isAskingChild"
      >
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

.rsvp-form__field input[type='text'] {
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

.rsvp-form__field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rsvp-form__name-row {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.rsvp-form__name-row input {
  flex: 1;
  min-width: 0;
}

.rsvp-form__add {
  flex-shrink: 0;
  min-height: 44px;
  padding: 0.65rem 0.9rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vn-blue-mid);
  border: 1px solid var(--vn-gold-soft);
  border-radius: 6px;
  background: transparent;
  white-space: nowrap;
}

.rsvp-form__add:hover:not(:disabled) {
  color: var(--vn-gold);
  border-color: var(--vn-gold);
}

.rsvp-form__add:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.rsvp-form__add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rsvp-form__guest-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.rsvp-form__guest {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  background: var(--vn-paper);
  border: 1px solid var(--vn-paper-shadow);
  border-radius: 6px;
}

.rsvp-form__guest-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.rsvp-form__guest-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.15rem;
  color: var(--vn-ink);
  overflow-wrap: anywhere;
}

.rsvp-form__guest-tag {
  font-family: 'Outfit', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vn-ink-soft);
}

.rsvp-form__remove-guest {
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

.rsvp-form__remove-guest:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.rsvp-form__pending {
  display: grid;
  gap: 0.75rem;
  text-align: center;
}

.rsvp-form__pending-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.35rem;
  color: var(--vn-ink);
}

.rsvp-form__radios {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  border: none;
}

.rsvp-form__choice-btn {
  min-width: 88px;
  min-height: 44px;
  padding: 0.55rem 1.1rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--vn-ink);
  background: var(--vn-paper);
  border: 1px solid var(--vn-paper-shadow);
  border-radius: 999px;
}

.rsvp-form__choice-btn:hover {
  border-color: var(--vn-gold);
  color: var(--vn-gold);
}

.rsvp-form__choice-btn:focus-visible {
  outline: 2px solid var(--vn-gold);
  outline-offset: 2px;
}

.rsvp-form__cancel-pending {
  justify-self: center;
  min-height: 36px;
  padding: 0.25rem 0.75rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vn-ink-soft);
}

.rsvp-form__cancel-pending:focus-visible {
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
