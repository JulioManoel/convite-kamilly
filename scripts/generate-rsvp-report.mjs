/**
 * Generates a PDF report of RSVP confirmations from Firestore.
 *
 * Prerequisites:
 *   npm install -D firebase-admin pdfkit dotenv
 *
 * Auth (pick one):
 *   1. Place a service account JSON at ./serviceAccountKey.json
 *      (Firebase Console → Project settings → Service accounts → Generate new key)
 *   2. Or set GOOGLE_APPLICATION_CREDENTIALS to the key path
 *
 * Usage:
 *   npm run report:rsvp
 */

import { createWriteStream, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

function loadDependency(name, installHint) {
  try {
    return require(name)
  } catch {
    console.error(`\nMissing dependency: "${name}"`)
    console.error(`Install with:\n  ${installHint}\n`)
    process.exit(1)
  }
}

const dotenv = loadDependency('dotenv', 'npm install -D firebase-admin pdfkit dotenv')
const { initializeApp, getApps, cert, applicationDefault } = loadDependency(
  'firebase-admin/app',
  'npm install -D firebase-admin pdfkit dotenv',
)
const { getFirestore } = loadDependency(
  'firebase-admin/firestore',
  'npm install -D firebase-admin pdfkit dotenv',
)
const pdfkitModule = loadDependency('pdfkit', 'npm install -D firebase-admin pdfkit dotenv')
const PDFDocument = pdfkitModule.default || pdfkitModule

dotenv.config({ path: join(rootDir, '.env') })

const RSVP_COLLECTION = 'rsvps'
const SERVICE_ACCOUNT_PATH = join(rootDir, 'serviceAccountKey.json')
const OUTPUT_DIR = join(rootDir, 'reports')

const COLORS = {
  navy: '#0a1c3d',
  blue: '#1a3a6c',
  gold: '#d4a843',
  muted: '#5a6578',
  line: '#c8cdd6',
  soft: '#f4f6f9',
}

function initFirebase() {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID

  if (!projectId) {
    console.error('Missing VITE_FIREBASE_PROJECT_ID (or FIREBASE_PROJECT_ID) in .env')
    process.exit(1)
  }

  if (!getApps().length) {
    if (existsSync(SERVICE_ACCOUNT_PATH)) {
      const serviceAccount = require(SERVICE_ACCOUNT_PATH)
      initializeApp({
        credential: cert(serviceAccount),
        projectId,
      })
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp({
        credential: applicationDefault(),
        projectId,
      })
    } else {
      console.error(`
Firebase Admin credentials not found.

Download a service account key and save it as:
  ${SERVICE_ACCOUNT_PATH}

Or set GOOGLE_APPLICATION_CREDENTIALS to the key file path.

Firebase Console → Project settings → Service accounts → Generate new private key
`)
      process.exit(1)
    }
  }

  return getFirestore()
}

function toDate(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(date)
}

function formatDay(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeZone: 'America/Sao_Paulo',
  }).format(date)
}

function normalizeRsvp(doc) {
  const data = doc.data()
  const guests = Array.isArray(data.guests) ? data.guests : []
  const childNames =
    Array.isArray(data.childNames) && data.childNames.length
      ? data.childNames
      : guests.filter((guest) => guest.isChild).map((guest) => guest.name)

  const adults = guests.filter((guest) => !guest.isChild)
  const children = guests.filter((guest) => guest.isChild)

  return {
    id: doc.id,
    name: data.name || adults[0]?.name || guests[0]?.name || '—',
    guestCount: Number(data.guestCount) || guests.length || 0,
    hasChild: Boolean(data.hasChild || childNames.length),
    childNames,
    guests,
    adults,
    children,
    createdAt: toDate(data.createdAt),
  }
}

function buildStats(rsvps) {
  const allPeople = rsvps.flatMap((rsvp) => rsvp.guests)
  const adults = allPeople.filter((guest) => !guest.isChild)
  const children = allPeople.filter((guest) => guest.isChild)
  const withChildren = rsvps.filter((rsvp) => rsvp.hasChild)
  const totalGuests = allPeople.length || rsvps.reduce((sum, rsvp) => sum + rsvp.guestCount, 0)

  const byDay = new Map()
  for (const rsvp of rsvps) {
    const key = formatDay(rsvp.createdAt)
    byDay.set(key, (byDay.get(key) || 0) + 1)
  }

  const peakDay = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0] || null

  return {
    confirmationCount: rsvps.length,
    totalPeople: totalGuests,
    adultCount: adults.length,
    childCount: children.length,
    groupsWithChildren: withChildren.length,
    averagePerGroup: rsvps.length ? (totalGuests / rsvps.length).toFixed(1) : '0',
    largestGroup: rsvps.reduce((max, rsvp) => Math.max(max, rsvp.guestCount), 0),
    peakDay,
    byDay,
  }
}

