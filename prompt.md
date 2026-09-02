## Prompt final para Agent mode

Redesenhe o convite digital da Kamilly (15 anos) em Vue 3 + GSAP, no estilo Van Gogh / "A Noite Estrelada", seguindo a sequência de seções abaixo e as diretrizes de cores, assets, animações e responsividade.

---

## SEQUÊNCIA DE CONTEÚDO (ordem fixa, scroll vertical)

1. **Capa** — hero fullscreen (`100dvh`) com **apenas** `capa.png` (logo já integrada — **não** sobrepor `k.webp`)
   → Rodapé fixo da capa: **botão** para abrir popup (Dress Code + RSVP) + **seta animada** indicando scroll
   → Popup **somente** ao clicar no botão (sem abertura automática)

2. **Citação Van Gogh**
   "O que seria da vida se não tivéssemos a coragem de tentar algo novo" — Van Gogh

3. **Com muito amor**
   "Com muito amor, tenho a alegria de convidar vocês para comemorar um novo capítulo da minha vida."

4. **Nome** — Kamilly Manoel

5. **Data** — badge ornamental (ver especificação abaixo) + horário "às 19h" logo abaixo

6. **Faltam** — contagem regressiva em tempo real: **dias, horas, minutos e segundos** até 19/09/2026 19:00 (fuso `America/Sao_Paulo`)

7. **Localização** — endereço + texto complementar + botão "Ver no mapa" (ver especificação)

8. **Dicas para presentes** — tamanhos e sugestões (ver especificação)

9. **Galeria** — fotos soltas, sem grid

> **Divisores:** entre **cada** seção (2–9), inserir divisor dourado com losango central (ver Ritmo visual).
> **Fechamento:** *"Conto com a sua presença."* aparece **somente após** envio bem-sucedido do RSVP (no modal e/ou inline — ver RSVP).

---

## PALETA DE CORES (extrair de convite.png e capa.png)

Adicionar tokens em `src/style.css` sob prefixo `--vn-`:

### Fundos (céu / noite)
| Token | Hex | Uso |
|-------|-----|-----|
| `--vn-sky-deep` | `#061229` | Fundo da página, backdrop do modal |
| `--vn-sky-mid` | `#0a1c3d` | Gradiente do céu, envelope scene |
| `--vn-blue-deep` | `#1a3a6c` | Texto principal, cards escuros |
| `--vn-blue-mid` | `#2d5a9e` | Pinceladas, acentos azuis |
| `--vn-blue-light` | `#4a7ab8` | Hover, links secundários |

### Papel / conteúdo
| Token | Hex | Uso |
|-------|-----|-----|
| `--vn-cream` | `#f5f0e8` | Fundo da carta (área de texto) |
| `--vn-paper` | `#fffaf4` | Highlight do papel, inputs |
| `--vn-paper-shadow` | `#ebe4d8` | Bordas internas, sombras suaves |

### Dourado (logo, nome, CTAs, divisores)
| Token | Hex | Uso |
|-------|-----|-----|
| `--vn-gold` | `#d4a843` | Botões, divisores, nome Kamilly |
| `--vn-gold-soft` | `#e8c97a` | Sparkles, hover, bordas de fotos |
| `--vn-gold-glow` | `rgba(212, 168, 67, 0.35)` | text-shadow, box-shadow dourado |

### Estrelas / lua (acentos do céu)
| Token | Hex | Uso |
|-------|-----|-----|
| `--vn-star` | `#ffd660` | Estrelas decorativas, countdown |
| `--vn-moon` | `#ffb84d` | Lua crescente nos cantos |
| `--vn-star-glow` | `#fff8e7` | Centro dos sparkles |

### Texto
| Token | Hex | Uso |
|-------|-----|-----|
| `--vn-ink` | `#1b2d4f` | Corpo do convite, labels |
| `--vn-ink-soft` | `#3d5278` | Citação, texto secundário |
| `--vn-ink-muted` | `#5c6d8a` | Placeholders, hints |

### Regras de contraste
- Texto sobre `--vn-cream`: usar `--vn-ink` (mín. 4.5:1)
- Texto sobre céu escuro: usar `--vn-gold-soft` ou `--vn-star-glow`
- Botões primários: fundo `--vn-gold`, texto `--vn-sky-deep`
- Nunca usar rosa/blush do envelope (`--blush`, `--rose-seal`) no convite — reservar só para o selo do envelope

### Gradientes reutilizáveis
```css
--vn-gradient-sky: linear-gradient(180deg, #061229 0%, #0a1c3d 42%, #081428 100%);
--vn-gradient-paper: linear-gradient(165deg, #fffaf4 0%, #f5f0e8 48%, #ebe4d8 100%);
--vn-gradient-gold-line: linear-gradient(90deg, transparent, #d4a843, transparent);
--vn-gradient-moon: radial-gradient(circle, #ffd660 0%, #ffb84d 40%, transparent 70%);
```

