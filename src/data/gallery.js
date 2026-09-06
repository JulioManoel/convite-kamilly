import foto1 from '../assets/gallery/foto1.webp'
import foto2 from '../assets/gallery/foto2.webp'
import foto3 from '../assets/gallery/foto3.webp'
import foto4 from '../assets/gallery/foto4.webp'
import foto5 from '../assets/gallery/foto5.webp'
import foto6 from '../assets/gallery/foto6.webp'
import foto7 from '../assets/gallery/foto7.webp'

/**
 * Gallery rows — images from `src/assets/gallery/`.
 * Leave `caption` empty to keep the polaroid white footer without text.
 * Layout: 2 / 3 / 2 — scattered “thrown” look via rotate + nudge.
 */
export const galleryRows = [
  {
    id: 'row-1',
    photos: [
      {
        id: 'photo-1',
        src: foto1,
        alt: 'Kamilly — momento especial',
        caption: '',
        rotate: -8,
        nudgeX: -6,
        nudgeY: 10,
      },
      {
        id: 'photo-2',
        src: foto2,
        alt: 'Kamilly — sorriso',
        caption: '',
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
        src: foto3,
        alt: 'Kamilly — celebração',
        caption: '',
        rotate: 5,
        nudgeX: -10,
        nudgeY: 6,
      },
      {
        id: 'photo-4',
        src: foto4,
        alt: 'Kamilly — memória',
        caption: '',
        rotate: -3,
        nudgeX: 0,
        nudgeY: -12,
      },
      {
        id: 'photo-5',
        src: foto5,
        alt: 'Kamilly — alegria',
        caption: '',
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
        src: foto6,
        alt: 'Kamilly — amizade',
        caption: '',
        rotate: -6,
        nudgeX: -4,
        nudgeY: -6,
      },
      {
        id: 'photo-7',
        src: foto7,
        alt: 'Kamilly — festa',
        caption: '',
        rotate: 4,
        nudgeX: 12,
        nudgeY: 10,
      },
    ],
  },
]