function drawHeader(doc, generatedAt) {
  doc.rect(0, 0, doc.page.width, 88).fill(COLORS.navy)

  doc
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('Relatório de Confirmações', 40, 28, { width: doc.page.width - 80 })

  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor(COLORS.gold)
    .text('15 anos · Kamilly Manoel · Noite Estrelada', 40, 54, {
      width: doc.page.width - 80,
    })

  doc
    .fillColor(COLORS.muted)
    .fontSize(9)
    .text(`Gerado em ${formatDate(generatedAt)}`, 40, 100, {
      width: doc.page.width - 80,
      align: 'right',
    })
}

function drawSectionTitle(doc, title, y) {
  const top = y ?? doc.y
  doc
    .fillColor(COLORS.navy)
    .font('Helvetica-Bold')
    .fontSize(13)
    .text(title, 40, top)

  doc
    .moveTo(40, doc.y + 4)
    .lineTo(doc.page.width - 40, doc.y + 4)
    .strokeColor(COLORS.gold)
    .lineWidth(1.5)
    .stroke()

  doc.moveDown(0.8)
}

function ensureSpace(doc, needed = 80) {
  if (doc.y + needed > doc.page.height - 50) {
    doc.addPage()
    doc.y = 40
  }
}

function drawStatCards(doc, stats) {
  const cards = [
    { label: 'Confirmações', value: String(stats.confirmationCount) },
    { label: 'Total de pessoas', value: String(stats.totalPeople) },
    { label: 'Adultos', value: String(stats.adultCount) },
    { label: 'Crianças', value: String(stats.childCount) },
    { label: 'Grupos c/ criança', value: String(stats.groupsWithChildren) },
    { label: 'Média por grupo', value: String(stats.averagePerGroup) },
  ]

  const startY = doc.y
  const gap = 10
  const cardW = (doc.page.width - 80 - gap * 2) / 3
  const cardH = 52

  cards.forEach((card, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    const x = 40 + col * (cardW + gap)
    const y = startY + row * (cardH + gap)

    doc.roundedRect(x, y, cardW, cardH, 6).fill(COLORS.soft)
    doc
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .fontSize(8)
      .text(card.label.toUpperCase(), x + 12, y + 10, { width: cardW - 24 })
    doc
      .fillColor(COLORS.navy)
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(card.value, x + 12, y + 24, { width: cardW - 24 })
  })

  doc.y = startY + 2 * (cardH + gap) + 8
}

function drawSummaryExtras(doc, stats) {
  doc
    .fillColor(COLORS.blue)
    .font('Helvetica')
    .fontSize(10)
    .text(`Maior grupo: ${stats.largestGroup} pessoa(s)`, 40, doc.y)

  if (stats.peakDay) {
    doc.text(`Dia com mais confirmações: ${stats.peakDay[0]} (${stats.peakDay[1]})`)
  }

  doc.moveDown(1.2)
}

function drawGuestTableHeader(doc, y) {
  doc.rect(40, y, doc.page.width - 80, 22).fill(COLORS.navy)
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9)
  doc.text('#', 48, y + 7, { width: 24 })
  doc.text('Responsável', 76, y + 7, { width: 140 })
  doc.text('Adultos', 220, y + 7, { width: 150 })
  doc.text('Crianças', 374, y + 7, { width: 120 })
  doc.text('Qtd', 500, y + 7, { width: 30 })
  doc.text('Data', 530, y + 7, { width: 70 })
  return y + 22
}

function drawConfirmations(doc, rsvps) {
  drawSectionTitle(doc, 'Confirmações detalhadas')

  let y = drawGuestTableHeader(doc, doc.y)
  const rowMinHeight = 28

  rsvps.forEach((rsvp, index) => {
    const adults = rsvp.adults.map((guest) => guest.name).join(', ') || '—'
    const children = rsvp.childNames.join(', ') || '—'

    const adultsHeight = doc.heightOfString(adults, { width: 148, fontSize: 8 })
    const childrenHeight = doc.heightOfString(children, { width: 118, fontSize: 8 })
    const rowHeight = Math.max(rowMinHeight, adultsHeight + 12, childrenHeight + 12)

    if (y + rowHeight > doc.page.height - 50) {
      doc.addPage()
      y = drawGuestTableHeader(doc, 40)
    }

    if (index % 2 === 0) {
      doc.rect(40, y, doc.page.width - 80, rowHeight).fill('#fafbfc')
    }

    doc.fillColor(COLORS.navy).font('Helvetica').fontSize(8)
    doc.text(String(index + 1), 48, y + 8, { width: 24 })
    doc.font('Helvetica-Bold').text(rsvp.name, 76, y + 8, { width: 140 })
    doc.font('Helvetica').fillColor(COLORS.blue).text(adults, 220, y + 8, { width: 148 })
    doc.fillColor(COLORS.gold).text(children, 374, y + 8, { width: 118 })
    doc.fillColor(COLORS.navy).text(String(rsvp.guestCount), 500, y + 8, { width: 30 })
    doc.fillColor(COLORS.muted).text(formatDate(rsvp.createdAt), 530, y + 8, { width: 70 })

    y += rowHeight
  })

  doc.y = y + 16
}