### Tipografia por seção
| Seção | Fonte | Peso | Cor |
|-------|-------|------|-----|
| Citação Van Gogh | Cormorant Garamond italic | 400 | `--vn-ink-soft` |
| Corpo ("Com muito amor") | Cormorant Garamond | 400 | `--vn-ink` |
| Kamilly Manoel | Great Vibes | 400 | `--vn-gold` |
| Badge de data (dia da semana / ano) | Cormorant Garamond | 400 | `--vn-ink` |
| Badge de data (número do dia) | Cormorant Garamond | 600 | `--vn-ink`, ~2.5× maior que o restante |
| Badge de data (mês em arco) | Cormorant Garamond uppercase | 500, letter-spacing 0.18em | `--vn-ink` |
| Horário ("às 19h") | Cormorant Garamond italic | 400 | `--vn-ink-soft` |
| Dress Code (título) | Outfit uppercase | 500, letter-spacing 0.14em | `--vn-blue-mid` |
| Dress Code (descrição) | Cormorant Garamond | 400 | `--vn-ink-soft` |
| Local / presentes | Outfit (label) + Cormorant (valor) | 500/400 | label `--vn-blue-mid`, valor `--vn-ink` |
| Countdown números | Outfit | 600 | `--vn-gold` |
| Countdown labels | Outfit uppercase | 400, letter-spacing 0.2em | `--vn-ink-soft` |
| Mensagem pós-RSVP | Cormorant Garamond italic | 400 | `--vn-ink-soft` |
| Fechamento ("Conto com a sua presença.") | Cormorant Garamond italic | 400 | `--vn-gold` |
| Botões | Outfit | 500 | `--vn-sky-deep` sobre `--vn-gold` |

---

## BADGE DE DATA (layout obrigatório — replicar convite.png)

Componente visual central da seção de data. **Não** usar texto corrido como "19 de setembro de 2026".

### Conteúdo (evento: 19/09/2026, 19:00)
| Elemento | Valor | Observação |
|----------|-------|------------|
| Dia da semana | `Sábado` | Primeira letra maiúscula |
| Dia do mês | `19` | Número isolado, destaque principal |
| Ano | `2026` | À direita do dia |
| Mês | `SETEMBRO` | Maiúsculas, em arco abaixo do `19` |
| Horário | `às 19h` | Linha separada abaixo do badge, centralizada |

### Estrutura HTML sugerida
```html
<div class="date-badge" aria-label="Sábado, 19 de setembro de 2026, às 19 horas">
  <div class="date-badge__row">
    <span class="date-badge__line date-badge__line--left" aria-hidden="true"></span>
    <span class="date-badge__weekday">Sábado</span>
    <span class="date-badge__day">19</span>
    <span class="date-badge__year">2026</span>
    <span class="date-badge__line date-badge__line--right" aria-hidden="true"></span>
  </div>
  <svg class="date-badge__month-arc" viewBox="0 0 200 40" aria-hidden="true">
    <defs>
      <path id="month-arc-path" d="M 20 35 Q 100 5 180 35" fill="none" />
    </defs>
    <text>
      <textPath href="#month-arc-path" startOffset="50%" text-anchor="middle">SETEMBRO</textPath>
    </text>
  </svg>
  <div class="date-badge__line date-badge__line--bottom" aria-hidden="true"></div>
</div>
<p class="date-badge__time">às 19h</p>
```

### Layout visual (referência)
```
────────  Sábado    19    2026  ────────
                  SETEMBRO
              (texto em arco)
────────────── (linha inferior) ──────────
                 às 19h
```

### Regras de estilo
- **Linha superior:** duas linhas horizontais finas (`1px`, cor `--vn-ink` com `opacity: 0.45`) flanqueando a linha central; o número `19` quebra/sobrepõe a linha — a linha não passa por trás do dígito grande
- **Linha inferior:** mesma espessura, interrompida no centro para acomodar o arco do mês
- **Alinhamento:** `Sábado` e `2026` alinhados pela baseline com o `19`; o `19` é o elemento dominante (~`clamp(3rem, 12vw, 4.5rem)`)
- **Espaçamento:** gap horizontal entre weekday / day / year de `0.6em–1em`; mês em arco com `margin-top: -0.25em` para encaixar sob o `19`
- **Arco do mês:** preferir `<textPath>` em SVG para curva suave descendente; fallback CSS: `transform: rotate(-8deg)` por letra com `display: inline-flex` (menos ideal)
- **Responsivo mobile:** reduzir `19` para `clamp(2.4rem, 10vw, 3.2rem)`; manter proporções; linhas laterais podem encurtar (`max-width: 2.5rem` cada)
- **Acessibilidade:** `aria-label` no container com data completa legível; decorações com `aria-hidden="true"`

### Dados em `src/data/invite.js`
```js
export const event = {
  date: new Date('2026-09-19T19:00:00'),
  weekday: 'Sábado',
  day: 19,
  month: 'SETEMBRO',
  year: 2026,
  timeLabel: 'às 19h',
}
```
Opcional: derivar `weekday` e `month` via `Intl.DateTimeFormat('pt-BR', …)` a partir de `date`, mas `month` deve sair em **MAIÚSCULAS**.

---

## CAPA HERO (fullscreen + CTA + scroll)

A capa ocupa **toda a viewport visível** e funciona como tela de abertura antes do conteúdo em scroll.

### Dimensões e layout
| Regra | Valor |
|-------|-------|
| Altura | `min-height: 100dvh` (sempre — mobile, tablet e desktop) |
| Largura | `100%` do container da carta |
| Imagem | `capa.png` com `object-fit: cover; object-position: center 35%` |
| Logo | **Não usar** `k.webp` na capa — a imagem já contém a logo integrada |
| Overflow | `overflow: hidden` na capa; scroll acontece no `.letter-sheet` pai |
| Snap (opcional) | `scroll-snap-align: start` na capa para encaixar ao voltar |

