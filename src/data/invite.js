export const RSVP_STORAGE_KEY = 'kamilly_rsvp'

export const event = {
  date: new Date('2026-09-19T19:00:00'),
  weekday: 'Sábado',
  day: 19,
  month: 'SETEMBRO',
  year: 2026,
  timeLabel: 'às 19h',
  targetISO: '2026-09-19T19:00:00-03:00',
  timezone: 'America/Sao_Paulo',
}

export const dressCode = {
  title: 'Dress Code',
  description: 'Esporte fino em tons que remetam à Noite Estrelada.',
  colors: [
    { hex: '#1a3a6c', label: 'Azul noite' },
    { hex: '#2d5a9e', label: 'Azul Van Gogh' },
    { hex: '#d4a843', label: 'Dourado' },
    { hex: '#f5f0e8', label: 'Neutro claro' },
    { hex: '#0a1c3d', label: 'Azul escuro' },
  ],
}

export const location = {
  address: 'R. José do Carmo Sanches, Votorantim',
  note: '',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=R.+José+do+Carmo+Sanches,+Votorantim',
  mapsLabel: 'Ver no mapa',
}

export const gifts = {
  title: 'Dicas para presentes',
  sizes: [
    { label: 'Sapato', value: '36' },
    { label: 'Camiseta', value: 'P' },
    { label: 'Calça', value: '38, 40' },
  ],
  suggestions: [
    {
      label: 'Perfumes',
      details: ['Mais floral', 'Floral amadeirado', 'Cheiros suaves'],
    },
    'Maquiagem',
    'Produtos para cabelo',
    'Ursos de pelúcia',
    'Acessórios',
    'Jogos',
  ],
}

export const quote = {
  text: 'O que seria da vida se não tivéssemos a coragem de tentar algo novo',
  author: 'Van Gogh',
}

export const invitation = {
  loveMessage:
    'Com muito amor, tenho a alegria de convidar vocês para comemorar um novo capítulo da minha vida.',
  guestFirstName: 'Kamilly',
  guestLastName: 'Manoel',
  closingMessage: 'Conto com a sua presença.',
}

export function loadRsvp() {
  try {
    const raw = localStorage.getItem(RSVP_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isRsvpConfirmed() {
  return loadRsvp()?.confirmed === true
}

export function saveRsvp(payload) {
  localStorage.setItem(
    RSVP_STORAGE_KEY,
    JSON.stringify({
      ...payload,
      confirmed: true,
      confirmedAt: new Date().toISOString(),
    }),
  )
}