function drawPeopleList(doc, title, names, emptyLabel) {
  ensureSpace(doc, 100)
  drawSectionTitle(doc, title)

  if (!names.length) {
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(10).text(emptyLabel)
    doc.moveDown(1)
    return
  }

  const uniqueSorted = [...new Set(names.map((name) => name.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  )

  doc.fillColor(COLORS.blue).font('Helvetica').fontSize(10)

  uniqueSorted.forEach((name, index) => {
    ensureSpace(doc, 18)
    doc.text(`${index + 1}. ${name}`)
  })

  doc.moveDown(1)
}

function drawDailyBreakdown(doc, stats) {
  ensureSpace(doc, 100)
  drawSectionTitle(doc, 'Confirmações por dia')

  const entries = [...stats.byDay.entries()]

  if (!entries.length) {
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(10).text('Sem datas disponíveis.')
    return
  }

  doc.fillColor(COLORS.blue).font('Helvetica').fontSize(10)
  for (const [day, count] of entries) {
    ensureSpace(doc, 16)
    doc.text(`${day}: ${count} confirmação(ões)`)
  }
}

function drawFooter(doc) {
  const range = doc.bufferedPageRange()
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i)
    doc
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(`Página ${i + 1} de ${range.count}`, 40, doc.page.height - 30, {
        width: doc.page.width - 80,
        align: 'center',
      })
  }
}

async function fetchRsvps(db) {
  const snapshot = await db.collection(RSVP_COLLECTION).orderBy('createdAt', 'asc').get()
  return snapshot.docs.map(normalizeRsvp)
}

function buildPdf(rsvps, outputPath) {
  return new Promise((resolvePromise, reject) => {
    mkdirSync(OUTPUT_DIR, { recursive: true })

    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      bufferPages: true,
      info: {
        Title: 'Relatório de Confirmações — Kamilly',
        Author: 'convite-kamilly',
      },
    })

    const stream = createWriteStream(outputPath)
    doc.pipe(stream)

    const generatedAt = new Date()
    const stats = buildStats(rsvps)

    drawHeader(doc, generatedAt)
    doc.y = 118

    drawSectionTitle(doc, 'Resumo')
    drawStatCards(doc, stats)
    drawSummaryExtras(doc, stats)

    if (!rsvps.length) {
      doc
        .fillColor(COLORS.muted)
        .font('Helvetica')
        .fontSize(11)
        .text('Nenhuma confirmação encontrada na coleção "rsvps".')
    } else {
      drawConfirmations(doc, rsvps)

      const adultNames = rsvps.flatMap((rsvp) => rsvp.adults.map((guest) => guest.name))
      const childNames = rsvps.flatMap((rsvp) => rsvp.childNames)

      drawPeopleList(doc, 'Lista de adultos (A–Z)', adultNames, 'Nenhum adulto confirmado.')
      drawPeopleList(doc, 'Lista de crianças (A–Z)', childNames, 'Nenhuma criança confirmada.')
      drawDailyBreakdown(doc, stats)
    }

    drawFooter(doc)
    doc.end()

    stream.on('finish', () => resolvePromise(outputPath))
    stream.on('error', reject)
  })
}

async function main() {
  const db = initFirebase()
  console.log('Fetching RSVPs from Firestore...')

  const rsvps = await fetchRsvps(db)
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  const outputPath = join(OUTPUT_DIR, `rsvp-report-${stamp}.pdf`)

  await buildPdf(rsvps, outputPath)

  const stats = buildStats(rsvps)
  console.log(`
Report ready: ${outputPath}

Confirmations : ${stats.confirmationCount}
Total people  : ${stats.totalPeople}
Adults        : ${stats.adultCount}
Children      : ${stats.childCount}
`)
}

main().catch((error) => {
  console.error('Failed to generate report:', error.message || error)
  process.exit(1)
})