### Rodapé da capa (fixo na base)
Elementos empilhados verticalmente, centralizados, com `position: absolute; bottom: 0; left: 0; right: 0`:
```
┌─────────────────────────────┐
│                             │
│         capa (sem logo extra) │
│                             │
│   [ Confirmar presença ]    │  ← botão popup (acima)
│            ↓                │  ← seta animada (abaixo)
│      (safe-area bottom)     │
└─────────────────────────────┘
```

### Botão do popup
| Propriedade | Valor |
|-------------|-------|
| Texto (pendente) | `Confirmar presença` |
| Texto (confirmado) | `Presença confirmada` — botão desabilitado, estilo `opacity: 0.7`, sem `@click` |
| Estilo | fundo `--vn-gold`, texto `--vn-sky-deep`, `border-radius: 999px` |
| Tamanho | `min-height: 44px`, padding `0.75rem 1.5rem` |
| Posição | centralizado, `margin-bottom: 0.75rem` acima da seta |
| Ação | `@click` → abre `InviteActionModal` **somente se RSVP não confirmado** |
| Acessibilidade | `aria-haspopup="dialog"`, `aria-controls="invite-action-modal"`, `aria-disabled` quando confirmado |

### Seta de scroll (abaixo do botão)
| Propriedade | Valor |
|-------------|-------|
| Ícone | chevron/arrow para baixo (SVG inline ou ícone CSS) |
| Cor | `--vn-gold-soft` com leve `drop-shadow` |
| Tamanho | `clamp(24px, 6vw, 32px)` |
| Animação contínua | `y: 0 → 8px → 0` em loop, `1.6s`, `sine.inOut` (GSAP ou CSS `@keyframes`) |
| Opacidade pulsante | `0.6 → 1 → 0.6` sincronizado com o bounce |
| Interação | `@click` ou `@keydown.enter` → scroll animado para a próxima seção |
| Acessibilidade | `<button type="button" aria-label="Rolar para o convite">` envolvendo a seta |
| Reduced motion | sem loop; seta estática, scroll instantâneo |

### Scroll animado ao clicar na seta
- **Alvo:** início da seção 2 (citação Van Gogh) — usar `ref` ou `#quote-section`
- **Implementação:** GSAP `scrollTo` no container `.letter-sheet` **ou** `element.scrollIntoView({ behavior: 'smooth' })` com fallback
- **Preferência:** instalar/usar `gsap/ScrollToPlugin` para controle de duração e easing:
  ```js
  gsap.to(sheetRef, {
    scrollTo: { y: quoteSection, offsetY: 0 },
    duration: 1.1,
    ease: 'power2.inOut',
  })
  ```
- **Duração:** `1.0–1.2s`, ease `power2.inOut`
- **Durante o scroll:** seta com `pointer-events: none` + `opacity: 0.4` para evitar cliques duplos
- **Ao sair da capa:** esconder seta e botão (`autoAlpha: 0`) quando capa sair da viewport (Intersection Observer, threshold 0.3)

### Estrutura HTML sugerida
```html
<section class="cover-hero" ref="coverRef" data-scroll-snap-align="start">
  <img class="cover-hero__image" :src="capaImage" alt="Convite Kamilly XV — Noite Estrelada" />

  <div class="cover-hero__footer">
    <button
      type="button"
      class="cover-hero__cta"
      :disabled="isRsvpConfirmed"
      :aria-disabled="isRsvpConfirmed"
      aria-haspopup="dialog"
      aria-controls="invite-action-modal"
      @click="openModal"
    >
      {{ isRsvpConfirmed ? 'Presença confirmada' : 'Confirmar presença' }}
    </button>

    <button
      type="button"
      class="cover-hero__scroll"
      aria-label="Rolar para o convite"
      @click="scrollToContent"
    >
      <svg class="cover-hero__arrow" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
    </button>
  </div>
</section>
```

### CSS sugerido (rodapé + safe area)
```css
.cover-hero {
  position: relative;
  min-height: 100dvh;
  width: 100%;
  overflow: hidden;
}

.cover-hero__footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
  z-index: 2;
}

.cover-hero__scroll {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vn-gold-soft);
}
```

### Comportamento no desktop (card centralizado)
- Capa continua `100dvh` **dentro do card** — primeira “tela” do scroll interno
- Botão e seta permanecem no rodapé da capa, não do viewport externo
- Scroll animado rola o `.letter-sheet` interno do card

---

## DRESS CODE (modal — círculo com espaço para cores)

Seção visual do popup (`InviteActionModal.vue`). O dress code **não** deve ser só texto corrido — incluir um **círculo ornamental** com o interior reservado para **amostras de cor** (bolinhas/swatch).

### Conteúdo
| Elemento | Valor | Observação |
|----------|-------|------------|
| Título | `Dress Code` | Outfit uppercase, `--vn-blue-mid` |
| Descrição | `Esporte fino em tons que remetam à Noite Estrelada.` | Cormorant, abaixo do círculo |
| Cores sugeridas | ver tabela abaixo | Bolinhas dentro do círculo |

### Paleta do dress code (bolinhas dentro do círculo)
| Cor | Hex | Nome (opcional, `title` no swatch) |
|-----|-----|-------------------------------------|
| Azul profundo | `#1a3a6c` | Azul noite |
| Azul médio | `#2d5a9e` | Azul Van Gogh |
| Dourado | `#d4a843` | Dourado |
| Creme | `#f5f0e8` | Neutro claro |
| Marinho | `#0a1c3d` | Azul escuro |

