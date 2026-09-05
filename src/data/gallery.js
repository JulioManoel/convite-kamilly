/**
 * Gallery rows — put files in `public/gallery/` and set `src` like `/gallery/photo-1.webp`.
 * Leave `src` empty to keep the cream placeholder.
 * `caption` appears in the polaroid white footer (edit freely).
 * Layout: 2 / 3 / 2 — scattered “thrown” look via rotate + nudge.
 */
export const galleryRows = [
  {
    id: 'row-1',
    photos: [
      {
        id: 'photo-1',
        src: '',
        alt: 'Kamilly — momento especial',
        caption: 'Um novo capítulo',
        rotate: -8,
        nudgeX: -6,
        nudgeY: 10,
      },
      {
        id: 'photo-2',
        src: '',
        alt: 'Kamilly — sorriso',
        caption: 'Sorrisos que iluminam',
        rotate: 7,
        nudgeX: 8,
        nudgeY: -4,
      },
    ],
  },
  {
    id: 'row-2',
    photos: [
      {
        id: 'photo-3',
        src: '',
        alt: 'Kamilly — celebração',
        caption: 'Noite estrelada',
        rotate: 5,
        nudgeX: -10,
        nudgeY: 6,
      },
      {
        id: 'photo-4',
        src: '',
        alt: 'Kamilly — memória',
        caption: 'Memórias douradas',
        rotate: -3,
        nudgeX: 0,
        nudgeY: -12,
      },
      {
        id: 'photo-5',
        src: '',
        alt: 'Kamilly — alegria',
        caption: '15 anos de luz',
        rotate: 9,
        nudgeX: 10,
        nudgeY: 8,
      },
    ],
  },
  {
    id: 'row-3',
    photos: [
      {
        id: 'photo-6',
        src: '',
        alt: 'Kamilly — amizade',
        caption: 'Com quem amo',
        rotate: -6,
        nudgeX: -4,
        nudgeY: -6,
      },
      {
        id: 'photo-7',
        src: '',
        alt: 'Kamilly — festa',
        caption: 'Vem celebrar',
        rotate: 4,
        nudgeX: 12,
        nudgeY: 10,
      },
    ],
  },
]
