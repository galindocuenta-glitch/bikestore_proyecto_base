import type { SyntheticEvent } from 'react'
import bikeFallback from './assets/bike1.png'
import mountainBikeFallback from './assets/catalog/terrain/terrain-1.png'
import roadBikeFallback from './imports/Nova-Specialiazed-epic-2018-full-suspension.jpg'
import electricBikeFallback from './assets/catalog/bike-58.png'
import kidsBikeFallback from './assets/catalog/bike-66.png'
import cockpitHandlebar from './assets/parts/cockpit/product-1.png'
import cockpitStem from './assets/parts/cockpit/product-2.png'
import cockpitGrips from './assets/parts/cockpit/product-3.png'
import cockpitSaddle from './assets/parts/cockpit/product-4.png'
import { WHEEL_PHOTOS } from './parts-images'

const unsplash = (photoId: string, width = 800) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`

export const BIKE_IMAGE_LIBRARY = {
  mountain: [
    unsplash('1779114690396-a1115352c0cb'),
    unsplash('1779114690484-52eaf85f2a56'),
    unsplash('1780004189175-202169141544'),
  ],
  road: [
    unsplash('1532298229144-0ec0c57515c7'),
    unsplash('1496147433903-1e62fdb6f4be'),
    unsplash('1487803836022-91054ca05fdd'),
  ],
  urban: [
    unsplash('1501147830916-ce44a6359892'),
    unsplash('1505705694340-019e1e335916'),
  ],
  electric: [
    unsplash('1563990308267-cd6d3cc09318'),
    unsplash('1613937104213-913b11eb76a4'),
  ],
  kids: [
    unsplash('1759167582219-eac8eebd60ba'),
    unsplash('1768821766755-6bbaaea5341e'),
  ],
} as const

export const bikeMediaLibrary = {
  mtb: BIKE_IMAGE_LIBRARY.mountain,
  ruta: BIKE_IMAGE_LIBRARY.road,
  urbana: BIKE_IMAGE_LIBRARY.urban,
  electrica: BIKE_IMAGE_LIBRARY.electric,
  infantil: BIKE_IMAGE_LIBRARY.kids,
  repuestos: [
    { id: 'rep-1', nombre: 'Transmisión y Desviador', url: unsplash('1662990472483-e18e8d479134') },
    { id: 'rep-2', nombre: 'Disco de Freno y Cassette', url: unsplash('1715942475017-d779a5fa4830') },
    { id: 'rep-3', nombre: 'Rines y Cubiertas', url: unsplash('1532298229144-0ec0c57515c7') },
    { id: 'rep-4', nombre: 'Plato y Cadena MTB', url: unsplash('1576435728678-68d0fbf94e91') },
  ],
  accesorios: [
    { id: 'acc-1', nombre: 'Casco de Ruta / Aero', url: unsplash('1605051972583-9b09d3b4b5c7') },
    { id: 'acc-2', nombre: 'Guantes y Gafas de Ciclismo', url: unsplash('1640244795325-1e3df6a1b26c') },
    { id: 'acc-3', nombre: 'Herramientas y Mantenimiento', url: unsplash('1485965120184-e220f721d03e') },
  ],
} as const

const partImage = (photoId: string, width = 600) => unsplash(photoId, width)

export const PART_IMAGE_LIBRARY = {
  wheels: WHEEL_PHOTOS.map((group) => group.map(({ img }) => img)),
  tires: WHEEL_PHOTOS[0].map(({ img }) => img),
  rims: WHEEL_PHOTOS[1].map(({ img }) => img),
  tubes: WHEEL_PHOTOS[2].map(({ img }) => img),
  tubeless: WHEEL_PHOTOS[3].map(({ img }) => img),
  transmission: [
    partImage('1517263975512-e1e9172f466b'),
    partImage('1625242825294-dcc908480fae'),
    partImage('1687640977275-3bd12cb1ddce'),
    partImage('1661453444174-105f3bfebca7'),
  ],
  brakes: [
    partImage('1637289031879-dc6acc591e3f'),
    partImage('1639745159169-db1d3c0cfe78'),
    partImage('1649498936735-27af90c73259'),
    partImage('1617307327024-14c0a02125fd'),
  ],
  suspension: [
    partImage('1727281623511-e85c1c34d151'),
    partImage('1636925281365-f82e35b7e1c7'),
    partImage('1638194216708-fb57a1bf7cf7'),
    partImage('1614675498441-693649a7df6d'),
  ],
  cockpit: [cockpitHandlebar, cockpitStem, cockpitGrips, cockpitSaddle],
  electric: [
    partImage('1669183013484-88ecafacc5f3'),
    partImage('1700705581209-0c207be805ed'),
    partImage('1700792746333-0402b7893b55'),
    partImage('1763041821558-13fb6264be3f'),
  ],
  covers: {
    tires: WHEEL_PHOTOS[0][0].img,
    transmission: partImage('1517263975512-e1e9172f466b', 900),
    brakes: partImage('1637289031879-dc6acc591e3f', 900),
    suspension: partImage('1570539589648-51a594f1676d', 900),
    cockpit: cockpitSaddle,
    electric: partImage('1763041821558-13fb6264be3f', 900),
  },
} as const

const bikeFallbacks: Record<string, string> = {
  'todo terreno': mountainBikeFallback,
  ruta: roadBikeFallback,
  urbana: bikeFallback,
  'ciudad y paseo': bikeFallback,
  urbana: bikeFallback,
  eléctrica: electricBikeFallback,
  electrica: electricBikeFallback,
  infantil: kidsBikeFallback,
  repuestos: bikeFallback,
  accesorios: bikeFallback,
}

const partFallbacks: Record<string, string> = {
  'llantas y rines': WHEEL_PHOTOS[0][0].img,
  transmisión: bikeFallback,
  transmision: bikeFallback,
  frenos: bikeFallback,
  suspensión: bikeFallback,
  suspension: bikeFallback,
  'sillines y cockpit': cockpitSaddle,
  'componentes eléctricos': bikeFallback,
  'componentes electricos': bikeFallback,
}

export function getBikeCategoryImage(category: string | null | undefined): string {
  const normalized = (category ?? '').trim().toLocaleLowerCase('es')
  if (normalized.includes('repuesto')) return bikeMediaLibrary.repuestos[0].url
  if (normalized.includes('accesorio')) return bikeMediaLibrary.accesorios[0].url
  if (normalized.includes('ruta')) return bikeMediaLibrary.ruta[0]
  if (normalized.includes('eléctr') || normalized.includes('electric')) return bikeMediaLibrary.electrica[0]
  if (normalized.includes('infantil') || normalized.includes('niñ')) return bikeMediaLibrary.infantil[0]
  if (normalized.includes('urb')) return bikeMediaLibrary.urbana[0]
  return bikeMediaLibrary.mtb[0]
}

export function getBikeImageFallback(category: string | null | undefined): string {
  return bikeFallbacks[(category ?? '').trim().toLocaleLowerCase('es')] ?? bikeFallback
}

export function getPartImageFallback(category: string | null | undefined): string {
  return partFallbacks[(category ?? '').trim().toLocaleLowerCase('es')] ?? bikeFallback
}

export function getWheelImageFallback(typeIndex: number): string {
  return PART_IMAGE_LIBRARY.wheels[typeIndex]?.[0] ?? PART_IMAGE_LIBRARY.tires[0]
}

export function handleImageFallback(
  event: SyntheticEvent<HTMLImageElement>,
  fallback: string,
): void {
  const image = event.currentTarget
  const fallbackUrl = new URL(fallback, document.baseURI).href
  if (image.src !== fallbackUrl) image.src = fallback
}