### Layout visual (referência)
```
              Dress Code

         ╭─────────────────╮
        ╱   ●           ●   ╲
       │  ●               ●  │
       │                     │   ← anel dourado fino
       │  ●               ●  │   ← bolinhas de cor no interior
        ╲   ●           ●   ╱
         ╰─────────────────╯

   Esporte fino em tons que remetam
        à Noite Estrelada.
```

### Regras de estilo
- **Círculo externo:** `border: 2px solid var(--vn-gold)`, `border-radius: 50%`, tamanho ~`clamp(140px, 38vw, 180px)`; fundo transparente ou `--vn-paper` com opacidade baixa
- **Interior vazio:** o centro do círculo fica **livre de texto** — apenas as bolinhas de cor ocupam o espaço interno
- **Bolinhas de cor:** 4–5 círculos (`width/height: clamp(22px, 6vw, 32px)`), `border-radius: 50%`, borda sutil `1px solid rgba(27, 45, 79, 0.15)`; dispostas em **anel interno** (posição absoluta ou `transform: rotate() translate()` em cada swatch)
- **Espaçamento:** padding interno mínimo `1.25rem` entre borda do círculo e as bolinhas — nunca colar na borda
- **Sem preencher o centro:** reservar ~40% do diâmetro central vazio (ou só com sombra suave), para as cores respirarem
- **Hover (desktop):** swatch com `scale(1.12)` + `box-shadow` dourado; exibir `title` com nome da cor
- **Responsivo:** no mobile, círculo pode reduzir para `120px`; bolinhas para `20px`; manter distribuição circular

### Estrutura HTML sugerida
```html
<section class="dress-code" aria-labelledby="dress-code-title">
  <h3 id="dress-code-title" class="dress-code__title">Dress Code</h3>

  <div class="dress-code__ring" role="img" aria-label="Cores sugeridas: azul noite, azul Van Gogh, dourado, creme e marinho">
    <ul class="dress-code__swatches">
      <li
        v-for="(color, index) in dressCode.colors"
        :key="color.hex"
        class="dress-code__swatch"
        :style="{ '--swatch-color': color.hex, '--swatch-index': index }"
        :title="color.label"
      />
    </ul>
  </div>

  <p class="dress-code__description">{{ dressCode.description }}</p>
</section>
```

### CSS sugerido (posicionamento circular das bolinhas)
```css
.dress-code__ring {
  position: relative;
  width: clamp(140px, 38vw, 180px);
  aspect-ratio: 1;
  margin-inline: auto;
  border: 2px solid var(--vn-gold);
  border-radius: 50%;
}

.dress-code__swatches {
  position: absolute;
  inset: 18%;
  list-style: none;
  margin: 0;
  padding: 0;
}

.dress-code__swatch {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(22px, 6vw, 32px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--swatch-color);
  border: 1px solid rgba(27, 45, 79, 0.15);
  transform:
    rotate(calc(var(--swatch-index) * (360deg / var(--swatch-count, 5))))
    translateY(-72%)
    rotate(calc(var(--swatch-index) * (-360deg / var(--swatch-count, 5))));
}
```

### Dados em `src/data/invite.js`
```js
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
```

### No modal
- Dress code **acima** do formulário RSVP, separados por divisor dourado
- Animação de entrada: círculo `scale: 0.85→1` + swatches com `stagger` leve (0.05s cada)
- Acessibilidade: `aria-label` no anel com lista de cores; cada swatch com `title` descritivo

---

## RSVP (formulário + persistência)

Componente `RsvpForm.vue` dentro de `InviteActionModal.vue`.

### Campos
| Campo | Tipo | Obrigatório | Observação |
|-------|------|-------------|------------|
| Nome | `text` | Sim | Label: `Seu nome` |
| Quantidade de pessoas | `number` | Sim | Mínimo `1`, máximo razoável `10` |
| Tem criança? | `radio` (`Sim` / `Não`) | Sim | Label: `Vai trazer criança?` |
| Nome da criança | `text` | Condicional | Visível e obrigatório **somente** se `Tem criança? = Sim` |

### Validação
- **Nome:** obrigatório, `trim()`, mínimo 2 caracteres — mensagem: `Informe seu nome.`
- **Quantidade:** obrigatório, deve ser número inteiro ≥ 1 — mensagem: `Informe quantas pessoas virão.`
- **Tem criança?:** obrigatório (um dos radios deve estar selecionado) — mensagem: `Selecione se haverá criança.`
- **Nome da criança:** obrigatório quando `hasChild === true` — mensagem: `Informe o nome da criança.`
- Exibir erros abaixo de cada campo; não submeter se inválido
- Botão submit: `Confirmar presença` — desabilitado durante envio

### Após confirmar (sucesso)
1. Salvar dados no `localStorage` (ver chaves abaixo)
2. Exibir mensagem de sucesso no modal: `Obrigado! Sua presença foi confirmada.` + *"Conto com a sua presença."* em Cormorant italic
3. Fechar modal automaticamente após ~2.5s **ou** botão `Fechar`
4. Modal **nunca mais reabre** (nem por botão, nem por scroll, nem programaticamente)
5. Botão da capa muda para `Presença confirmada` (desabilitado)
6. Formulário não é exibido novamente — substituir por estado de confirmação se modal for forçado (não deve ocorrer)

### Persistência (`localStorage`)
```js
// Chaves
const RSVP_STORAGE_KEY = 'kamilly_rsvp'

// Estrutura salva
{
  confirmed: true,
  name: 'Maria Silva',
  guestCount: 3,
  hasChild: true,
  childName: 'João',
  confirmedAt: '2026-09-01T21:00:00.000Z', // ISO string
}
```

### Helpers em `src/data/invite.js`
```js
export const RSVP_STORAGE_KEY = 'kamilly_rsvp'

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
  localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify({
    ...payload,
    confirmed: true,
    confirmedAt: new Date().toISOString(),
  }))
}
```

### Ao carregar a página
- Ler `localStorage` no `onMounted` de `Letter.vue`
- Se `confirmed === true`: botão da capa já em estado `Presença confirmada`; não registrar listeners de abertura de modal

---

## REGRAS DOS POPUPS

| Regra | Comportamento |
|-------|---------------|
| Abertura automática | **Não** — remover popup aos 500ms após `presentInvite()` |
| Abertura manual | **Somente** via botão `Confirmar presença` na capa |
| Popup no fim do scroll | **Removido** — não usar Intersection Observer no final |
| Após RSVP confirmado | Modal **nunca** reabre; botão desabilitado |
| Fechar sem confirmar | Usuário pode fechar (X / overlay); pode reabrir clicando no botão novamente |
| Reabrir após confirmar | **Bloqueado** — `openModal()` retorna early se `isRsvpConfirmed()` |

---

## LOCALIZAÇÃO

### Conteúdo
| Elemento | Valor |
|----------|-------|
| Endereço principal | `R. José do Carmo Sanches, Votorantim` |
| Texto complementar | Configurável em `invite.js` (`location.note`) — ex.: ponto de referência, orientações de acesso |
| Botão | `Ver no mapa` |

### Botão "Ver no mapa"
- **Mobile:** abrir app Google Maps (`https://maps.google.com/maps?q=...` ou `geo:` URI)
- **Desktop:** abrir Google Maps no navegador (nova aba `target="_blank" rel="noopener"`)
- URL sugerida: `https://www.google.com/maps/search/?api=1&query=R.+José+do+Carmo+Sanches,+Votorantim`
- Ícone opcional de pin ao lado do texto

### Dados em `src/data/invite.js`
```js
export const location = {
  address: 'R. José do Carmo Sanches, Votorantim',
  note: '', // preencher com texto complementar quando disponível
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=R.+José+do+Carmo+Sanches,+Votorantim',
  mapsLabel: 'Ver no mapa',
}
```

### Layout
- Endereço em Cormorant, centralizado
- Texto complementar em `--vn-ink-soft`, menor, abaixo do endereço
- Botão secundário (outline dourado ou link com ícone), `min-height: 44px`

---

## DICAS PARA PRESENTES

Seção informativa — tom acolhedor, sem obrigatoriedade.

### Tamanhos
| Item | Valor |
|------|-------|
| Sapato | `36` |
| Camiseta | `P` |
| Calça | `38 a 40` |

### Sugestões de presentes (lista)
- Perfumes: mais floral, floral amadeirado e cheiros suaves
- Maquiagem
- Produtos para cabelo
- Ursos de pelúcia
- Acessórios
- Esmaltes
- Brinquedos

### Layout
- Título da seção: `Dicas para presentes` (Outfit label)
- Bloco de tamanhos em 3 linhas (label + valor)
- Lista de sugestões com marcadores dourados ou bullets customizados
- Agrupar perfumes em sub-item com as 3 variações

### Dados em `src/data/invite.js`
```js
export const gifts = {
  title: 'Dicas para presentes',
  sizes: [
    { label: 'Sapato', value: '36' },
    { label: 'Camiseta', value: 'P' },
    { label: 'Calça', value: '38 a 40' },
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
    'Esmaltes',
    'Brinquedos',
  ],
}
```

---

## COUNTDOWN

Contagem regressiva em tempo real até **19/09/2026 às 19:00** (fuso `America/Sao_Paulo`).

### Unidades (obrigatórias)
| Unidade | Label |
|---------|-------|
| Dias | `dias` |
| Horas | `horas` |
| Minutos | `min` |
| Segundos | `seg` |

### Comportamento
- Atualizar a cada segundo
- Exibir sempre os 4 blocos, mesmo quando valor = 0
- Animação de tick apenas no dígito que mudou (scale `1.08→1`)
- `aria-live="polite"` no container

### Dados
```js
export const event = {
  // ...
  targetISO: '2026-09-19T19:00:00-03:00',
  timezone: 'America/Sao_Paulo',
}
```

---

## RITMO VISUAL ENTRE SEÇÕES

### Divisores dourados
- Inserir **entre cada seção** do conteúdo (após capa, entre citação → amor → nome → data → countdown → local → presentes → galeria)
- Estilo: linha horizontal `--vn-gradient-gold-line` com **losango** dourado central (CSS ou `starry-night-divider.webp`)
- Animação ao revelar: `scaleX: 0→1`, `transform-origin: center`, 0.5s
- Componente: `GoldDivider.vue` reutilizável

### Espaçamento
- `padding-block` entre seções: `clamp(2rem, 6vw, 3rem)`
- Divisor com `margin-block: 1.5rem`

### Fechamento pós-RSVP
- Texto *"Conto com a sua presença."* — Great Vibes ou Cormorant italic, `--vn-ink-soft`
- Exibir **somente após** envio bem-sucedido do formulário, dentro do modal (substitui o form)
- **Não** exibir no scroll principal antes da confirmação

---

## MOLDURA DA CARTA

A carta deve ter moldura ornamental inspirada em `convite.png`.

### Comportamento
- Moldura **rola junto com o conteúdo** até o final — não é fixa na viewport
- Implementação: wrapper `.letter-framed` envolvendo todo o `.letter-sheet` com overlay de moldura
- Asset: `starry-night-frame.webp` (ou CSS border ornamental como fallback)
- Moldura com `pointer-events: none`, posicionada sobre o papel
- A moldura cresce em altura conforme o conteúdo (`min-height: 100%` do wrapper)

### Estrutura sugerida
```html
<div class="letter-framed">
  <div class="letter-sheet" ref="letterSheetRef">
    <!-- todas as seções + capa -->
  </div>
  <img class="letter-frame" src="starry-night-frame.webp" alt="" aria-hidden="true" />
</div>
```

### CSS
```css
.letter-framed {
  position: relative;
}

.letter-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill; /* estica verticalmente com o conteúdo */
  pointer-events: none;
  z-index: 2;
}

.letter-sheet {
  position: relative;
  z-index: 1;
  padding: clamp(1.5rem, 5vw, 2.5rem); /* respiro interno da moldura */
}
```

---

## MÚSICA AMBIENTE

Trilha suave de fundo no estilo Noite Estrelada / clássica instrumental.

### Comportamento
| Regra | Valor |
|-------|-------|
| Arquivo | `src/assets/ambient.mp3` (ou `.ogg` fallback) — usuário fornece ou placeholder |
| Autoplay | **Não** forçar — iniciar após primeira interação do usuário (click na capa, botão ou seta) |
| Controle | Botão flutuante fixo (canto inferior direito): ícone 🔊 / 🔇 alternando |
| Volume padrão | `0.25`–`0.35` |
| Loop | `true` |
| Persistência | Salvar preferência mútua em `localStorage` (`ambient_muted: true/false`) |
| Reduced motion | respeitar — se ativo, não iniciar automaticamente mesmo após interação |
| iOS | usar `audio.play().catch()` — falha silenciosa se bloqueado |

### Componente
- `src/components/AmbientMusic.vue` — `<audio>` + botão toggle
- Posição: `position: fixed; bottom: max(1rem, safe-area); right: max(1rem, safe-area); z-index: 50`
- Estilo do botão: círculo `--vn-sky-deep` com ícone `--vn-gold`, `44×44px`
- Não sobrepor o botão da capa na primeira tela — ajustar `bottom` quando capa visível ou integrar na capa

### Acessibilidade
- `aria-label`: `Ativar música ambiente` / `Desativar música ambiente`
- `aria-pressed` no toggle

---

## GERAÇÃO E USO DE ASSETS

### Assets obrigatórios (já existentes — NÃO substituir)
- `src/assets/capa.png` — hero da capa (céu + logo integrada)
- `src/assets/convite.png` — referência visual mestre (layout, proporções, moldura)
- `src/assets/k.webp` — logo K XV isolada (usar **apenas** no header do modal — **não** na capa)

### Assets a gerar (salvar em `src/assets/`, formato WebP, otimizado)

| Arquivo | Descrição do prompt para IA (Gemini/Nano Banana/DALL·E) | Dimensões | Fundo |
|---------|----------------------------------------------------------|-----------|-------|
| `starry-night-paper.webp` | Textura de papel aquarela/algodão off-white com fibras sutis, tom creme #f5f0e8, sem texto | 1024×1024 tileável | opaco |
| `starry-night-frame.webp` | Moldura ornamental inspirada em convite.png: borda oval com pinceladas azuis Van Gogh, estrelas douradas nos cantos, filigrana dourada, centro transparente/vazio | 800×1200 | transparente no centro |
| `starry-night-swirl.webp` | Pincelada isolada de redemoinho azul com estrelas, estilo impasto Van Gogh | 600×600 | transparente |
| `starry-night-swirl-tr.webp` | Mesmo swirl, canto superior direito com lua crescente amarela | 600×600 | transparente |
| `starry-night-star.webp` | Estrela de 8 pontas dourada com halo suave | 128×128 | transparente |
| `starry-night-divider.webp` | Linha horizontal dourada com losango central (opcional, pode ser CSS) | 400×24 | transparente |

### Prompt base para geração (adaptar por asset)
```
Post-impressionist oil painting texture in the style of Van Gogh's Starry Night.
Thick impasto brushstrokes, swirling cobalt and ultramarine blues (#1a3a6c, #2d5a9e),
golden yellow accents (#d4a843, #ffd660), no text, no faces, no copyright elements.
High resolution, seamless where noted, PNG/WebP output.
```

### Como usar cada asset no código
| Asset | Onde aplicar | CSS |
|-------|-------------|-----|
| `capa.png` | Seção 1 hero fullscreen | `object-fit: cover; object-position: center 35%; min-height: 100dvh` — sem logo extra |
| `k.webp` | Header do modal apenas | `<img>` com `drop-shadow` dourado |
| `ambient.mp3` | Música ambiente (`AmbientMusic.vue`) | loop, volume baixo, toggle pelo usuário |
| `starry-night-paper.webp` | Fundo da `.letter-sheet` | `background-size: cover; opacity: 0.12–0.18; mix-blend-mode: multiply` |
| `starry-night-frame.webp` | Moldura da carta (rola com conteúdo) | wrapper `.letter-framed`; `height: 100%`, `object-fit: fill` |
| `starry-night-swirl.webp` | Cantos do backdrop e seções | posicionado absoluto, `opacity: 0.35–0.45`, `mix-blend-mode: screen` |
| `starry-night-swirl-tr.webp` | Canto superior direito da capa | `rotate` conforme necessário |
| `convite.png` | Apenas referência de design — NÃO usar como `<img>` final | — |

### Galeria (`src/assets/gallery/`)
- Fotos reais da Kamilly em JPG/WebP, max 800px largura
- Se vazio: 4–6 placeholders com borda dourada e fundo `--vn-cream`
- Config de posição em `src/data/gallery.js`

### Otimização
- WebP quality 80–85
- Lazy loading: `loading="lazy"` nas fotos da galeria
- `srcset` para capa em telas retina (opcional)

---

## ANIMAÇÕES (GSAP — manter padrão existente)

### Princípios
- Usar apenas `transform` e `opacity` (GPU-friendly)
- `force3D: true` em animações contínuas
- Sempre checar `prefers-reduced-motion`: pular ou simplificar
- Matar timelines no `onUnmounted` (padrão atual do Letter.vue)
- Não quebrar sequência do envelope em `EnvelopeScene.vue`

### 1. Abertura do convite (já existente — preservar)
| Animação | Trigger | Propriedades | Duração | Ease |
|----------|---------|-------------|---------|------|
| Backdrop fade | `presentInvite()` | `autoAlpha: 0→1` | 0.95s | power2.out |
| Content reveal | `playContentReveal()` | `autoAlpha: 0→1, y: 18→0` | 0.72s, stagger 0.1s | power3.out |
| Sparkles pop | `playSparkles()` | `scale: 0.35→1, autoAlpha: 0→0.9` | 0.45s, stagger 0.03s | power2.out |
| Sparkles float | após pop (só desktop) | `y: -=5, autoAlpha yoyo` | 1.5s loop | sine.inOut |

### 1b. Capa hero — seta e scroll (novo)
| Animação | Trigger | Propriedades | Duração | Ease |
|----------|---------|-------------|---------|------|
| Seta bounce | loop contínuo na capa visível | `y: 0→8→0`, `opacity: 0.6→1→0.6` | 1.6s loop | sine.inOut |
| Scroll para conteúdo | click na seta | `scrollTo` no `.letter-sheet` até seção 2 | 1.1s | power2.inOut |
| Footer fade out | capa sai da viewport (IO threshold 0.3) | `autoAlpha: 1→0` | 0.35s | power2.out |
| Footer fade in | usuário volta ao topo da capa | `autoAlpha: 0→1` | 0.35s | power2.out |
| CTA hover | pointer enter no botão | `scale: 1.03`, `box-shadow` dourado | 0.2s | power2.out |

### 2. Popup modal
| Animação | Trigger | Propriedades | Duração | Ease |
|----------|---------|-------------|---------|------|
| Overlay | abrir modal (só via botão) | `autoAlpha: 0→1` | 0.35s | power2.out |
| Modal scale | abrir modal | `scale: 0.92→1, autoAlpha: 0→1` | 0.45s | back.out(1.4) |
| Fechar | X / após sucesso RSVP | inverso | 0.3s | power2.in |
| Sucesso RSVP | submit válido | mensagem fade in + *"Conto com a sua presença."* | 0.5s | power2.out |

### 3. Scroll reveal por seção (novo — opcional com ScrollTrigger ou Intersection Observer + GSAP)
| Animação | Trigger | Propriedades | Duração |
|----------|---------|-------------|---------|
| Seção entra | elemento `[data-scroll-reveal]` entra na viewport (threshold 0.2) | `autoAlpha: 0→1, y: 28→0` | 0.65s |
| Stagger interno | filhos da seção | stagger 0.08s | — |

Aplicar em: citação, texto, nome, data, countdown, local, presentes, galeria.

### 4. Countdown
| Animação | Trigger | Efeito |
|----------|---------|--------|
| Tick de segundos | a cada segundo | número de **seg** que muda: `scale: 1.08→1` em 0.2s |
| Tick de minutos/horas/dias | quando unidade muda | mesmo efeito no bloco correspondente |
| Bloco inteiro | ao entrar na viewport | fade + slide up (scroll reveal) |
| Unidades exibidas | sempre | dias · horas · min · seg (4 colunas desktop, 2×2 mobile) |

### 5. Galeria — fotos soltas (novo)
| Animação | Trigger | Propriedades | Notas |
|----------|---------|-------------|-------|
| Entrada | scroll reveal | `autoAlpha: 0→1, rotate: ±3° extra→final, scale: 0.9→1` | stagger por foto 0.12s |
| Float sutil | loop (desktop only) | `y: ±4px` yoyo 3–5s | cada foto com delay diferente |
| Hover/tap | pointer enter | `scale: 1.04, z-index +1` | 0.25s |
| Lightbox | click na foto | overlay fade + imagem scale 0.9→1 | opcional |

### 6. Divisores e ornamentos
- Divisores dourados: `scaleX: 0→1` com `transform-origin: center` ao revelar seção
- Estrelas decorativas nos cantos: rotação lenta `rotation: 360` em 24s (só desktop, reduced motion off)

### O que NÃO animar
- Texto do countdown a cada minuto (só o dígito que mudou)
- Background images / texturas
- Scroll manual do usuário (apenas o scroll **programático** da seta usa GSAP)

---

## RESPONSIVIDADE

### Breakpoints
| Nome | Largura | Comportamento |
|------|---------|---------------|
| Mobile | `≤ 768px` | Fullscreen (`isExpanded`), edge-to-edge |
| Tablet | `769px – 1024px` | Card centralizado `min(88vw, 420px)` |
| Desktop | `> 1024px` | Card centralizado `min(92vw, 440px)` |

### Desktop / Tablet (`isCentered`, não expanded)
- Carta flutuando no centro com backdrop escuro (céu estrelado)
- `letter-mouth`: `display: flex; align-items: center; justify-content: center`
- Card: `width: min(92vw, 440px)`, `border-radius: 8px`, sombra profunda
- Scroll interno na carta; capa ocupa a 1ª “tela” inteira (`100dvh` do card)
- Botão e seta da capa fixos no rodapé da hero, não do viewport externo
- Sparkles com animação float completa
- Galeria: 5–8 fotos visíveis, container `min-height: 580px`
- Modal: `max-width: 400px`, centralizado

### Mobile (`isCentered` + `isExpanded`)
- Carta ocupa `100dvh` × `100vw`, sem border-radius, sem sombra externa
- `letter-sheet`: `min-height: 100dvh`, scroll vertical nativo
- Safe areas em todo padding:
  ```css
  padding:
    max(1.25rem, env(safe-area-inset-top))
    max(1.1rem, env(safe-area-inset-right))
    max(1.5rem, env(safe-area-inset-bottom))
    max(1.1rem, env(safe-area-inset-left));
  ```
- Capa hero: **`min-height: 100dvh`** — sem `k.webp` sobreposta
- Rodapé da capa: botão popup + seta com `padding-bottom: max(1.25rem, safe-area-inset-bottom)`
- Sparkles: animação pop only (sem float loop — já é o padrão atual)
- Galeria: 3–5 fotos, container `min-height: 420px`, fotos menores (`scale: 0.75–0.9`)
- Modal: bottom sheet style (`align-items: flex-end`) ou fullscreen com scroll interno
- Botões e inputs: min-height 44px (touch target)
- `overscroll-behavior: none` no container principal (evitar bounce no iOS)

### Countdown responsivo
```
Desktop:  [ 18 ] dias  [ 04 ] horas  [ 32 ] min  [ 15 ] seg  (4 colunas)
Mobile:   2×2 grid ou linha única com separadores · 
Números:  clamp(1.8rem, 6vw, 2.8rem)
Labels:   0.65rem, uppercase
```

### Galeria responsiva (fotos soltas — NUNCA grid)
```js
// src/data/gallery.js — exemplo de posições
// Desktop positions (percentuais do container)
// Mobile: mesmas entradas com override em `mobile: { top, left, rotate, scale }`
```
- Container: `position: relative; width: 100%; overflow: visible`
- Cada foto: `position: absolute; transform: rotate(Xdeg) scale(Y)`
- Mobile: reduzir `scale` em ~15%, evitar fotos cortadas nas bordas (`left/top` entre 5%–85%)

### Modal responsivo
| | Desktop | Mobile |
|---|---------|--------|
| Largura | `min(92vw, 400px)` | `100%` ou `100% - 1rem` |
| Posição | centro | bottom sheet ou centro com max-height 90dvh |
| Padding | 1.5rem | `max(1.25rem, safe-area)` |
| Fechar | X canto superior | X + swipe down opcional |

### Performance mobile
- `contain: layout paint` no card durante animação de saída do envelope
- `will-change: transform` só durante animações ativas; remover depois
- Máximo 12 sparkles no mobile (18 no desktop)
- Imagens da galeria: `decoding="async"`
- Evitar `backdrop-filter: blur()` no mobile (usar `rgba` sólido)

### Acessibilidade responsiva
- `font-size` mínimo 16px em inputs (evita zoom iOS)
- Foco visível: `outline: 2px solid var(--vn-gold)` em botões e links
- Modal: trap focus, fechar com ESC, `aria-modal="true"`
- Galeria: `alt` descritivo em cada foto
- Countdown: `aria-live="polite"` no container (atualiza sem anunciar a cada segundo)

---

## COMPONENTES A CRIAR

- `src/components/Letter.vue` — layout completo com todas as seções (capa hero, moldura, divisores)
- `src/components/InviteActionModal.vue` — popup Dress Code + RSVP (abre só via botão)
- `src/components/RsvpForm.vue` — formulário RSVP com validação e estado de sucesso
- `src/components/DateBadge.vue` — badge ornamental da data
- `src/components/CountdownBlock.vue` — contagem regressiva (dias, horas, min, seg)
- `src/components/GoldDivider.vue` — divisor dourado com losango
- `src/components/FloatingGallery.vue` — galeria solta
- `src/components/AmbientMusic.vue` — música ambiente com toggle
- `src/data/invite.js` — evento, dress code, localização, presentes, helpers RSVP
- `src/data/gallery.js` — posições das fotos (desktop + mobile overrides)

## INTEGRAÇÃO

- Manter `defineExpose` e props para `EnvelopeScene.vue`
- GSAP: registrar `ScrollToPlugin` para scroll animado da seta (`gsap.registerPlugin(ScrollToPlugin)`)
- RSVP: `localStorage` via `RSVP_STORAGE_KEY` (`kamilly_rsvp`) — ver seção RSVP
- Música: `localStorage` `ambient_muted` para preferência do usuário
- **Sem** popup automático nem popup no fim do scroll
- `npm run build` sem erros
- Código em inglês, textos da UI em português

---

## Resumo visual da hierarquia de cores

```
CEU (fundo)          PAPEL (carta)         ACENTOS
#061229         #f5f0e8          #d4a843  dourado
#0a1c3d         #fffaf4          #ffd660  estrelas
#1a3a6c         #ebe4d8          #ffb84d  lua
                                             
TEXTO                TEXTO SECUNDÁRIO
#1b2d4f         #3d5278
```