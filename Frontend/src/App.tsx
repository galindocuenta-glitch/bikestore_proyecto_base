import React, { useState, useEffect, useRef } from 'react'
import logoImg from './assets/logo-user.png'
import footerLogoImg from './assets/logo-user.png'
import bike1Img from './assets/bike1.png'
import terrainTitanImg from './assets/catalog/terrain/terrain-1.png'
import terrainScorpionImg from './assets/catalog/terrain/terrain-2.png'
import terrainHawkImg from './imports/83963316-8468-4caf-9a55-f139f603195e.jfif'
import terrainVesubioImg from './assets/catalog/terrain/terrain-4.png'
import terrainBaltoroImg from './assets/catalog/terrain/terrain-5.png'
import terrainCorvusImg from './assets/catalog/terrain/terrain-6.png'
import terrainAquilaImg from './assets/catalog/terrain/terrain-7.png'
import terrainHurricaneImg from './assets/catalog/terrain/terrain-8.png'
import terrainStormImg from './assets/catalog/terrain/terrain-9.png'
import electricSportImg from './imports/Captura_de_pantalla_2026-10-03_144928-3.png'
import electricAguilaImg from './imports/5d666b680ee694fb683494e3-asi-son-las-espectaculares-bicis-de-specialized-para-el-mundial-1.jpg'
import electricSolImg from './assets/catalog/bike-58.png'
import electricEMaxImg from './assets/catalog/bike-59.png'
import electricTFlexImg from './imports/333859-800-auto.png'
import electricBremenImg from './imports/specialized_01.jpg'
import roadGaviaImg from './imports/Nova-Specialiazed-epic-2018-full-suspension.jpg'
import roadFlammaImg from './imports/5d666b270ce694fd528b4b12-asi-son-las-espectaculares-bicis-de-specialized-para-el-mundial.jpg'
import roadMortiroloImg from './imports/5d666b970ce694fd528b4b93-asi-son-las-espectaculares-bicis-de-specialized-para-el-mundial.jpg'
import roadK2Img from './imports/5d666b680ee694fb683494e3-asi-son-las-espectaculares-bicis-de-specialized-para-el-mundial.jpg'
import kidsDancerImg from './assets/catalog/bike-66.png'
import kidsManaslu16Img from './assets/catalog/bike-67.png'
import kidsSkadiImg from './assets/catalog/bike-68.png'
import kidsShadowImg from './assets/catalog/bike-69.png'
import kidsManaslu20Img from './assets/catalog/bike-70.png'
import {
  PART_IMAGE_LIBRARY,
  getBikeCategoryImage,
  getBikeImageFallback,
  getPartImageFallback,
  getWheelImageFallback,
  handleImageFallback,
} from './image-library'
import { apiRequest, ApiRequestError } from './api'
import { downloadXlsx } from './xlsx'
import { jsPDF } from 'jspdf'

let cartAudioContext: AudioContext | null = null

function playCartAddedSound(): void {
  try {
    cartAudioContext ??= new AudioContext()
    const context = cartAudioContext
    if (context.state === 'suspended') void context.resume()
    const oscillator = context.createOscillator()
    const volume = context.createGain()
    const now = context.currentTime
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(660, now)
    oscillator.frequency.setValueAtTime(880, now + 0.07)
    volume.gain.setValueAtTime(0.0001, now)
    volume.gain.exponentialRampToValueAtTime(0.08, now + 0.015)
    volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    oscillator.connect(volume)
    volume.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.19)
  } catch (error) {
    console.warn('No fue posible reproducir el sonido de confirmación del carrito.', error)
  }
}

function handleDigitsOnlyKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
  if (
    event.ctrlKey || event.metaKey || event.altKey ||
    ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'].includes(event.key) ||
    /^\d$/.test(event.key)
  ) return
  event.preventDefault()
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function formatAppointmentDate(value: string): string {
  const date = new Date(`${value.replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-CO')
}

// ─── Gallery URLs (Unsplash) ─────────────────────────────────────────────────
const U = (id: string) => `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900`
// Mountain bike photos
const MTB = [
  U('1779114690484-52eaf85f2a56'), U('1779114690786-0b2d8b11eeb3'),
  U('1780004189175-202169141544'), U('1779114690396-a1115352c0cb'),
  U('1779114690733-bba8e46c955c'), U('1760802192147-f12cad68337a'),
]
// e-MTB / electric bike photos
const EMTB = [
  U('1563990308267-cd6d3cc09318'), U('1613937104213-913b11eb76a4'),
  U('1668006041828-cfa3800b983d'), U('1715223449154-7803640ef4cc'),
  U('1608531428470-4471739c4359'), U('1667191016302-191eb6528c58'),
]
// Road bike photos
const ROAD = [
  U('1532298229144-0ec0c57515c7'), U('1496147433903-1e62fdb6f4be'),
  U('1487803836022-91054ca05fdd'), U('1516725630185-19ae408fbc83'),
  U('1595368452775-0372d3489993'), U('1525379241313-7d584a5c09a6'),
]
// Kids bike photos
const KIDS = [
  U('1759167582219-eac8eebd60ba'), U('1768821766755-6bbaaea5341e'),
  U('1763941172376-8721a5909089'), U('1559887503-33082f092a4c'),
  U('1559543471-e9ff582631b5'), U('1759167582219-eac8eebd60ba'),
]
const rot = (arr: string[], n: number) => [...arr.slice(n), ...arr.slice(0, n)]
// Only show the verified image assigned to each product. Generic photos from the
// category must never appear as alternate views of a different bicycle.
const gal = (img: string, _pool: string[], _offset: number) => [img]

// ─── BSLogo ───────────────────────────────────────────────────────────────────
function BSLogo({ size = 48, dark = false, withBackground = true }: { size?: number; dark?: boolean; withBackground?: boolean }) {
  if (dark) {
    // On dark backgrounds: white circular mat so the green logo pops
    return (
      <div className={withBackground ? 'bg-white' : undefined} style={{ width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, padding: size * 0.06 }}>
        <img src={logoImg} alt="BS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    )
  }
  // On light backgrounds: circular logo, no blend mode needed
  return (
    <img
      src={logoImg}
      alt="BS Bike Store"
      style={{ height: size, width: size, objectFit: 'contain', flexShrink: 0 }}
    />
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface CartItem {
  id: number
  name: string
  price: number
  priceLabel: string
  img: string
  qty: number
}

interface PersistedOrder {
  id: number
  status: string
  items: { productId: number; name: string; unitPrice: number; quantity: number }[]
  invoice: {
    number: string
    subtotal: number
    taxRate: number
    taxAmount: number
    total: number
    paymentMethod: string
    paymentPoint: string
    paymentStatus: string
    billingName: string
    billingEmail: string
    issuedAt: string
  }
}

interface CustomerOrder {
  id: number
  status: string
  total: number
  createdAt: string
  invoiceNumber: string | null
  items: { productId: number | null; name: string; unitPrice: number; quantity: number }[]
}

interface AdminClientOrder {
  id: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  createdAt: string
  items: { productId: number | null; name: string; unitPrice: number; quantity: number }[]
}

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Bicicletas', section: 'productos' },
  { label: 'Repuestos y Partes', section: 'repuestos' },
  { label: 'Taller y Servicios', section: 'servicios' },
  { label: 'Reseñas', section: 'resenas' },
]

type NavMenuLink = { label: string; section: string; category?: string }
type NavMenuContent = {
  columns: { heading: string; links: NavMenuLink[] }[]
  featured: { eyebrow: string; title: string; description: string; link: NavMenuLink }
}

const NAV_MENU_CONTENT: Record<string, NavMenuContent> = {
  Bicicletas: {
    columns: [
      { heading: 'Explora por estilo', links: [
        { label: 'Todas las bicicletas', section: 'productos', category: 'Todas' },
        { label: 'Montaña y todo terreno', section: 'productos', category: 'Todo Terreno' },
        { label: 'Bicicletas de ruta', section: 'productos', category: 'Ruta' },
      ] },
      { heading: 'Para cada ciclista', links: [
        { label: 'Bicicletas eléctricas', section: 'productos', category: 'Eléctrica' },
        { label: 'Bicicletas infantiles', section: 'productos', category: 'Infantil' },
        { label: 'Ofertas y destacados', section: 'productos', category: 'Todas' },
      ] },
    ],
    featured: {
      eyebrow: 'Encuentra tu próxima bici',
      title: 'Lista para tu siguiente ruta',
      description: 'Explora modelos seleccionados para ciudad, montaña y carretera.',
      link: { label: 'Ver catálogo completo', section: 'productos', category: 'Todas' },
    },
  },
  'Repuestos y Partes': {
    columns: [
      { heading: 'Componentes', links: [
        { label: 'Llantas y rines', section: 'repuestos' },
        { label: 'Sillines y cockpit', section: 'repuestos' },
        { label: 'Transmisión y frenos', section: 'repuestos' },
      ] },
      { heading: 'Ayuda para elegir', links: [
        { label: 'Ver todos los repuestos', section: 'repuestos' },
        { label: 'Asesoría de compatibilidad', section: 'repuestos' },
      ] },
    ],
    featured: {
      eyebrow: '¿No sabes cuál necesitas?',
      title: 'Te ayudamos a elegir',
      description: 'Nuestro equipo revisa la compatibilidad de cada pieza.',
      link: { label: 'Ver repuestos', section: 'repuestos' },
    },
  },
  'Taller y Servicios': {
    columns: [
      { heading: 'Mantenimiento', links: [
        { label: 'Mantenimiento preventivo', section: 'servicios' },
        { label: 'Ajuste y puesta a punto', section: 'servicios' },
        { label: 'Diagnóstico mecánico', section: 'servicios' },
      ] },
      { heading: 'Atención especializada', links: [
        { label: 'Reparaciones', section: 'servicios' },
        { label: 'Ensamble personalizado', section: 'servicios' },
        { label: 'Ver todos los servicios', section: 'servicios' },
      ] },
    ],
    featured: {
      eyebrow: 'Agenda en pocos minutos',
      title: 'Tu bici en buenas manos',
      description: 'Consulta los servicios disponibles y programa una cita.',
      link: { label: 'Explorar servicios', section: 'servicios' },
    },
  },
  Reseñas: {
    columns: [
      { heading: 'Comunidad', links: [
        { label: 'Opiniones de ciclistas', section: 'resenas' },
        { label: 'Bicicletas destacadas', section: 'productos', category: 'Todas' },
      ] },
    ],
    featured: {
      eyebrow: 'Experiencias reales',
      title: 'Pedalea con confianza',
      description: 'Conoce lo que otros ciclistas opinan de sus bicicletas.',
      link: { label: 'Leer reseñas', section: 'resenas' },
    },
  },
}

type ProductSpec = { label: string; value: string }

interface Product {
  id: number
  name: string
  category: string
  price: number
  originalPrice?: number
  offerDiscount?: number | null
  offerTitle?: string | null
  offerId?: number | null
  priceLabel: string
  rating: number
  reviews: number
  img: string
  badge: string | null
  gallery: string[]
  specs: ProductSpec[]
  description: string
  stock: number
  darkBg?: boolean
}

interface PublicReview {
  id: number
  productId: number
  productName: string
  rating: number
  comment: string
  createdAt: string
  author: string
  verifiedPurchase: boolean
}

const MTN = 'https://images.unsplash.com/photo-1779114690396-a1115352c0cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const MTN2 = 'https://images.unsplash.com/photo-1594942940158-af338884ac6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const MTN3 = 'https://images.unsplash.com/photo-1693677487369-138c2a0f8e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const MTN4 = 'https://images.unsplash.com/photo-1760892471867-d50bb945c13d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const MTN5 = 'https://images.unsplash.com/photo-1727880105412-4bfa9df48a0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const MTN6 = 'https://images.unsplash.com/photo-1774502424774-51a5f20282d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const ELEC1 = 'https://images.unsplash.com/photo-1625090665951-b93cbcb2687f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const ELEC2 = 'https://images.unsplash.com/photo-1625090666340-eea129f52a50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const ELEC3 = 'https://images.unsplash.com/photo-1640835521491-50d5e5d215bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const ELEC4 = 'https://images.unsplash.com/photo-1625090667546-857e3e9a56d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const RUTA1 = 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const RUTA2 = 'https://images.unsplash.com/photo-1615845522846-02f89af04c2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const RUTA3 = 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const RUTA4 = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const RUTA5 = 'https://images.unsplash.com/photo-1516147697747-02adcafd3fda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const RUTA6 = 'https://images.unsplash.com/photo-1486425091969-f62210f08a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const URB1 = 'https://images.unsplash.com/photo-1501147830916-ce44a6359892?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const URB2 = 'https://images.unsplash.com/photo-1505705694340-019e1e335916?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'
const OFFICIAL_BIKE_IMAGES = {
  electricSpecializedBrown: '/images/bikes/electric-specialized-brown.jpeg',
  electricSpecializedForest: '/images/bikes/electric-specialized-forest.jpeg',
  electricSantaCruzPurple: '/images/bikes/electric-santa-cruz-purple.jpeg',
  electricSantaCruzBlack: '/images/bikes/electric-santa-cruz-black.jpeg',
  electricScott: '/images/bikes/electric-scott-enduro.jpeg',
  roadCanyon: '/images/bikes/road-canyon-aeroad.jpeg',
  roadPinarello: '/images/bikes/road-pinarello.jpeg',
  roadSWorks: '/images/bikes/road-sworks.jpeg',
  roadTrek: '/images/bikes/road-trek.jpeg',
} as const

const ALL_PRODUCTS: Product[] = [
  // ── TODO TERRENO ──────────────────────────────────────────────────
  {
    id: 1, name: 'SANTA CRUZ V10 DH', category: 'Todo Terreno',
    price: 34500000, priceLabel: '$34.500.000', rating: 4.8, reviews: 312, badge: 'premium',
    img: terrainTitanImg, stock: 8,
    gallery: gal(terrainTitanImg, MTB, 0),
    description: 'La Santa Cruz V10 DH es una bicicleta de descenso de competición diseñada para ofrecer velocidad, control y estabilidad en los terrenos más exigentes.',
    specs: [
      { label: 'Marca', value: 'SANTA CRUZ' }, { label: 'Modelo', value: 'V10 DH' },
      { label: 'Disciplina', value: 'Downhill' }, { label: 'Suspensión', value: 'Doble suspensión' },
    ],
  },
  {
    id: 2, name: 'CANYON SENDER CFR', category: 'Todo Terreno',
    price: 25500000, priceLabel: '$25.500.000', rating: 4.9, reviews: 187, badge: 'Premium',
    img: terrainScorpionImg, stock: 5,
    gallery: gal(terrainScorpionImg, MTB, 1),
    description: 'La Canyon Sender CFR es una bicicleta de downhill orientada a la competición, creada para mantener precisión y control a alta velocidad.',
    specs: [
      { label: 'Marca', value: 'CANYON' }, { label: 'Modelo', value: 'SENDER CFR' },
      { label: 'Disciplina', value: 'Downhill' }, { label: 'Suspensión', value: 'Doble suspensión' },
    ],
  },
  {
    id: 3, name: 'SCOTT GAMBLER TUNED 900', category: 'Todo Terreno',
    price: 29500000, priceLabel: '$29.500.000', rating: 4.9, reviews: 143, badge: 'Nuevo',
    img: terrainHawkImg, stock: 6,
    gallery: gal(terrainHawkImg, MTB, 2),
    description: 'La Scott Gambler Tuned 900 es una bicicleta de descenso de alto rendimiento, desarrollada para afrontar circuitos técnicos y grandes impactos.',
    specs: [
      { label: 'Marca', value: 'SCOTT' }, { label: 'Modelo', value: 'GAMBLER TUNED 900' },
      { label: 'Disciplina', value: 'Downhill' }, { label: 'Suspensión', value: 'Doble suspensión' },
    ],
  },
  {
    id: 4, name: 'SPECIALIZED S-WORKS DEMO', category: 'Todo Terreno',
    price: 36000000, priceLabel: '$36.000.000', rating: 4.8, reviews: 108, badge: 'Aventura',
    img: terrainVesubioImg, stock: 4,
    gallery: gal(terrainVesubioImg, MTB, 3),
    description: 'La Specialized S-Works Demo es una bicicleta de downhill de nivel profesional, enfocada en la máxima velocidad y respuesta en descenso.',
    specs: [
      { label: 'Marca', value: 'SPECIALIZED' }, { label: 'Modelo', value: 'S-WORKS DEMO' },
      { label: 'Disciplina', value: 'Downhill' }, { label: 'Suspensión', value: 'Doble suspensión' },
    ],
  },
  {
    id: 5, name: 'TREK SESSION 9.8', category: 'Todo Terreno',
    price: 23000000, priceLabel: '$23.000.000', rating: 5.0, reviews: 221, badge: 'Top Pick',
    img: terrainBaltoroImg, stock: 3,
    gallery: gal(terrainBaltoroImg, MTB, 4),
    description: 'La Trek Session 9.8 es una bicicleta de downhill preparada para descensos rápidos, saltos y terrenos técnicos de alta exigencia.',
    specs: [
      { label: 'Marca', value: 'TREK' }, { label: 'Modelo', value: 'SESSION 9.8' },
      { label: 'Disciplina', value: 'Downhill' }, { label: 'Suspensión', value: 'Doble suspensión' },
    ],
  },
  {
    id: 6, name: 'YT TUES CF CORE 4', category: 'Todo Terreno',
    price: 19600000, priceLabel: '$19.600.000', rating: 4.7, reviews: 95, badge: null,
    img: terrainCorvusImg, stock: 9,
    gallery: gal(terrainCorvusImg, MTB, 5),
    description: 'La YT Tues CF Core 4 es una bicicleta de downhill de alto desempeño, concebida para ofrecer control y confianza en las líneas más agresivas.',
    specs: [
      { label: 'Marca', value: 'YT' }, { label: 'Modelo', value: 'TUES CF CORE 4' },
      { label: 'Disciplina', value: 'Downhill' }, { label: 'Suspensión', value: 'Doble suspensión' },
    ],
  },
  {
    id: 16, name: 'COMMENCAL SUPREME DH V5', category: 'Todo Terreno',
    price: 24200000, priceLabel: '$24.200.000', rating: 4.8, reviews: 67, badge: 'Nuevo',
    img: terrainAquilaImg, stock: 5,
    gallery: gal(terrainAquilaImg, MTB, 2),
    description: 'La Commencal Supreme DH V5 es una bicicleta de downhill de competición, desarrollada para mantener velocidad y estabilidad en circuitos exigentes.',
    specs: [
      { label: 'Marca', value: 'COMMENCAL' }, { label: 'Modelo', value: 'SUPREME DH V5' },
      { label: 'Disciplina', value: 'Downhill' }, { label: 'Suspensión', value: 'Doble suspensión' },
    ],
  },
  {
    id: 17, name: 'TREK SESSION FACTORY RACING DH', category: 'Todo Terreno',
    price: 23000000, priceLabel: '$23.000.000', rating: 4.6, reviews: 154, badge: null,
    img: terrainHurricaneImg, stock: 12,
    gallery: gal(terrainHurricaneImg, MTB, 4),
    description: 'La Trek Session Factory Racing DH es una bicicleta de descenso inspirada en la competición, preparada para máxima velocidad y control.',
    specs: [
      { label: 'Marca', value: 'TREK' }, { label: 'Modelo', value: 'SESSION FACTORY RACING DH' },
      { label: 'Disciplina', value: 'Downhill' }, { label: 'Suspensión', value: 'Doble suspensión' },
    ],
  },
  {
    id: 18, name: 'SPECIALIZED ENDURO COMP', category: 'Todo Terreno',
    price: 22200000, priceLabel: '$22.200.000', rating: 4.7, reviews: 88, badge: null,
    img: terrainStormImg, stock: 7,
    gallery: gal(terrainStormImg, MTB, 3),
    description: 'La Specialized Enduro Comp es una bicicleta de enduro diseñada para combinar eficiencia en ascensos con confianza y control en los descensos.',
    specs: [
      { label: 'Marca', value: 'SPECIALIZED' }, { label: 'Modelo', value: 'ENDURO COMP' },
      { label: 'Disciplina', value: 'Enduro' }, { label: 'Suspensión', value: 'Doble suspensión' },
    ],
  },
  // ── ELÉCTRICAS ────────────────────────────────────────────────────
  {
    id: 7, name: 'SPECIALIZED TURBO LEVO COMP', category: 'Eléctrica',
    price: 5900000, priceLabel: '$5.900.000', rating: 4.9, reviews: 143, badge: 'Más Vendido',
    img: OFFICIAL_BIKE_IMAGES.electricSpecializedBrown, stock: 5,
    gallery: gal(OFFICIAL_BIKE_IMAGES.electricSpecializedBrown, EMTB, 0),
    description: 'Bicicleta eléctrica de montaña de doble suspensión, con motor integrado y geometría para senderos técnicos.',
    specs: [
      { label: 'Marca', value: 'SPECIALIZED' }, { label: 'Modelo', value: 'TURBO LEVO COMP' },
      { label: 'Tipo', value: 'E-MTB de doble suspensión' }, { label: 'Asistencia', value: 'Motor eléctrico integrado' },
    ],
  },
  {
    id: 8, name: 'SPECIALIZED TURBO LEVO SL', category: 'Eléctrica',
    price: 4800000, priceLabel: '$4.800.000', rating: 4.8, reviews: 89, badge: 'Nuevo',
    img: OFFICIAL_BIKE_IMAGES.electricSpecializedForest, stock: 4,
    gallery: gal(OFFICIAL_BIKE_IMAGES.electricSpecializedForest, EMTB, 1),
    description: 'Bicicleta eléctrica de montaña con doble suspensión, motor visible y configuración orientada al trail.',
    specs: [
      { label: 'Marca', value: 'SPECIALIZED' }, { label: 'Modelo', value: 'TURBO LEVO SL' },
      { label: 'Tipo', value: 'E-MTB de doble suspensión' }, { label: 'Asistencia', value: 'Motor eléctrico integrado' },
    ],
  },
  {
    id: 9, name: 'SANTA CRUZ HECKLER SL', category: 'Eléctrica',
    price: 5200000, priceLabel: '$5.200.000', rating: 4.8, reviews: 62, badge: null,
    img: OFFICIAL_BIKE_IMAGES.electricSantaCruzPurple, stock: 7,
    gallery: gal(OFFICIAL_BIKE_IMAGES.electricSantaCruzPurple, EMTB, 2),
    description: 'E-MTB Santa Cruz con doble suspensión, motor integrado y cuadro preparado para recorridos de montaña.',
    specs: [
      { label: 'Marca', value: 'SANTA CRUZ' }, { label: 'Modelo', value: 'HECKLER SL' },
      { label: 'Tipo', value: 'E-MTB de doble suspensión' }, { label: 'Asistencia', value: 'Motor eléctrico integrado' },
    ],
  },
  {
    id: 10, name: 'SCOTT PATRON eRIDE', category: 'Eléctrica',
    price: 6500000, priceLabel: '$6.500.000', rating: 4.9, reviews: 55, badge: 'Premium',
    img: OFFICIAL_BIKE_IMAGES.electricScott, stock: 3,
    gallery: gal(OFFICIAL_BIKE_IMAGES.electricScott, EMTB, 3),
    description: 'Bicicleta eléctrica Scott de montaña con doble suspensión, asistencia integrada y componentes para trail.',
    specs: [
      { label: 'Marca', value: 'SCOTT' }, { label: 'Modelo', value: 'PATRON eRIDE' },
      { label: 'Tipo', value: 'E-MTB de doble suspensión' }, { label: 'Asistencia', value: 'Motor eléctrico integrado' },
    ],
  },
  {
    id: 20, name: 'SANTA CRUZ HECKLER', category: 'Eléctrica',
    price: 4200000, priceLabel: '$4.200.000', rating: 4.7, reviews: 48, badge: null,
    img: OFFICIAL_BIKE_IMAGES.electricSantaCruzBlack, stock: 6,
    gallery: gal(OFFICIAL_BIKE_IMAGES.electricSantaCruzBlack, EMTB, 3),
    description: 'E-MTB Santa Cruz de doble suspensión, con motor integrado y montaje diseñado para rutas de montaña.',
    specs: [
      { label: 'Marca', value: 'SANTA CRUZ' }, { label: 'Modelo', value: 'HECKLER' },
      { label: 'Tipo', value: 'E-MTB de doble suspensión' }, { label: 'Asistencia', value: 'Motor eléctrico integrado' },
    ],
  },
  {
    id: 21, name: 'S-Works Epic FSR World Cup', category: 'Eléctrica',
    price: 3800000, priceLabel: '$3.800.000', rating: 4.6, reviews: 37, badge: null,
    img: electricBremenImg, stock: 8,
    gallery: gal(electricBremenImg, EMTB, 1),
    description: 'La GW Bremen 350W es una opción práctica para la movilidad sostenible. Su motor eléctrico y equipamiento urbano permiten recorrer la ciudad con comodidad y asistencia eficiente.',
    specs: [
      { label: 'Marca', value: 'GW' }, { label: 'Modelo', value: 'BREMEN 350W' },
      { label: 'Motor', value: '250W trasero' }, { label: 'Batería', value: '36V 7.5Ah' },
      { label: 'Autonomía', value: 'Hasta 45 km' }, { label: 'Tipo', value: 'Plegable' },
      { label: 'Rin', value: '20"' }, { label: 'Peso', value: '18 kg' },
    ],
  },
  // ── RUTA ──────────────────────────────────────────────────────────
  {
    id: 11, name: 'CANYON AEROAD CFR', category: 'Ruta',
    price: 3490000, priceLabel: '$3.490.000', rating: 5.0, reviews: 76, badge: 'Pro Tour',
    img: OFFICIAL_BIKE_IMAGES.roadCanyon, stock: 3,
    gallery: gal(OFFICIAL_BIKE_IMAGES.roadCanyon, ROAD, 0),
    description: 'Bicicleta de ruta aerodinámica Canyon con manillar drop y ruedas de perfil alto, preparada para velocidad en carretera.',
    specs: [
      { label: 'Marca', value: 'CANYON' }, { label: 'Modelo', value: 'AEROAD CFR' },
      { label: 'Disciplina', value: 'Ruta aerodinámica' }, { label: 'Manillar', value: 'Drop de carretera' },
    ],
  },
  {
    id: 12, name: 'PINARELLO DOGMA F', category: 'Ruta',
    price: 2890000, priceLabel: '$2.890.000', rating: 4.9, reviews: 94, badge: 'Más Vendido',
    img: OFFICIAL_BIKE_IMAGES.roadPinarello, stock: 5,
    gallery: gal(OFFICIAL_BIKE_IMAGES.roadPinarello, ROAD, 2),
    description: 'Bicicleta de carretera Pinarello con cuadro aerodinámico, manillar drop y ruedas de alto perfil.',
    specs: [
      { label: 'Marca', value: 'PINARELLO' }, { label: 'Modelo', value: 'DOGMA F' },
      { label: 'Disciplina', value: 'Ruta de competición' }, { label: 'Manillar', value: 'Drop de carretera' },
    ],
  },
  {
    id: 22, name: 'SPECIALIZED S-WORKS TARMAC SL8', category: 'Ruta',
    price: 4100000, priceLabel: '$4.100.000', rating: 5.0, reviews: 41, badge: 'Top de Gama',
    img: OFFICIAL_BIKE_IMAGES.roadSWorks, stock: 2,
    gallery: gal(OFFICIAL_BIKE_IMAGES.roadSWorks, ROAD, 4),
    description: 'Bicicleta de carretera S-Works con cuadro aerodinámico, manillar drop y ruedas Roval de perfil alto.',
    specs: [
      { label: 'Marca', value: 'SPECIALIZED' }, { label: 'Modelo', value: 'S-WORKS TARMAC SL8' },
      { label: 'Disciplina', value: 'Ruta de competición' }, { label: 'Manillar', value: 'Drop de carretera' },
    ],
  },
  {
    id: 23, name: 'TREK MADONE', category: 'Ruta',
    price: 2450000, priceLabel: '$2.450.000', rating: 4.8, reviews: 63, badge: null,
    img: OFFICIAL_BIKE_IMAGES.roadTrek, stock: 7,
    gallery: gal(OFFICIAL_BIKE_IMAGES.roadTrek, ROAD, 3),
    description: 'Bicicleta de carretera Trek Madone con cuadro aerodinámico, manillar drop y ruedas Bontrager de perfil alto.',
    specs: [
      { label: 'Marca', value: 'TREK' }, { label: 'Modelo', value: 'MADONE' },
      { label: 'Disciplina', value: 'Ruta aerodinámica' }, { label: 'Manillar', value: 'Drop de carretera' },
    ],
  },
  // ── INFANTIL ──────────────────────────────────────────────────────
  {
    id: 13, name: 'GW DANCER 12', category: 'Infantil',
    price: 420000, priceLabel: '$420.000', rating: 4.9, reviews: 218, badge: 'Más Vendido',
    img: kidsDancerImg, stock: 14,
    gallery: gal(kidsDancerImg, KIDS, 0),
    description: 'La GW Dancer es la bicicleta infantil más querida de la línea GW. Diseño colorido y alegre, con ruedas de apoyo removibles, frenos de mano de fácil presión y guardabarros para proteger a los pequeños en sus aventuras.',
    specs: [
      { label: 'Marca', value: 'GW' }, { label: 'Modelo', value: 'DANCER 12' },
      { label: 'Marco', value: 'Acero Hi-Ten pintado' }, { label: 'Frenos', value: 'V-Brake suave presión' },
      { label: 'Rin', value: '16"' }, { label: 'Extras', value: 'Ruedas de apoyo + guardabarros' },
      { label: 'Edad recomendada', value: '4–7 años' }, { label: 'Garantía', value: '6 meses' },
    ],
  },
  {
    id: 14, name: 'JEEP MANASLU 16', category: 'Infantil',
    price: 520000, priceLabel: '$520.000', rating: 4.7, reviews: 176, badge: null,
    img: kidsManaslu16Img, stock: 10,
    gallery: gal(kidsManaslu16Img, KIDS, 2),
    description: 'La JEEP Manaslu 16 combina la solidez de la marca JEEP con las necesidades de los pequeños ciclistas. Marco robusto, llantas gruesas para mayor estabilidad y diseño aventurero que emociona a niños y padres.',
    specs: [
      { label: 'Marca', value: 'JEEP' }, { label: 'Modelo', value: 'MANASLU 16' },
      { label: 'Marco', value: 'Acero Hi-Ten' }, { label: 'Frenos', value: 'V-Brake delantero y trasero' },
      { label: 'Rin', value: '16"' }, { label: 'Extras', value: 'Ruedas de apoyo incluidas' },
      { label: 'Edad recomendada', value: '5–8 años' }, { label: 'Garantía', value: '6 meses' },
    ],
  },
  {
    id: 15, name: 'OPTIMUS SKADI 2 RIN 16', category: 'Infantil',
    price: 680000, priceLabel: '$680.000', rating: 4.9, reviews: 134, badge: 'Premium',
    img: kidsSkadiImg, stock: 8,
    gallery: gal(kidsSkadiImg, KIDS, 3),
    description: 'La Optimus Skadi 2 Rin 16 es una bicicleta infantil ligera y resistente. Sus componentes están pensados para que los niños más activos disfruten de una bicicleta segura y fácil de manejar.',
    specs: [
      { label: 'Marca', value: 'OPTIMUS' }, { label: 'Modelo', value: 'SKADI 2 RIN 16' },
      { label: 'Marco', value: 'Aluminio ligero' }, { label: 'Frenos', value: 'Disco mecánico' },
      { label: 'Rin', value: '20"' }, { label: 'Velocidades', value: '7 velocidades' },
      { label: 'Edad recomendada', value: '7–12 años' }, { label: 'Garantía', value: '1 año' },
    ],
  },
  {
    id: 24, name: 'GW SHADOW 12', category: 'Infantil',
    price: 380000, priceLabel: '$380.000', rating: 4.8, reviews: 97, badge: null,
    img: kidsShadowImg, stock: 16,
    gallery: gal(kidsShadowImg, KIDS, 1),
    description: 'La GW Shadow es una bicicleta infantil perfecta para los primeros pedales. Con diseño deportivo y colores llamativos, incluye ruedas de apoyo, timbre, reflectores y todo lo que un niño necesita para comenzar a pedalear de manera segura.',
    specs: [
      { label: 'Marca', value: 'GW' }, { label: 'Modelo', value: 'SHADOW 12' },
      { label: 'Marco', value: 'Acero Hi-Ten' }, { label: 'Frenos', value: 'V-Brake' },
      { label: 'Rin', value: '12"' }, { label: 'Extras', value: 'Ruedas de apoyo + timbre' },
      { label: 'Edad recomendada', value: '3–5 años' }, { label: 'Garantía', value: '6 meses' },
    ],
  },
  {
    id: 25, name: 'JEEP MANASLU 20', category: 'Infantil',
    price: 590000, priceLabel: '$590.000', rating: 4.7, reviews: 82, badge: null,
    img: kidsManaslu20Img, stock: 9,
    gallery: gal(kidsManaslu20Img, KIDS, 4),
    description: 'La JEEP Manaslu 20 es el siguiente paso en la línea JEEP infantil. Para niños más grandes que ya pedalean con confianza, con rin de 20 pulgadas, múltiples velocidades y frenos sólidos para mayor independencia.',
    specs: [
      { label: 'Marca', value: 'JEEP' }, { label: 'Modelo', value: 'MANASLU 20' },
      { label: 'Marco', value: 'Acero Hi-Ten' }, { label: 'Velocidades', value: '6 velocidades' },
      { label: 'Rin', value: '20"' }, { label: 'Frenos', value: 'V-Brake' },
      { label: 'Edad recomendada', value: '7–10 años' }, { label: 'Garantía', value: '6 meses' },
    ],
  },
]

const CATEGORIES = ['Todas', 'Todo Terreno', 'Ruta', 'Urbana', 'Eléctrica', 'Infantil']
const ADMIN_PRODUCT_CATEGORIES = [...CATEGORIES.slice(1), 'Repuestos', 'Accesorios']

const COLOMBIA_DEPTS: Record<string, string[]> = {
  'Amazonas': ['Leticia','Puerto Nariño'],
  'Antioquia': ['Medellín','Abejorral','Abriaquí','Alejandría','Amagá','Amalfi','Andes','Angelópolis','Angostura','Anorí','Santa Fe de Antioquia','Anzá','Apartadó','Arboletes','Argelia','Armenia','Barbosa','Belmira','Bello','Betania','Betulia','Ciudad Bolívar','Briceño','Buriticá','Cáceres','Caicedo','Caldas','Campamento','Cañasgordas','Caracolí','Caramanta','Carepa','El Carmen de Viboral','Carolina del Príncipe','Caucasia','Chigorodó','Cisneros','Cocorná','Concepción','Concordia','Copacabana','Dabeiba','Donmatías','Ebéjico','El Bagre','Entrerríos','Envigado','Fredonia','Frontino','Giraldo','Girardota','Gómez Plata','Granada','Guadalupe','Guarne','Guatapé','Heliconia','Hispania','Itagüí','Ituango','Jardín','Jericó','La Ceja','La Estrella','La Pintada','La Unión','Liborina','Maceo','Marinilla','Montebello','Murindó','Mutatá','Nariño','Necoclí','Nechí','Olaya','Peñol','Peque','Pueblorrico','Puerto Berrío','Puerto Nare','Puerto Triunfo','Remedios','Retiro','Rionegro','Sabanalarga','Sabaneta','Salgar','San Andrés de Cuerquia','San Carlos','San Francisco','San Jerónimo','San José de la Montaña','San Juan de Urabá','San Luis','San Pedro de los Milagros','San Pedro de Urabá','San Rafael','San Roque','San Vicente Ferrer','Santa Bárbara','Santa Rosa de Osos','Santo Domingo','El Santuario','Segovia','Sonsón','Sopetrán','Támesis','Tarazá','Tarso','Titiribí','Toledo','Turbo','Uramita','Urrao','Valdivia','Valparaíso','Vegachí','Venecia','Vigía del Fuerte','Yalí','Yarumal','Yolombó','Yondó','Zaragoza'],
  'Arauca': ['Arauca','Arauquita','Cravo Norte','Fortul','Puerto Rondón','Saravena','Tame'],
  'Atlántico': ['Barranquilla','Baranoa','Campo de la Cruz','Candelaria','Galapa','Juan de Acosta','Luruaco','Malambo','Manatí','Palmar de Varela','Piojó','Polonuevo','Ponedera','Puerto Colombia','Repelón','Sabanagrande','Sabanalarga','Santa Lucía','Santo Tomás','Soledad','Suan','Tubará','Usiacurí'],
  'Bogotá D.C.': ['Bogotá, D.C.'],
  'Bolívar': ['Cartagena de Indias','Achí','Altos del Rosario','Arenal','Arjona','Arroyohondo','Barranco de Loba','Calamar','Cantagallo','Cicuco','Clemencia','Córdoba','El Carmen de Bolívar','El Guamo','El Peñón','Hatillo de Loba','Magangué','Mahates','Margarita','María la Baja','Montecristo','Mompós','Morales','Norosí','Pinillos','Regidor','Río Viejo','San Cristóbal','San Estanislao','San Fernando','San Jacinto','San Jacinto del Cauca','San Juan Nepomuceno','San Martín de Loba','San Pablo','Santa Catalina','Santa Rosa','Santa Rosa del Sur','Simití','Soplaviento','Talaigua Nuevo','Tiquisio','Turbaco','Turbaná','Villanueva','Zambrano'],
  'Boyacá': ['Tunja','Almeida','Aquitania','Arcabuco','Belén','Berbeo','Betéitiva','Boavita','Boyacá','Briceño','Buenavista','Busbanzá','Caldas','Campohermoso','Cerinza','Chinavita','Chiquinquirá','Chíquiza','Chiscas','Chita','Chitaraque','Chivatá','Chivor','Ciénega','Cómbita','Coper','Corrales','Covarachía','Cubará','Cucaita','Cuítiva','Duitama','El Cocuy','El Espino','Firavitoba','Floresta','Gachantivá','Gámeza','Garagoa','Guacamayas','Guateque','Guayatá','Güicán','Iza','Jenesano','Jericó','La Capilla','La Uvita','La Victoria','Labranzagrande','Macanal','Maripí','Miraflores','Mongua','Monguí','Moniquirá','Motavita','Muzo','Nobsa','Nuevo Colón','Oicatá','Otanche','Pachavita','Páez','Paipa','Pajarito','Panqueba','Pauna','Paya','Paz de Río','Pesca','Pisba','Puerto Boyacá','Quípama','Ramiriquí','Ráquira','Rondón','Saboyá','Sáchica','Samacá','San Eduardo','San José de Pare','San Luis de Gaceno','San Mateo','San Miguel de Sema','San Pablo de Borbur','Santa María','Santa Rosa de Viterbo','Santa Sofía','Santana','Sativanorte','Sativasur','Siachoque','Soatá','Socha','Socotá','Sogamoso','Somondoco','Sora','Soracá','Sotaquirá','Susacón','Sutamarchán','Sutatenza','Tasco','Tenza','Tibaná','Tibasosa','Tinjacá','Tipacoque','Toca','Togüí','Tópaga','Tota','Tununguá','Turmequé','Tuta','Tutazá','Úmbita','Ventaquemada','Villa de Leyva','Viracachá','Zetaquira'],
  'Caldas': ['Manizales','Aguadas','Anserma','Aranzazu','Belalcázar','Chinchiná','Filadelfia','La Dorada','La Merced','Manzanares','Marmato','Marquetalia','Marulanda','Neira','Norcasia','Pácora','Palestina','Pensilvania','Riosucio','Risaralda','Salamina','Samaná','San José','Supía','Victoria','Villamaría','Viterbo'],
  'Caquetá': ['Florencia','Albania','Belén de los Andaquíes','Cartagena del Chairá','Curillo','El Doncello','El Paujil','La Montañita','Milán','Morelia','Puerto Rico','San José del Fragua','San Vicente del Caguán','Solano','Solita','Valparaíso'],
  'Casanare': ['Yopal','Aguazul','Chámeza','Hato Corozal','La Salina','Maní','Monterrey','Nunchía','Orocué','Paz de Ariporo','Pore','Recetor','Sabanalarga','Sácama','San Luis de Palenque','Támara','Tauramena','Trinidad','Villanueva'],
  'Cauca': ['Popayán','Almaguer','Argelia','Balboa','Bolívar','Buenos Aires','Cajibío','Caldono','Caloto','Corinto','El Tambo','Florencia','Guachené','Guapi','Inzá','Jambaló','La Sierra','La Vega','López de Micay','Mercaderes','Miranda','Morales','Padilla','Páez','Patía','Piamonte','Piendamó','Puerto Tejada','Puracé','Rosas','San Sebastián','Santa Rosa','Santander de Quilichao','Silvia','Sotará','Suárez','Sucre','Timbío','Timbiquí','Toribío','Totoró','Villa Rica'],
  'Cesar': ['Valledupar','Aguachica','Agustín Codazzi','Astrea','Becerril','Bosconia','Chimichagua','Chiriguaná','Curumaní','El Copey','El Paso','Gamarra','González','La Gloria','La Jagua de Ibirico','La Paz','Manaure Balcón del Cesar','Pailitas','Pelaya','Pueblo Bello','Río de Oro','San Alberto','San Diego','San Martín','Tamalameque'],
  'Chocó': ['Quibdó','Acandí','Alto Baudó','Atrato','Bagadó','Bahía Solano','Bajo Baudó','Belén de Bajirá','Bojayá','Cantón de San Pablo','Cértegui','Condoto','El Carmen de Atrato','El Carmen del Darién','Istmina','Juradó','Litoral del San Juan','Lloró','Medio Atrato','Medio Baudó','Medio San Juan','Nóvita','Nuquí','Río Iró','Río Quito','Riosucio','San José del Palmar','Sipí','Tadó','Unguía','Unión Panamericana'],
  'Cundinamarca': ['Agua de Dios','Albán','Anapoima','Anolaima','Apulo','Arbeláez','Beltrán','Bituima','Bojacá','Cabrera','Cachipay','Cajicá','Caparrapí','Cáqueza','Carmen de Carupa','Chaguaní','Chía','Chipaque','Choachí','Chocontá','Cogua','Cota','Cucunubá','El Colegio','El Peñón','El Rosal','Facatativá','Fómeque','Fosca','Funza','Fúquene','Fusagasugá','Gachalá','Gachancipá','Gachetá','Gama','Girardot','Granada','Guachetá','Guaduas','Guasca','Guataquí','Guatavita','Guayabal de Síquima','Guayabetal','Gutiérrez','Jerusalén','Junín','La Calera','La Mesa','La Palma','La Peña','La Vega','Lenguazaque','Machetá','Madrid','Manta','Medina','Mosquera','Nariño','Nemocón','Nilo','Nimaima','Nocaima','Pacho','Paime','Pandi','Paratebueno','Pasca','Puerto Salgar','Pulí','Quebradanegra','Quetame','Quipile','Ricaurte','San Antonio del Tequendama','San Bernardo','San Cayetano','San Francisco','San Juan de Rioseco','Sasaima','Sesquilé','Sibaté','Silvania','Simijaca','Soacha','Sopó','Subachoque','Suesca','Supatá','Susa','Sutatausa','Tabio','Tausa','Tena','Tenjo','Tibacuy','Tibirita','Tocaima','Tocancipá','Topaipí','Ubalá','Ubaque','Villa de San Diego de Ubaté','Une','Útica','Venecia','Vergara','Vianí','Villagómez','Villapinzón','Villeta','Viotá','Yacopí','Zipacón','Zipaquirá'],
  'Córdoba': ['Montería','Ayapel','Buenavista','Canalete','Cereté','Chimá','Chinú','Ciénaga de Oro','Cotorra','La Apartada','Lorica','Los Córdobas','Momil','Montelíbano','Moñitos','Planeta Rica','Pueblo Nuevo','Puerto Escondido','Puerto Libertador','Purísima de la Concepción','Sahagún','San Andrés de Sotavento','San Antero','San Bernardo del Viento','San Carlos','San José de Uré','San Pelayo','Tierralta','Tuchín','Valencia'],
  'Guainía': ['Inírida'],
  'Guaviare': ['San José del Guaviare','Calamar','El Retorno','Miraflores'],
  'Huila': ['Neiva','Acevedo','Agrado','Aipe','Algeciras','Altamira','Baraya','Campoalegre','Colombia','Elías','Garzón','Gigante','Guadalupe','Hobo','Íquira','Isnos','La Argentina','La Plata','Nátaga','Oporapa','Paicol','Palermo','Palestina','Pital','Pitalito','Rivera','Saladoblanco','San Agustín','Santa María','Suaza','Tarqui','Tesalia','Tello','Teruel','Timaná','Villavieja','Yaguará'],
  'La Guajira': ['Riohacha','Albania','Barrancas','Dibulla','Distracción','El Molino','Fonseca','Hatonuevo','La Jagua del Pilar','Maicao','Manaure','San Juan del Cesar','Uribia','Urumita','Villanueva'],
  'Magdalena': ['Santa Marta','Algarrobo','Aracataca','Ariguaní','Cerro de San Antonio','Chibolo','Ciénaga','Concordia','El Banco','El Piñón','El Retén','Fundación','Guamal','Nueva Granada','Pedraza','Pijiño del Carmen','Pivijay','Plato','Puebloviejo','Remolino','Sabanas de San Ángel','Salamina','San Sebastián de Buenavista','San Zenón','Santa Ana','Santa Bárbara de Pinto','Sitionuevo','Tenerife','Zapayán','Zona Bananera'],
  'Meta': ['Villavicencio','Acacías','Barranca de Upía','Cabuyaro','Castilla la Nueva','Cubarral','Cumaral','El Calvario','El Castillo','El Dorado','Fuente de Oro','Granada','Guamal','La Macarena','Lejanías','Mapiripán','Mesetas','Puerto Concordia','Puerto Gaitán','Puerto Lleras','Puerto López','Puerto Rico','Restrepo','San Carlos de Guaroa','San Juan de Arama','San Juanito','San Martín','Uribe','Vista Hermosa'],
  'Nariño': ['Pasto','Albán','Aldana','Ancuyá','Arboleda','Barbacoas','Belén','Buesaco','Chachagüí','Colón','Consacá','Contadero','Córdoba','Cuaspud','Cumbal','Cumbitara','El Charco','El Peñol','El Rosario','El Tablón de Gómez','El Tambo','Funes','Guachucal','Guaitarilla','Gualmatán','Iles','Imués','Ipiales','La Cruz','La Florida','La Llanada','La Tola','La Unión','Leiva','Linares','Los Andes','Magüí','Mallama','Mosquera','Nariño','Olaya Herrera','Ospina','Francisco Pizarro','Policarpa','Potosí','Providencia','Puerres','Pupiales','Ricaurte','Roberto Payán','Samaniego','San Bernardo','San Lorenzo','San Pablo','San Pedro de Cartago','Sandoná','Santa Bárbara','Santacruz','Sapuyes','Taminango','Tangua','Tumaco','Túquerres','Yacuanquer'],
  'Norte de Santander': ['Cúcuta','Ábrego','Arboledas','Bochalema','Bucarasica','Cácota','Cachirá','Chinácota','Chitagá','Convención','Cucutilla','Durania','El Carmen','El Tarra','El Zulia','Gramalote','Hacarí','Herrán','La Esperanza','La Playa','Labateca','Los Patios','Lourdes','Mutiscua','Ocaña','Pamplona','Pamplonita','Puerto Santander','Ragonvalia','Salazar','San Calixto','San Cayetano','Santiago','Sardinata','Silos','Teorama','Tibú','Toledo','Villa Caro','Villa del Rosario'],
  'Putumayo': ['Mocoa','Colón','Orito','Puerto Asís','Puerto Caicedo','Puerto Guzmán','Puerto Leguízamo','San Francisco','San Miguel','Santiago','Sibundoy','Valle del Guamuez','Villagarzón'],
  'Quindío': ['Armenia','Buenavista','Calarcá','Circasia','Córdoba','Filandia','Génova','La Tebaida','Montenegro','Pijao','Quimbaya','Salento'],
  'Risaralda': ['Pereira','Apía','Balboa','Belén de Umbría','Dosquebradas','Guática','La Celia','La Virginia','Marsella','Mistrató','Pueblo Rico','Quinchía','Santa Rosa de Cabal','Santuario'],
  'San Andrés y Providencia': ['San Andrés','Providencia'],
  'Santander': ['Bucaramanga','Aguada','Albania','Aratoca','Barbosa','Barichara','Barrancabermeja','Betulia','Bolívar','Cabrera','California','Capitanejo','Carcasí','Cepitá','Cerrito','Charalá','Charta','Chima','Chipatá','Cimitarra','Concepción','Confines','Contratación','Coromoro','Curití','El Carmen de Chucurí','El Guacamayo','El Peñón','El Playón','El Socorro','Encino','Enciso','Florián','Floridablanca','Galán','Gámbita','Girón','Guaca','Guadalupe','Guapotá','Guavatá','Güepsa','Hato','Jesús María','Jordán','La Belleza','La Paz','Landázuri','Lebrija','Los Santos','Macaravita','Málaga','Matanza','Mogotes','Molagavita','Ocamonte','Oiba','Onzaga','Palmar','Palmas del Socorro','Páramo','Piedecuesta','Pinchote','Puente Nacional','Puerto Parra','Puerto Wilches','Rionegro','Sabana de Torres','San Andrés','San Benito','San Gil','San Joaquín','San José de Miranda','San Miguel','San Vicente de Chucurí','Santa Bárbara','Santa Helena del Opón','Simacota','Suaita','Sucre','Suratá','Tona','Valle de San José','Vélez','Vetas','Villanueva','Zapatoca'],
  'Sucre': ['Sincelejo','Buenavista','Caimito','Chalán','Colosó','Corozal','Coveñas','El Roble','Galeras','Guaranda','La Unión','Los Palmitos','Majagual','Morroa','Ovejas','Palmito','Sampués','San Benito Abad','San Juan de Betulia','San Marcos','San Onofre','San Pedro','Santiago de Tolú','Sincé','Sucre','Tolú Viejo'],
  'Tolima': ['Ibagué','Alpujarra','Alvarado','Ambalema','Anzoátegui','Armero','Ataco','Cajamarca','Carmen de Apicalá','Casabianca','Chaparral','Coello','Coyaima','Cunday','Dolores','Espinal','Falan','Flandes','Fresno','Guamo','Herveo','Honda','Icononzo','Lérida','Líbano','Mariquita','Melgar','Murillo','Natagaima','Ortega','Palocabildo','Piedras','Planadas','Prado','Purificación','Rioblanco','Roncesvalles','Rovira','Saldaña','San Antonio','San Luis','Santa Isabel','Suárez','Valle de San Juan','Venadillo','Villahermosa','Villarrica'],
  'Valle del Cauca': ['Cali','Alcalá','Andalucía','Ansermanuevo','Argelia','Bolívar','Buenaventura','Buga','Bugalagrande','Caicedonia','Calima','Candelaria','Cartago','Dagua','El Águila','El Cairo','El Cerrito','El Dovio','Florida','Ginebra','Guacarí','Jamundí','La Cumbre','La Unión','La Victoria','Obando','Palmira','Pradera','Restrepo','Riofrío','Roldanillo','San Pedro','Sevilla','Toro','Trujillo','Tuluá','Ulloa','Versalles','Vijes','Yotoco','Yumbo','Zarzal'],
  'Vaupés': ['Mitú','Carurú','Taraira'],
  'Vichada': ['Puerto Carreño','Cumaribo','La Primavera','Santa Rosalía'],
}

const SERVICES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: 'Mantenimiento General',
    desc: 'Revisión completa, lubricación, ajuste de frenos y transmisión.',
    price: '$85.000',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    title: 'Ensamble Personalizado',
    desc: 'Construimos tu bicicleta ideal pieza por pieza según tus especificaciones.',
    price: 'Desde $150.000',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="9" />
        <line x1="12" y1="15" x2="12" y2="22" />
        <line x1="2" y1="12" x2="9" y2="12" />
        <line x1="15" y1="12" x2="22" y2="12" />
      </svg>
    ),
    title: 'Reparación de Pinchazos',
    desc: 'Cambio y reparación de llantas, cámaras y neumáticos tubeless.',
    price: '$25.000',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Envío Express',
    desc: 'Recibe tu bicicleta o repuesto en 24–48 horas a cualquier parte del país.',
    price: '$35.000',
  },
]

const PART_CATEGORIES = [
  {
    title: 'Llantas y Rines',
    desc: 'Cubiertas, cámaras, rines, radios y sistemas tubeless.',
    img: PART_IMAGE_LIBRARY.covers.tires,
    products: [
      { name: 'Llanta Chaoyang MTB 29 x 2.10', price: '$89.900', img: PART_IMAGE_LIBRARY.tires[0] },
      { name: 'Rin de aluminio doble pared 29', price: '$149.900', img: PART_IMAGE_LIBRARY.rims[0] },
      { name: 'Cámara 29 válvula presta', price: '$24.900', img: PART_IMAGE_LIBRARY.tubes[0] },
      { name: 'Kit tubeless para dos ruedas', price: '$79.900', img: PART_IMAGE_LIBRARY.tubeless[0] },
    ],
  },
  {
    title: 'Transmisión',
    desc: 'Cadenas, cassettes, platos, bielas y desviadores.',
    img: PART_IMAGE_LIBRARY.covers.transmission,
    products: [
      { name: 'Cadena Shimano Deore 12 velocidades', price: '$189.900', img: PART_IMAGE_LIBRARY.transmission[0] },
      { name: 'Cassette Shimano 11–51T 11 velocidades', price: '$329.900', img: PART_IMAGE_LIBRARY.transmission[1] },
      { name: 'Desviador Shimano Altus 9 velocidades', price: '$159.900', img: PART_IMAGE_LIBRARY.transmission[2] },
      { name: 'Plato monoplato 32T narrow-wide', price: '$99.900', img: PART_IMAGE_LIBRARY.transmission[3] },
    ],
  },
  {
    title: 'Frenos',
    desc: 'Pastillas, discos, mordazas y sistemas hidráulicos.',
    img: PART_IMAGE_LIBRARY.covers.brakes,
    products: [
      { name: 'Pastillas de resina Shimano B05S', price: '$49.900', img: PART_IMAGE_LIBRARY.brakes[0] },
      { name: 'Disco de freno 180 mm', price: '$79.900', img: PART_IMAGE_LIBRARY.brakes[1] },
      { name: 'Frenos hidráulicos Shimano MT200', price: '$349.900', img: PART_IMAGE_LIBRARY.brakes[2] },
      { name: 'Líquido mineral para frenos 100 ml', price: '$39.900', img: PART_IMAGE_LIBRARY.brakes[3] },
    ],
  },
  {
    title: 'Suspensión',
    desc: 'Horquillas, amortiguadores, retenes y repuestos.',
    img: PART_IMAGE_LIBRARY.covers.suspension,
    products: [
      { name: 'Horquilla Suntour XCM para rin 29', price: '$649.900', img: PART_IMAGE_LIBRARY.suspension[0] },
      { name: 'Amortiguador RockShox Deluxe', price: '$1.249.900', img: PART_IMAGE_LIBRARY.suspension[1] },
      { name: 'Kit de retenes para barras de 32 mm', price: '$89.900', img: PART_IMAGE_LIBRARY.suspension[2] },
      { name: 'Control de bloqueo remoto', price: '$129.900', img: PART_IMAGE_LIBRARY.suspension[3] },
    ],
  },
  {
    title: 'Sillines y Cockpit',
    desc: 'Sillines, manubrios, potencias y puños para mejorar el control y la comodidad.',
    img: PART_IMAGE_LIBRARY.covers.cockpit,
    products: [
      { name: 'Manubrio MTB de aluminio 31.8 mm', price: '$119.900', img: PART_IMAGE_LIBRARY.cockpit[0] },
      { name: 'Potencia MTB corta 31.8 mm', price: '$89.900', img: PART_IMAGE_LIBRARY.cockpit[1] },
      { name: 'Puños ergonómicos con bloqueo', price: '$54.900', img: PART_IMAGE_LIBRARY.cockpit[2] },
      { name: 'Sillín GW deportivo 270 mm', price: '$109.900', img: PART_IMAGE_LIBRARY.cockpit[3] },
    ],
  },
  {
    title: 'Componentes Eléctricos',
    desc: 'Baterías, motores, controladores y kits de conversión.',
    img: PART_IMAGE_LIBRARY.covers.electric,
    products: [
      { name: 'Batería de litio 48V 13Ah', price: '$1.699.900', img: PART_IMAGE_LIBRARY.electric[0] },
      { name: 'Controlador para motor 48V', price: '$289.900', img: PART_IMAGE_LIBRARY.electric[1] },
      { name: 'Pantalla LCD multifunción', price: '$349.900', img: PART_IMAGE_LIBRARY.electric[2] },
      { name: 'Cargador inteligente 48V 2A', price: '$179.900', img: PART_IMAGE_LIBRARY.electric[3] },
    ],
  },
]

const WHEEL_VARIANTS = [
  [
    { name: 'Llanta MTB taqueada', price: '$89.900' },
    { name: 'Llanta urbana plegable 26', price: '$109.900' },
    { name: 'Llanta ruta Vittoria Corsa plegable', price: '$119.900' },
    { name: 'Llanta ruta Schwalbe Lugano 700 x 25', price: '$139.900' },
  ],
  [
    { name: 'Rin delantero para bicicleta urbana', price: '$149.900' },
    { name: 'Rin de aluminio MTB 26', price: '$139.900' },
    { name: 'Rin de aluminio para ruta', price: '$169.900' },
    { name: 'Rueda de carbono Mavic Cosmic', price: '$2.499.900' },
  ],
  [
    { name: 'Cámara para bicicleta urbana', price: '$24.900' },
    { name: 'Cámara con válvula presta', price: '$24.900' },
    { name: 'Cámara de repuesto para ruta', price: '$22.900' },
    { name: 'Cámara Schwalbe 700C', price: '$27.900' },
  ],
  [
    { name: 'Kit reparación tubeless con mechas', price: '$79.900' },
    { name: 'Kit tubeless Genuine Innovations', price: '$89.900' },
    { name: 'Kit de mechas tubeless de recambio', price: '$94.900' },
    { name: 'Kit reparación tubeless con CO₂', price: '$109.900' },
  ],
].map((group, kindIndex) => group.map((item, variantIndex) => ({
  ...item,
  img: PART_IMAGE_LIBRARY.wheels[kindIndex][variantIndex],
})))

// ─── Sub-components ───────────────────────────────────────────────────────────


function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  inWishlist,
}: {
  product: Product | null
  onClose: () => void
  onAddToCart: (p: Product) => void
  onToggleWishlist: (id: number) => void
  inWishlist: boolean
}) {
  const [activeImg, setActiveImg] = useState(0)
  const [addedFeedback, setAddedFeedback] = useState(false)

  useEffect(() => {
    setActiveImg(0)
    setAddedFeedback(false)
  }, [product])

  useEffect(() => {
    if (!product) return
    const previousBodyOverflow = document.body.style.overflow
    const previousDocumentOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousDocumentOverflow
    }
  }, [product])

  if (!product) return null
  const productSpecs = Array.isArray(product.specs) ? product.specs : []
  // Products created from the administration panel may not yet have an
  // explicit gallery. Their primary image must still be visible in detail.
  const productImages = Array.isArray(product.gallery) && product.gallery.filter(Boolean).length > 0
    ? product.gallery.filter(Boolean)
    : [product.img || getBikeCategoryImage(product.category)]

  const handleAdd = () => {
    onAddToCart(product)
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 1800)
  }

  return (
    <>
      <div className="modal-backdrop-animate fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalles de ${product.name}`}
          className="modal-scroll-region bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl modal-animate"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
            <div className="flex items-center gap-2">
              {product.badge && (
                <span className="bg-[#0D5C3A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase">
                  {product.badge}
                </span>
              )}
              <span className="text-[#0D5C3A] text-xs font-bold uppercase tracking-widest">{product.category}</span>
            </div>
            <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all duration-200 flex-shrink-0" title="Cerrar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gallery */}
            <div>
              <div className="rounded-xl overflow-hidden h-72 sm:h-80 mb-3 bg-[#f8f9fa] flex items-center justify-center">
                <img
                  src={productImages[activeImg] ?? productImages[0]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain p-4 transition-all duration-300 img-product"
                  onError={(event) => handleImageFallback(event, getBikeImageFallback(product.category))}
                />
              </div>
              {productImages.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {productImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`rounded-lg overflow-hidden h-14 border-2 transition-all duration-200 ${
                        activeImg === i ? 'border-[#0D5C3A] scale-105 shadow-md' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Vista ${i + 1} de ${product.name}`}
                        className="w-full h-full object-contain bg-white img-thumb"
                        onError={(event) => handleImageFallback(event, getBikeImageFallback(product.category))}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <h2 className="text-3xl font-black text-[#1A1A1A] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {product.name}
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'fill-[#0D5C3A] text-[#0D5C3A]' : 'fill-gray-200 text-gray-200'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.rating} ({product.reviews} reseñas)</span>
              </div>

              <p className="text-gray-500 text-xs leading-relaxed mb-4">{product.description}</p>

              {/* Specs */}
              <div className="bg-[#F4F4F5] rounded-xl p-3 mb-4">
                <h3 className="font-black text-xs text-[#1A1A1A] mb-2.5 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Especificaciones
                </h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {productSpecs.length ? productSpecs.map((s) => (
                    <div key={s.label} className="flex flex-wrap items-baseline gap-x-1 min-w-0">
                      <span className="text-[9px] font-bold text-[#0D5C3A] uppercase tracking-wider shrink-0">{s.label}:</span>
                      <span className="text-[11px] font-semibold text-[#1A1A1A] break-words" style={{ overflowWrap: 'anywhere' }}>{s.value}</span>
                    </div>
                  )) : <p className="col-span-2 text-xs text-gray-500">No hay especificaciones registradas para este producto.</p>}
                </div>
              </div>

              {/* Price + actions */}
              <div className="mt-auto">
                <div className="flex items-baseline gap-2 mb-3">
                  {product.offerDiscount && product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">${product.originalPrice.toLocaleString('es-CO')}</span>
                  )}
                  <span className="text-3xl font-black text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {product.priceLabel}
                  </span>
                  {product.offerDiscount && <span className="text-xs font-bold text-emerald-700">-{product.offerDiscount}%</span>}
                  <span className="text-xs text-gray-400">COP · IVA incluido</span>
                </div>

                {/* Stock indicator */}
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-[#F4F4F5]">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    product.stock === 0 ? 'bg-red-500' :
                    product.stock <= 3 ? 'bg-amber-500' : 'bg-[#1A8A5A]'
                  }`} />
                  <span className="text-xs font-semibold text-[#1A1A1A]">
                    {product.stock === 0
                      ? 'Sin stock'
                      : product.stock <= 3
                      ? `¡Solo quedan ${product.stock} unidades!`
                      : `Disponibles: ${product.stock} unidades`}
                  </span>
                  {product.stock > 0 && product.stock <= 3 && (
                    <span className="ml-auto text-[10px] font-bold text-amber-600 uppercase tracking-wider">Últimas</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAdd}
                    disabled={product.stock === 0}
                    className={`flex-1 font-black py-3.5 rounded-full text-sm tracking-wide transition-all duration-200 ${
                      product.stock === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : addedFeedback
                        ? 'bg-[#1A8A5A] text-white scale-95'
                        : 'bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white'
                    }`}
                  >
                    {product.stock === 0 ? 'Sin stock' : addedFeedback ? '✓ Agregado al carrito' : 'Agregar al carrito'}
                  </button>
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className={`p-3.5 rounded-full border-2 transition-colors ${
                      inWishlist ? 'border-[#0D5C3A] bg-[#0D5C3A]/10' : 'border-gray-200 hover:border-[#0D5C3A]'
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${inWishlist ? 'fill-[#0D5C3A] text-[#0D5C3A]' : 'text-gray-500'}`}
                      fill={inWishlist ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'fill-[#0D5C3A] text-[#0D5C3A]' : 'fill-gray-200 text-gray-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewForm({
  products,
  user,
  onRequestLogin,
  onSubmit,
}: {
  products: Product[]
  user: AuthUser | null
  onRequestLogin: () => void
  onSubmit: (review: { productId: number; rating: number; comment: string }) => Promise<void>
}) {
  const [reviewComment, setReviewComment] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [productId, setProductId] = useState(products[0]?.id ?? 0)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!products.some((product) => product.id === productId)) setProductId(products[0]?.id ?? 0)
  }, [products, productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { onRequestLogin(); return }
    if (!productId) { setReviewError('Selecciona el producto que quieres calificar.'); return }
    if (reviewComment.trim().length < 10) { setReviewError('El comentario debe tener al menos 10 caracteres.'); return }
    if (reviewRating === 0) { setReviewError('Selecciona una calificación de estrellas.'); return }
    setSubmitting(true)
    setReviewError('')
    try {
      await onSubmit({ productId, rating: reviewRating, comment: reviewComment.trim() })
      setReviewSubmitted(true)
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'No fue posible enviar la reseña.')
    } finally {
      setSubmitting(false)
    }
  }

  if (reviewSubmitted) {
    return (
      <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-[#0D5C3A]/20 text-center">
        <div className="w-14 h-14 bg-[#0D5C3A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#0D5C3A]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <p className="font-black text-[#1A1A1A] text-xl mb-1" style={{fontFamily:'Montserrat, sans-serif'}}>¡Gracias por tu reseña!</p>
        <p className="text-gray-500 text-sm">La reseña quedó pendiente de moderación y aparecerá cuando sea aprobada.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-black text-[#1A1A1A] mb-1" style={{fontFamily:'Montserrat, sans-serif'}}>¿Tienes una bicicleta de BS?</h3>
      <p className="text-gray-500 text-sm mb-6">{user ? `Reseña como ${user.name}. Tu opinión se publicará después de moderación.` : 'Inicia sesión para compartir tu experiencia. Todas las reseñas son moderadas.'}</p>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Producto</label>
          <select value={productId} onChange={(event) => setProductId(Number(event.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30" disabled={!products.length}>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Tu calificación</label>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <button key={s} type="button" onClick={() => setReviewRating(s)} onMouseEnter={() => setReviewHover(s)} onMouseLeave={() => setReviewHover(0)} className="transition-transform hover:scale-125">
                <svg className={`w-8 h-8 transition-colors ${s <= (reviewHover || reviewRating) ? 'fill-[#0D5C3A] text-[#0D5C3A]' : 'fill-gray-200 text-gray-200'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
            ))}
            {reviewRating > 0 && <span className="ml-2 text-sm font-bold text-[#0D5C3A]">{['','Malo','Regular','Bueno','Muy bueno','Excelente'][reviewRating]}</span>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tu comentario *</label>
          <textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="Cuéntanos tu experiencia con tu bicicleta BS..." rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all resize-none" />
        </div>
        {reviewError && <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">{reviewError}</p>}
        <button type="submit" disabled={submitting || !products.length} className="bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-black px-8 py-3.5 rounded-full text-sm tracking-wide transition-colors disabled:opacity-50">
          {submitting ? 'Enviando…' : user ? 'Enviar reseña' : 'Iniciar sesión para reseñar'}
        </button>
      </div>
    </form>
  )
}

// Cart icon SVG (shopping cart, not bag)
function CartIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function CartDrawer({
  open,
  onClose,
  items,
  onQtyChange,
  onRemove,
  onCheckout,
}: {
  open: boolean
  onClose: () => void
  items: CartItem[]
  onQtyChange: (id: number, qty: number) => void
  onRemove: (id: number) => void
  onCheckout: () => void
}) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-black text-lg text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Carrito de Compras
          </h2>
          <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all duration-200 flex-shrink-0" title="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <CartIcon className="w-16 h-16 opacity-20" />
              <p className="text-sm font-medium">Tu carrito está vacío</p>
              <button
                onClick={onClose}
                className="bg-[#0D5C3A] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#1A8A5A] transition-colors"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 bg-[#F4F4F5] rounded-xl p-3">
                <img src={item.img} alt={item.name} className="w-20 h-20 object-contain p-1 rounded-lg flex-shrink-0 img-product" />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-[#1A1A1A] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {item.name}
                  </p>
                  <p className="text-[#0D5C3A] font-bold text-sm mt-0.5">{item.priceLabel}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                      <button
                        onClick={() => onQtyChange(item.id, item.qty - 1)}
                        className="px-3 py-1 text-lg font-bold text-gray-600 hover:text-[#0D5C3A] transition-colors"
                      >
                        −
                      </button>
                      <span className="px-2 text-sm font-bold text-[#1A1A1A]">{item.qty}</span>
                      <button
                        onClick={() => onQtyChange(item.id, item.qty + 1)}
                        className="px-3 py-1 text-lg font-bold text-gray-600 hover:text-[#0D5C3A] transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} artículos)</span>
              <span className="font-bold text-[#1A1A1A]">${total.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Envío</span>
              <span className="text-[#0D5C3A] font-bold">Gratis</span>
            </div>
            <div className="flex justify-between font-black text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <span>Total</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
            <button
              onClick={() => { onClose(); onCheckout() }}
              className="w-full bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-black py-3.5 rounded-full transition-colors text-sm tracking-wide flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Proceder al pago
            </button>
            <button onClick={onClose} className="w-full text-center text-sm text-gray-500 hover:text-[#0D5C3A] transition-colors">
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Wishlist Drawer ──────────────────────────────────────────────────────────

function WishlistDrawer({
  open,
  onClose,
  wishlist,
  products,
  onRemoveWishlist,
  onAddToCart,
}: {
  open: boolean
  onClose: () => void
  wishlist: number[]
  products: Product[]
  onRemoveWishlist: (id: number) => void
  onAddToCart: (p: Product) => void
}) {
  const wishlistProducts = products.filter((product) => wishlist.includes(product.id))

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-black text-lg text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Lista de Deseos
            {wishlist.length > 0 && <span className="ml-2 text-sm font-bold text-[#0D5C3A]">({wishlist.length})</span>}
          </h2>
          <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all duration-200 flex-shrink-0" title="Cerrar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <p className="text-sm font-medium">Tu lista de deseos está vacía</p>
              <button
                onClick={onClose}
                className="bg-[#0D5C3A] text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#1A8A5A] transition-colors"
              >
                Explorar bicicletas
              </button>
            </div>
          ) : (
            wishlistProducts.map((p) => (
              <div key={p.id} className="flex gap-3 bg-[#F4F4F5] rounded-xl p-3">
                <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center bg-white">
                  <img src={p.img} alt={p.name} className="w-full h-full object-contain p-1 img-product" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-[#1A1A1A] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{p.name}</p>
                  <p className="text-[#0D5C3A] font-bold text-sm mt-0.5">{p.priceLabel}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => { onAddToCart(p); }}
                      className="bg-[#0D5C3A] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#1A8A5A] transition-colors"
                    >
                      + Carrito
                    </button>
                    <button
                      onClick={() => onRemoveWishlist(p.id)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-[#0D5C3A] hover:text-red-500 transition-colors"
                      title="Quitar de lista de deseos"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

// ─── Parts Modal ──────────────────────────────────────────────────────────────

function PartsModal({
  category,
  onClose,
  onAddToCart,
}: {
  category: (typeof PART_CATEGORIES)[0] | null
  onClose: () => void
  onAddToCart: (item: Pick<CartItem, 'id' | 'name' | 'price' | 'priceLabel' | 'img'>) => void
}) {
  const [addedItemId, setAddedItemId] = useState<number | null>(null)
  const [selectedWheelType, setSelectedWheelType] = useState<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  if (!category) return null

  const categoryIndex = PART_CATEGORIES.indexOf(category)
  const isWheelCategory = categoryIndex === 0
  const products = isWheelCategory && selectedWheelType !== null
    ? WHEEL_VARIANTS[selectedWheelType]
    : category.products

  return (
    <>
      <div className="modal-backdrop-animate fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col modal-animate">
          <div className="parts-modal__header relative h-48 flex-shrink-0 overflow-hidden">
            <img
              src={category.img}
              alt={category.title}
              className="w-full h-full object-cover img-hero"
              onError={(event) => handleImageFallback(event, getPartImageFallback(category.title))}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent" />
            <div className="absolute bottom-5 left-6 right-16">
              <span className="text-green-300 text-[10px] font-bold uppercase tracking-widest">Repuestos disponibles</span>
              <h2 className="text-white text-2xl sm:text-3xl font-black mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {category.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-red-500 transition-colors shadow-md"
              title="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={contentRef} className="parts-modal__content modal-scroll-region overflow-y-auto p-6">
            {isWheelCategory && selectedWheelType !== null && (
              <button
                onClick={() => { setSelectedWheelType(null); contentRef.current?.scrollTo(0, 0) }}
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#0D5C3A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C3A]"
              >
                <span aria-hidden="true">←</span> Volver a Llantas y Rines
              </button>
            )}
            <p className="text-sm text-gray-500 mb-5">
              {isWheelCategory && selectedWheelType !== null
                ? `Elige entre estas 4 opciones de ${['llantas', 'rines', 'cámaras', 'kits tubeless'][selectedWheelType]}. Fotografías reales de referencia; comprueba la medida antes de comprar.`
                : `${category.desc} Precios en pesos colombianos.`}
            </p>
            <div className="parts-modal__product-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product, productIndex) => {
                const choosingType = isWheelCategory && selectedWheelType === null
                const itemId = isWheelCategory
                  ? 2000 + selectedWheelType! * 10 + productIndex
                  : 1000 + categoryIndex * 10 + productIndex
                const numericPrice = Number(product.price.replace(/\D/g, ''))
                const wheelTypeIndex = choosingType ? productIndex : selectedWheelType!
                const image = isWheelCategory
                  ? PART_IMAGE_LIBRARY.wheels[wheelTypeIndex][choosingType ? 0 : productIndex]
                  : product.img
                const imageFallback = isWheelCategory
                  ? getWheelImageFallback(wheelTypeIndex)
                  : getPartImageFallback(category.title)
                const openWheelType = () => { setSelectedWheelType(productIndex); contentRef.current?.scrollTo(0, 0) }
                return (
                  <div
                    key={product.name}
                    className="parts-modal__product-card catalog-card group"
                  >
                    <div className="parts-modal__product-media catalog-card__media relative">
                      {choosingType ? (
                        <button onClick={openWheelType} className="catalog-card__image-button w-full h-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D5C3A]" aria-label={`Ver opciones de ${['llantas', 'rines', 'cámaras', 'kits tubeless'][productIndex]}`}>
                          <img
                            src={image}
                            alt=""
                            className="parts-modal__product-image catalog-card__image group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                            onError={(event) => handleImageFallback(event, imageFallback)}
                          />
                        </button>
                      ) : (
                        <img
                          src={image}
                          alt={product.name}
                          className="parts-modal__product-image catalog-card__image group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          onError={(event) => handleImageFallback(event, imageFallback)}
                        />
                      )}
                    </div>
                    <div className="parts-modal__product-content catalog-card__content">
                      <span className="catalog-card__eyebrow">{choosingType ? '4 opciones disponibles' : 'Disponible en tienda'}</span>
                      {choosingType ? (
                        <button onClick={openWheelType} className="catalog-card__title text-left group-hover:text-[#0D5C3A] hover:underline focus-visible:outline-2 focus-visible:outline-[#0D5C3A]">
                          {['Llantas', 'Rines', 'Cámaras', 'Kits tubeless'][productIndex]}
                        </button>
                      ) : (
                        <p className="catalog-card__title group-hover:text-[#0D5C3A] transition-colors">{product.name}</p>
                      )}
                      {choosingType ? (
                        <button
                          onClick={openWheelType}
                          className="mt-auto w-full rounded-full bg-[#0D5C3A] px-4 py-2 text-xs font-bold text-white hover:bg-[#1A8A5A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C3A] transition-colors"
                        >
                          Ver 4 opciones →
                        </button>
                      ) : (
                        <div className="mt-auto flex items-center justify-between gap-3">
                          <span className="text-[#0D5C3A] font-black whitespace-nowrap group-hover:scale-105 transition-transform origin-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {product.price}
                          </span>
                          <button
                            onClick={() => {
                              onAddToCart({
                                id: itemId,
                                name: product.name,
                                price: numericPrice,
                                priceLabel: product.price,
                                img: image,
                              })
                              setAddedItemId(itemId)
                              setTimeout(() => setAddedItemId(null), 1500)
                            }}
                            className={`text-white text-xs font-bold px-3 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                              addedItemId === itemId ? 'bg-[#1A8A5A] scale-95' : 'bg-[#0D5C3A] hover:bg-[#1A8A5A] hover:scale-105 hover:shadow-md active:scale-95'
                            }`}
                          >
                            {addedItemId === itemId ? '✓ Agregado' : 'Agregar al carrito'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-5 rounded-xl bg-[#0D5C3A]/10 p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-[#0D5C3A] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
              </svg>
              <p className="text-xs text-gray-600 leading-relaxed">
                Confirma la compatibilidad de la pieza con tu bicicleta antes de comprar. Nuestro equipo puede asesorarte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Service Modal ────────────────────────────────────────────────────────────

function ServiceModal({
  service,
  onClose,
}: {
  service: (typeof SERVICES)[0] | null
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [bike, setBike] = useState('')
  const [serviceType, setServiceType] = useState('preventivo')
  const [mileage, setMileage] = useState('')
  const [lastInspection, setLastInspection] = useState('')
  const [mechanicalArea, setMechanicalArea] = useState('')
  const [issueDetails, setIssueDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [appointmentId, setAppointmentId] = useState<number | null>(null)

  if (!service) return null

  const minDateTime = new Date(Date.now() + 60_000 - new Date().getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSaving(true)
    const observations = [
      issueDetails.trim(),
      mileage ? `Kilometraje aproximado: ${digitsOnly(mileage)} km` : '',
      lastInspection ? `Última revisión: ${lastInspection}` : '',
      mechanicalArea ? `Sistema: ${mechanicalArea}` : '',
    ].filter(Boolean).join(' · ')
    try {
      const { id } = await apiRequest<{ id: number }>('/services', {
        method: 'POST',
        body: {
          customerName: name.trim(),
          phone: digitsOnly(phone),
          bike: bike.trim(),
          serviceName: service.title,
          serviceType: service.title.toLowerCase().includes('mantenimiento') ? serviceType : mechanicalArea || null,
          scheduledAt: new Date(date).toISOString(),
          observations,
        },
      })
      setSubmitted(true)
      setAppointmentId(id)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No fue posible agendar la cita. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="modal-backdrop-animate fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden modal-animate">
          <div className="bg-[#0D5C3A] text-white px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-green-300 text-xs font-bold uppercase tracking-widest mb-1">Agendar Servicio</p>
              <h3 className="font-black text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>{service.title}</h3>
              <p className="text-green-200 text-sm mt-1">{service.price}</p>
            </div>
            <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/30 text-white transition-all duration-200 flex-shrink-0" title="Cerrar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-5">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-[#0D5C3A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#0D5C3A]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h4 className="font-black text-[#1A1A1A] text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>¡Cita agendada!</h4>
                <p className="text-gray-500 text-sm">Tu solicitud #{appointmentId} quedó registrada. Nos comunicaremos contigo para confirmar la cita.</p>
                <button onClick={onClose} className="mt-5 bg-[#0D5C3A] text-white font-bold px-8 py-2.5 rounded-full text-sm hover:bg-[#1A8A5A] transition-colors">
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Nombre completo</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={120}
                    placeholder="Tu nombre"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{7,15}"
                    maxLength={15}
                    value={phone}
                    onKeyDown={handleDigitsOnlyKeyDown}
                    onChange={(e) => setPhone(digitsOnly(e.target.value))}
                    required
                    placeholder="300 000 0000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Bicicleta / modelo</label>
                  <input value={bike} onChange={(e) => setBike(e.target.value)} required minLength={2} maxLength={120} placeholder="Marca y modelo" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors" />
                </div>
                {service.title.toLowerCase().includes('mantenimiento') ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Tipo de mantenimiento</label>
                      <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A]">
                        <option value="preventivo">Preventivo / revisión periódica</option>
                        <option value="correctivo">Correctivo</option>
                        <option value="ajuste">Ajuste general</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Kilometraje aproximado</label>
                      <input type="text" inputMode="numeric" pattern="[0-9]*" value={mileage} onKeyDown={handleDigitsOnlyKeyDown} onChange={(e) => setMileage(digitsOnly(e.target.value))} placeholder="Ej. 1200 km" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Última revisión (opcional)</label>
                      <input type="date" value={lastInspection} onChange={(e) => setLastInspection(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Observaciones (opcional)</label>
                      <textarea value={issueDetails} onChange={(e) => setIssueDetails(e.target.value)} maxLength={500} rows={2} placeholder="Cuéntanos qué necesitas revisar" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors" />
                    </div>
                  </>
                ) : service.title.toLowerCase().includes('reparación') ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Sistema o componente</label>
                      <select value={mechanicalArea} onChange={(e) => setMechanicalArea(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A]">
                        <option value="">Selecciona un área</option>
                        <option>Frenos</option>
                        <option>Transmisión</option>
                        <option>Ruedas y llantas</option>
                        <option>Suspensión</option>
                        <option>Cuadro / dirección</option>
                        <option>Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Describe la falla o trabajo requerido</label>
                      <textarea value={issueDetails} onChange={(e) => setIssueDetails(e.target.value)} required minLength={10} maxLength={500} rows={3} placeholder="Cuéntanos qué problema presenta tu bicicleta" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors" />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      {service.title.toLowerCase().includes('ensamble') ? 'Preferencias de armado y componentes' : 'Detalles para coordinar el servicio'}
                    </label>
                    <textarea value={issueDetails} onChange={(e) => setIssueDetails(e.target.value)} required minLength={5} maxLength={500} rows={3} placeholder={service.title.toLowerCase().includes('ensamble') ? 'Describe el uso y los componentes que prefieres' : 'Indica dirección, horario u observaciones'} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Fecha deseada</label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={minDateTime}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors"
                  />
                </div>
                {submitError && <p role="alert" className="text-sm text-red-600">{submitError}</p>}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#0D5C3A] hover:bg-[#1A8A5A] disabled:opacity-60 disabled:cursor-wait text-white font-black py-3 rounded-full text-sm tracking-wide transition-all duration-200 hover:-translate-y-0.5"
                >
                  {saving ? 'Agendando…' : 'Confirmar Cita'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

interface ChatWidgetMessage {
  id: number | string
  sender: 'user' | 'assistant'
  message: string
  createdAt: string
}

const OPEN_CHAT_EVENT = 'bike-store:open-chat'

function FloatingChatWidget({ user }: { user: AuthUser | null }) {
  const [sessionId, setSessionId] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [messages, setMessages] = useState<ChatWidgetMessage[]>([])
  const [message, setMessage] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [sending, setSending] = useState(false)
  const [showEscalation, setShowEscalation] = useState(false)
  const [escalating, setEscalating] = useState(false)
  const [offerEscalation, setOfferEscalation] = useState(true)
  const [error, setError] = useState('')
  const [contact, setContact] = useState({ name: '', email: '', phone: '', request: '' })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const openChat = () => {
      setIsDismissed(false)
      setIsOpen(true)
    }
    window.addEventListener(OPEN_CHAT_EVENT, openChat)
    return () => window.removeEventListener(OPEN_CHAT_EVENT, openChat)
  }, [])

  useEffect(() => {
    let active = true
    try {
      if (user) {
        setSessionId('')
        setMessages([])
        void apiRequest<{ sessionId: string }>('/chat/session', { method: 'POST' })
          .then(({ sessionId: canonicalSessionId }) => {
            if (!active) return
            window.localStorage.setItem(`bs-bike-store-chat-session-user-${user.id}`, canonicalSessionId)
            setSessionId(canonicalSessionId)
          })
          .catch((sessionError: unknown) => {
            if (active) setError(sessionError instanceof Error ? sessionError.message : 'No se pudo preparar tu conversación.')
          })
      } else {
        const storageKey = 'bs-bike-store-chat-session-guest'
        const savedSessionId = window.localStorage.getItem(storageKey)
        const nextSessionId = savedSessionId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(savedSessionId)
          ? savedSessionId
          : window.crypto.randomUUID()
        window.localStorage.setItem(storageKey, nextSessionId)
        setSessionId(nextSessionId)
      }
    } catch (storageError) {
      console.error('No fue posible preparar la sesión persistente del chat.', storageError)
      setError('No se pudo inicializar el chat en este navegador.')
    }
    return () => { active = false }
  }, [user?.id])

  useEffect(() => {
    if (!isOpen || !sessionId) return
    let active = true
    setLoadingHistory(true)
    setError('')
    void apiRequest<{ sessionId?: string; items: ChatWidgetMessage[] }>(`/chat/history/${encodeURIComponent(sessionId)}`)
      .then(({ sessionId: resolvedSessionId, items }) => {
        if (!active) return
        if (resolvedSessionId && resolvedSessionId !== sessionId) setSessionId(resolvedSessionId)
        setMessages(items)
      })
      .catch((historyError: unknown) => {
        if (active) setError(historyError instanceof TypeError
          ? 'No fue posible conectar con el servidor para cargar la conversación.'
          : historyError instanceof Error ? historyError.message : 'No fue posible cargar el historial del chat.')
      })
      .finally(() => {
        if (active) setLoadingHistory(false)
      })
    return () => { active = false }
  }, [isOpen, sessionId, user?.id])

  useEffect(() => {
    if (!user) return
    setContact((previous) => ({
      ...previous,
      name: previous.name || user.name,
      email: previous.email || user.email,
    }))
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending, showEscalation, isOpen])

  const sendMessage = async (draft = message) => {
    const text = draft.trim()
    if (!text || !sessionId || sending || loadingHistory) return
    setSending(true)
    setError('')
    try {
      const result = await apiRequest<{
        userMessage: ChatWidgetMessage
        assistantMessage: ChatWidgetMessage
        offerEscalation: boolean
      }>('/chat', { method: 'POST', body: { sessionId, message: text } })
      setMessages((previous) => [...previous, result.userMessage, result.assistantMessage])
      setOfferEscalation(result.offerEscalation)
      setMessage((previous) => previous === draft ? '' : previous)
    } catch (sendError) {
      setError(sendError instanceof ApiRequestError
        ? sendError.message
        : 'No fue posible conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const sendEscalation = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!sessionId || escalating) return
    setEscalating(true)
    setError('')
    try {
      const result = await apiRequest<{ message: string; createdAt: string }>('/chat/escalation', {
        method: 'POST',
        body: { sessionId, ...contact },
      })
      setMessages((previous) => [
        ...previous,
        { id: `escalation-user-${Date.now()}`, sender: 'user', message: `Solicitud de asesor: ${contact.request.trim()}`, createdAt: result.createdAt },
        { id: `escalation-assistant-${Date.now()}`, sender: 'assistant', message: result.message, createdAt: result.createdAt },
      ])
      setShowEscalation(false)
      setOfferEscalation(false)
    } catch (escalationError) {
      setError(escalationError instanceof Error ? escalationError.message : 'No fue posible enviar la solicitud al asesor.')
    } finally {
      setEscalating(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#0D5C3A] focus:ring-2 focus:ring-[#0D5C3A]/15'

  if (isDismissed) return null

  return (
    <div className="bike-chat-widget fixed bottom-4 right-4 z-[130] flex flex-col items-end gap-3">
      {isOpen && (
        <section
          aria-label="Chat de asesoría Bike Store"
          className="bike-chat-window flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          style={{ height: 'min(650px, calc(100dvh - 7rem))' }}
        >
          <header className="flex items-center justify-between bg-[#0D5C3A] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15" aria-hidden="true">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
                </svg>
              </span>
              <div>
                <h2 className="text-sm font-bold">Asesor Bike Store</h2>
                <p className="flex items-center gap-1.5 text-xs text-green-100"><span className="h-2 w-2 rounded-full bg-green-300" />En línea · respuesta automática</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar chat" className="rounded-full p-2 text-white/90 transition-colors hover:bg-white/15">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m18 6-12 12M6 6l12 12" /></svg>
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col bg-[#F8FAF9]">
            <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 text-sm text-gray-700 shadow-sm">
                ¡Hola! Puedo orientarte sobre bicicletas y precios, pedidos, repuestos, pagos y citas de taller.
              </div>
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2" aria-label="Respuestas rápidas">
                  {['Ver bicicletas', 'Estado de mi pedido', 'Agendar taller'].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void sendMessage(suggestion)}
                      disabled={!sessionId || sending || loadingHistory}
                      className="rounded-full border border-[#0D5C3A]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#0D5C3A] transition-colors hover:bg-[#0D5C3A]/5 disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {loadingHistory && <p className="text-center text-xs text-gray-500">Cargando conversación…</p>}
              {messages.map((chatMessage) => (
                <div key={chatMessage.id} className={`flex ${chatMessage.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-3 text-sm leading-relaxed ${
                    chatMessage.sender === 'user'
                      ? 'rounded-tr-sm bg-[#0D5C3A] text-white'
                      : 'rounded-tl-sm bg-white text-gray-700 shadow-sm'
                  }`}>
                    {chatMessage.message}
                  </p>
                </div>
              ))}
              {sending && <p className="text-xs text-gray-500">El asistente está escribiendo…</p>}
              <div ref={messagesEndRef} />
            </div>

            {offerEscalation && !showEscalation && (
              <button
                type="button"
                onClick={() => setShowEscalation(true)}
                className="mx-4 mb-2 self-start rounded-full border border-[#0D5C3A] px-3 py-1.5 text-xs font-bold text-[#0D5C3A] transition-colors hover:bg-[#0D5C3A]/5"
              >
                Solicitar asesor humano
              </button>
            )}

            {showEscalation ? (
              <form onSubmit={sendEscalation} className="space-y-2 border-t border-gray-100 bg-white p-3">
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputClass} aria-label="Nombre para el asesor" required minLength={2} maxLength={120} placeholder="Nombre" value={contact.name} onChange={(event) => setContact((previous) => ({ ...previous, name: event.target.value }))} />
                  <input className={inputClass} aria-label="Correo para el asesor" required type="email" maxLength={190} placeholder="Correo" value={contact.email} onChange={(event) => setContact((previous) => ({ ...previous, email: event.target.value }))} />
                </div>
                <input className={inputClass} aria-label="Teléfono para el asesor" required type="tel" inputMode="numeric" pattern="[0-9]{7,15}" maxLength={15} placeholder="Teléfono (solo números)" value={contact.phone} onKeyDown={handleDigitsOnlyKeyDown} onChange={(event) => setContact((previous) => ({ ...previous, phone: digitsOnly(event.target.value) }))} />
                <textarea className={inputClass} aria-label="Motivo de contacto con asesor" required minLength={2} maxLength={1000} rows={2} placeholder="¿En qué puede ayudarte el asesor?" value={contact.request} onChange={(event) => setContact((previous) => ({ ...previous, request: event.target.value }))} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowEscalation(false)} className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600">Cancelar</button>
                  <button type="submit" disabled={escalating} className="flex-1 rounded-xl bg-[#0D5C3A] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1A8A5A] disabled:opacity-60">
                    {escalating ? 'Enviando…' : 'Enviar solicitud'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); void sendMessage() }} className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
                <input
                  aria-label="Escribe tu mensaje"
                  className={inputClass}
                  maxLength={2000}
                  placeholder="Escribe tu consulta…"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={!sessionId || loadingHistory}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void sendMessage()
                    }
                  }}
                />
                <button type="submit" aria-label="Enviar mensaje" disabled={!message.trim() || !sessionId || sending || loadingHistory} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#0D5C3A] text-white transition-colors hover:bg-[#1A8A5A] disabled:cursor-not-allowed disabled:opacity-50">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                </button>
              </form>
            )}
            <p className="bg-white px-3 pb-2 text-center text-[10px] text-gray-500">La conversación se guarda para dar seguimiento a tu consulta.</p>
            {error && <p role="alert" className="bg-white px-3 pb-3 text-center text-xs text-red-600">{error}</p>}
          </div>
        </section>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={isOpen ? 'Cerrar asesoría' : 'Solicitar asesoría'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="bike-chat-widget__action flex min-h-12 items-center gap-2 rounded-full bg-[#0D5C3A] px-5 py-3.5 font-bold text-white shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1A8A5A] hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C3A]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
          </svg>
          <span>{isOpen ? 'Cerrar chat' : 'Solicitar asesoría'}</span>
        </button>
        <button
          type="button"
          aria-label="Ocultar el asistente de chat"
          title="Ocultar el asistente"
          onClick={() => setIsDismissed(true)}
          className="bike-chat-widget__dismiss flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C3A]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="m18 6-12 12M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

// ─── Legal Modals ─────────────────────────────────────────────────────────────

function LegalModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [])
  return (
    <>
      <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
            <h2 className="font-black text-lg text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{title}</h2>
            <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all duration-200 flex-shrink-0" title="Cerrar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5 prose prose-sm max-w-none text-gray-600 space-y-4 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

function TerminosModal({ onClose }: { onClose: () => void }) {
  return (
    <LegalModal title="Términos y Condiciones" onClose={onClose}>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Última actualización: 1 de septiembre de 2026</p>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">1. Aceptación de los términos</h3>
        <p>Al acceder y utilizar el sitio web de <strong>BS Bike Store</strong> (en adelante "la Tienda"), usted acepta quedar obligado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, le pedimos que no utilice nuestros servicios.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">2. Descripción del servicio</h3>
        <p>BS Bike Store es una tienda en línea dedicada a la comercialización de bicicletas, accesorios y servicios de taller para ciclistas en Colombia. Nos reservamos el derecho de modificar o interrumpir cualquier servicio sin previo aviso.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">3. Registro y cuenta de usuario</h3>
        <p>Para realizar compras, el usuario debe registrarse proporcionando información veraz y actualizada. El usuario es responsable de mantener la confidencialidad de su contraseña y de todas las actividades realizadas desde su cuenta. Notifíquenos inmediatamente ante cualquier uso no autorizado.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">4. Precios y disponibilidad</h3>
        <p>Todos los precios publicados están expresados en Pesos Colombianos (COP) e incluyen IVA. BS Bike Store se reserva el derecho de modificar precios sin previo aviso. La disponibilidad de los productos está sujeta al inventario existente. En caso de error en el precio publicado, nos contactaremos con el cliente antes de procesar el pedido.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">5. Proceso de compra y pago</h3>
        <p>Las compras realizadas en nuestro portal se procesan mediante los siguientes métodos de pago: tarjeta de crédito/débito, PSE, transferencia bancaria y efectivo en puntos autorizados. Una vez confirmado el pago, recibirá un correo electrónico de confirmación con el número de pedido. BS Bike Store no almacena datos de tarjetas de crédito.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">6. Envío y entrega</h3>
        <p>Realizamos envíos a todo el territorio colombiano. El tiempo estimado de entrega es de 3 a 7 días hábiles desde la confirmación del pago. Los costos de envío se calculan en el momento del checkout. BS Bike Store no se hace responsable por demoras causadas por terceros (transportadoras, aduanas, desastres naturales o eventos de fuerza mayor).</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">7. Devoluciones y garantía</h3>
        <p>El cliente tiene derecho a solicitar cambio o devolución dentro de los 15 días calendario siguientes a la recepción del producto, siempre que este se encuentre en perfectas condiciones, sin uso y con su empaque original. Las bicicletas cuentan con garantía del fabricante de mínimo 1 año contra defectos de fabricación. Para ejercer la garantía, el cliente debe presentar la factura de compra.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">8. Propiedad intelectual</h3>
        <p>Todos los contenidos del sitio (imágenes, textos, logotipos, diseños) son propiedad de BS Bike Store o de sus respectivos titulares y están protegidos por las leyes de propiedad intelectual de Colombia. Queda prohibida su reproducción sin autorización escrita.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">9. Limitación de responsabilidad</h3>
        <p>BS Bike Store no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de nuestros productos o servicios. Nuestra responsabilidad máxima se limitará al valor del producto adquirido.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">10. Legislación aplicable</h3>
        <p>Estos Términos y Condiciones se rigen por las leyes de la República de Colombia, incluyendo la Ley 1480 de 2011 (Estatuto del Consumidor) y sus decretos reglamentarios. Cualquier disputa se resolverá ante los jueces y tribunales competentes de la ciudad de Bogotá D.C.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">11. Contacto</h3>
        <p>Para cualquier consulta sobre estos términos, escríbanos a <span className="text-[#0D5C3A] font-semibold">legal@bsbikestore.com</span> o llámenos al <span className="font-semibold">601 234 5678</span>.</p>
      </section>
    </LegalModal>
  )
}

function PrivacidadModal({ onClose }: { onClose: () => void }) {
  return (
    <LegalModal title="Política de Privacidad" onClose={onClose}>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Última actualización: 1 de septiembre de 2026</p>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">1. Responsable del tratamiento</h3>
        <p><strong>BS Bike Store S.A.S</strong>, con NIT 900.234.567-1, domiciliada en Bogotá D.C., Colombia, actúa como responsable del tratamiento de sus datos personales, en cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">2. Datos que recopilamos</h3>
        <p>Recopilamos los siguientes datos personales cuando usted utiliza nuestros servicios:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>Datos de identificación:</strong> nombre completo, número de cédula o documento de identidad.</li>
          <li><strong>Datos de contacto:</strong> correo electrónico, número de teléfono, dirección de domicilio.</li>
          <li><strong>Datos de transacción:</strong> historial de compras, método de pago (no almacenamos datos completos de tarjetas).</li>
          <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas, tiempo de permanencia.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">3. Finalidad del tratamiento</h3>
        <p>Sus datos son utilizados para:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Procesar y gestionar sus pedidos y pagos.</li>
          <li>Enviarle confirmaciones de compra y notificaciones de envío.</li>
          <li>Brindar soporte al cliente y gestionar garantías.</li>
          <li>Enviarle comunicaciones comerciales (con su consentimiento previo).</li>
          <li>Mejorar nuestros productos, servicios y experiencia de usuario.</li>
          <li>Cumplir con obligaciones legales y contables.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">4. Base legal del tratamiento</h3>
        <p>El tratamiento de sus datos se realiza con base en: (a) la ejecución del contrato de compraventa, (b) el cumplimiento de obligaciones legales, y (c) su consentimiento expreso para comunicaciones de marketing.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">5. Transferencia de datos a terceros</h3>
        <p>Podemos compartir sus datos con terceros únicamente en los siguientes casos: operadores logísticos (para gestión de envíos), pasarelas de pago autorizadas, autoridades competentes cuando sea requerido por ley. No vendemos ni cedemos sus datos a terceros con fines comerciales.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">6. Derechos del titular</h3>
        <p>Como titular de sus datos personales, usted tiene derecho a: <strong>conocer</strong> los datos que tenemos sobre usted, <strong>actualizar</strong> y rectificar información inexacta, <strong>solicitar la supresión</strong> de sus datos cuando no sean necesarios, <strong>revocar</strong> el consentimiento otorgado, y <strong>presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC).</p>
        <p className="mt-2">Para ejercer estos derechos, escríbanos a <span className="text-[#0D5C3A] font-semibold">privacidad@bsbikestore.com</span>.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">7. Seguridad de los datos</h3>
        <p>Implementamos medidas técnicas y organizativas adecuadas para proteger sus datos contra acceso no autorizado, pérdida o destrucción. Utilizamos cifrado SSL para todas las transacciones y no almacenamos datos completos de tarjetas de pago.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">8. Retención de datos</h3>
        <p>Conservamos sus datos personales durante el tiempo necesario para cumplir con las finalidades descritas y las obligaciones legales aplicables (mínimo 5 años para datos contables y de facturación, según la ley colombiana).</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">9. Cambios en esta política</h3>
        <p>Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos cualquier cambio significativo por correo electrónico o mediante un aviso destacado en nuestro sitio web.</p>
      </section>
    </LegalModal>
  )
}

function CookiesModal({ onClose }: { onClose: () => void }) {
  const [prefs, setPrefs] = useState({ funcionales: true, analiticas: true, marketing: false })
  const [saved, setSaved] = useState(false)

  const save = () => { setSaved(true); setTimeout(() => { setSaved(false); onClose() }, 1200) }

  return (
    <LegalModal title="Política de Cookies" onClose={onClose}>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Última actualización: 1 de septiembre de 2026</p>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">¿Qué son las cookies?</h3>
        <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Nos permiten reconocerle en visitas posteriores, recordar sus preferencias y mejorar su experiencia de navegación.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">Tipos de cookies que utilizamos</h3>
        <div className="space-y-4 mt-3">

          {/* Esenciales */}
          <div className="bg-[#F4F4F5] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-black text-sm text-[#1A1A1A]">🔒 Cookies esenciales</p>
                <p className="text-xs text-gray-500 mt-1">Necesarias para el funcionamiento básico del sitio: autenticación, carrito de compras, preferencias de sesión. No pueden desactivarse.</p>
              </div>
              <div className="w-10 h-5 rounded-full bg-[#0D5C3A] relative flex-shrink-0 mt-1">
                <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>

          {/* Funcionales */}
          <div className="bg-[#F4F4F5] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-black text-sm text-[#1A1A1A]">⚙️ Cookies funcionales</p>
                <p className="text-xs text-gray-500 mt-1">Recuerdan sus preferencias como idioma, ciudad de entrega predeterminada y productos en lista de deseos.</p>
              </div>
              <button
                onClick={() => setPrefs(p => ({...p, funcionales: !p.funcionales}))}
                className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 mt-1 ${prefs.funcionales ? 'bg-[#0D5C3A]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${prefs.funcionales ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Analíticas */}
          <div className="bg-[#F4F4F5] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-black text-sm text-[#1A1A1A]">📊 Cookies analíticas</p>
                <p className="text-xs text-gray-500 mt-1">Nos ayudan a entender cómo los visitantes interactúan con el sitio (páginas más visitadas, tiempo de permanencia, errores). Usamos Google Analytics con IP anonimizada.</p>
              </div>
              <button
                onClick={() => setPrefs(p => ({...p, analiticas: !p.analiticas}))}
                className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 mt-1 ${prefs.analiticas ? 'bg-[#0D5C3A]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${prefs.analiticas ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Marketing */}
          <div className="bg-[#F4F4F5] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-black text-sm text-[#1A1A1A]">📣 Cookies de marketing</p>
                <p className="text-xs text-gray-500 mt-1">Permiten mostrarle anuncios relevantes en otras plataformas (Meta, Google Ads) basados en sus intereses y comportamiento de navegación.</p>
              </div>
              <button
                onClick={() => setPrefs(p => ({...p, marketing: !p.marketing}))}
                className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 mt-1 ${prefs.marketing ? 'bg-[#0D5C3A]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${prefs.marketing ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">Gestión de cookies en su navegador</h3>
        <p>Puede configurar su navegador para rechazar todas las cookies o para que le avise antes de aceptarlas. Tenga en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad del sitio. Consulte la ayuda de su navegador para más información.</p>
      </section>

      <section>
        <h3 className="font-black text-[#1A1A1A] text-base mb-2">Cookies de terceros</h3>
        <p>Algunos de nuestros socios (pasarelas de pago, redes sociales, servicios de análisis) pueden instalar sus propias cookies. BS Bike Store no controla estas cookies de terceros; le recomendamos revisar sus respectivas políticas de privacidad.</p>
      </section>

      <div className="pt-2 flex gap-3">
        <button
          onClick={save}
          className={`flex-1 font-black py-3 rounded-full text-sm transition-all ${saved ? 'bg-[#1A8A5A] text-white scale-95' : 'bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white'}`}
        >
          {saved ? '✓ Preferencias guardadas' : 'Guardar preferencias'}
        </button>
        <button
          onClick={() => { setPrefs({ funcionales: true, analiticas: true, marketing: true }); save() }}
          className="border border-gray-200 hover:border-[#0D5C3A] text-gray-600 font-bold px-4 py-3 rounded-full text-sm transition-colors"
        >
          Aceptar todas
        </button>
      </div>
    </LegalModal>
  )
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

type PayMethod = 'efectivo'
type CheckoutStep = 'envio' | 'pago' | 'confirmacion'

function CheckoutModal({
  items,
  user,
  onClose,
  onSuccess,
}: {
  items: CartItem[]
  user: AuthUser
  onClose: () => void
  onSuccess: (order: PersistedOrder) => void
}) {
  const [step, setStep] = useState<CheckoutStep>('envio')
  const [payMethod, setPayMethod] = useState<PayMethod>('efectivo')
  const [processing, setProcessing] = useState(false)
  const [formError, setFormError] = useState('')
  const [savedOrder, setSavedOrder] = useState<PersistedOrder | null>(null)

  // Shipping form
  const [form, setForm] = useState({
    nombre: user.name,
    email: user.email,
    telefono: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    notas: '',
  })

  const [efectivoPunto, setEfectivoPunto] = useState('efecty')

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const iva = Math.round(total * 0.19)
  const grandTotal = total + iva

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all'
  const errCls = 'border-red-400 bg-red-50'

  const validateShipping = () => {
    if (!form.nombre.trim()) return 'Ingresa tu nombre completo'
    if (!form.telefono.trim() || form.telefono.replace(/\D/g, '').length < 7) return 'Ingresa un teléfono válido'
    if (!form.direccion.trim()) return 'Ingresa la dirección de entrega'
    if (!form.ciudad.trim()) return 'Ingresa la ciudad'
    return ''
  }

  const handleNextStep = () => {
    const err = validateShipping()
    if (err) { setFormError(err); return }
    setFormError('')
    setStep('pago')
  }

  const handlePay = async () => {
    setFormError('')
    setProcessing(true)
    try {
      const order = await apiRequest<PersistedOrder>('/orders', {
        method: 'POST',
        body: {
          items: items.map((item) => ({ productId: item.id, quantity: item.qty })),
          paymentMethod: 'cash',
          paymentPoint: efectivoPunto,
          shipping: {
            name: form.nombre.trim(),
            phone: form.telefono.trim(),
            department: form.departamento || 'No especificado',
            city: form.ciudad.trim(),
            address: form.direccion.trim(),
            notes: form.notas.trim() || undefined,
          },
        },
      })
      setSavedOrder(order)
      setStep('confirmacion')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No fue posible guardar el pedido.')
    } finally {
      setProcessing(false)
    }
  }

  const steps: CheckoutStep[] = ['envio', 'pago', 'confirmacion']
  const stepLabel: Record<CheckoutStep, string> = { envio: 'Envío', pago: 'Pago', confirmacion: 'Listo' }

  // Persistent order summary sidebar
  const OrderSummary = () => (
    <div className="bg-[#F4F4F5] rounded-2xl p-4 space-y-3">
      <p className="text-xs font-black text-[#1A1A1A] uppercase tracking-wider">Tu pedido</p>
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img src={item.img} alt={item.name} className="w-12 h-12 rounded-xl object-contain p-1 img-product" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1A1A1A] text-white text-[10px] font-black rounded-full flex items-center justify-center">{item.qty}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#1A1A1A] truncate">{item.name}</p>
          </div>
          <span className="text-xs font-black text-[#1A1A1A] flex-shrink-0">${(item.price * item.qty).toLocaleString('es-CO')}</span>
        </div>
      ))}
      <div className="border-t border-gray-200 pt-3 space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Subtotal</span><span>${total.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>IVA (19%)</span><span>${iva.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500"><span>Envío</span><span className="text-[#0D5C3A] font-bold">Gratis</span></div>
        <div className="flex justify-between font-black text-[#0D5C3A] text-sm pt-1" style={{fontFamily:'Montserrat,sans-serif'}}>
          <span>Total</span><span>${grandTotal.toLocaleString('es-CO')} COP</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={step !== 'confirmacion' ? onClose : undefined} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col modal-animate">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              {step !== 'confirmacion' && (
                <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all duration-200 flex-shrink-0" title="Cerrar">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              )}
              <h2 className="font-black text-[#1A1A1A] text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {step === 'confirmacion' ? '¡Pedido confirmado!' : 'Finalizar compra'}
              </h2>
            </div>
            {/* Step indicator */}
            {step !== 'confirmacion' && (
              <div className="flex items-center gap-1">
                {steps.filter(s => s !== 'confirmacion').map((s, i) => (
                  <React.Fragment key={s}>
                    <div className={`flex items-center gap-1 text-xs font-bold transition-colors ${step === s ? 'text-[#0D5C3A]' : steps.indexOf(step) > i ? 'text-gray-400' : 'text-gray-300'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === s ? 'bg-[#0D5C3A] text-white' : steps.indexOf(step) > i ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-300'}`}>
                        {steps.indexOf(step) > i ? '✓' : i + 1}
                      </div>
                      <span className="hidden sm:block">{stepLabel[s]}</span>
                    </div>
                    {i < 1 && <div className={`w-8 h-px mx-1 ${steps.indexOf(step) > i ? 'bg-gray-300' : 'bg-gray-100'}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className={`flex-1 ${step !== 'confirmacion' ? 'grid grid-cols-1 md:grid-cols-[1fr_280px]' : ''}`}>
            {/* Left: form area */}
            <div className="p-6">

            {/* ── STEP 1: Envío ── */}
            {step === 'envio' && (
              <div className="space-y-5">

                <div>
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-3 uppercase tracking-wide">Información de envío</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre completo *</label>
                      <input className={inputCls} value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Tu nombre completo" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Teléfono *</label>
                      <input className={inputCls} type="tel" inputMode="numeric" pattern="[0-9]{7,15}" maxLength={15} value={form.telefono} onKeyDown={handleDigitsOnlyKeyDown} onChange={e => setForm(f => ({...f, telefono: digitsOnly(e.target.value)}))} placeholder="3102345678" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Dirección de entrega *</label>
                      <input className={inputCls} value={form.direccion} onChange={e => setForm(f => ({...f, direccion: e.target.value}))} placeholder="Calle 80 # 12-34, Apto 501" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Departamento</label>
                      <select className={inputCls} value={form.departamento} onChange={e => setForm(f => ({...f, departamento: e.target.value, ciudad: ''}))}>
                        <option value="">Seleccionar departamento...</option>
                        {Object.keys(COLOMBIA_DEPTS).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Ciudad *</label>
                      {form.departamento && COLOMBIA_DEPTS[form.departamento] ? (
                        <select className={inputCls} value={form.ciudad} onChange={e => setForm(f => ({...f, ciudad: e.target.value}))}>
                          <option value="">Seleccionar ciudad...</option>
                          {COLOMBIA_DEPTS[form.departamento].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <input className={inputCls} value={form.ciudad} onChange={e => setForm(f => ({...f, ciudad: e.target.value}))} placeholder="Selecciona primero un departamento" />
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Notas adicionales</label>
                      <textarea className={`${inputCls} resize-none`} rows={2} value={form.notas} onChange={e => setForm(f => ({...f, notas: e.target.value}))} placeholder="Indicaciones para la entrega, color de puerta, etc." />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0D5C3A]/5 border border-[#0D5C3A]/20 rounded-xl p-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0D5C3A] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  <p className="text-xs text-[#0D5C3A] font-semibold">Envío gratis a todo Colombia · 3–7 días hábiles</p>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-black py-3.5 rounded-full text-sm transition-colors"
                >
                  Continuar al pago →
                </button>
                {formError && step === 'envio' && (
                  <p className="text-xs text-red-500 font-semibold text-center -mt-1">{formError}</p>
                )}
              </div>
            )}

            {/* ── STEP 2: Pago ── */}
            {step === 'pago' && (
              <div className="space-y-5">
                <h3 className="font-black text-sm text-[#1A1A1A] uppercase tracking-wide">Selecciona tu método de pago</h3>

                {/* Payment method tabs */}
                <div className="grid grid-cols-1 gap-3">
                  {([
                    { id: 'efectivo', label: 'Efectivo', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg> },
                  ] as const).map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${payMethod === m.id ? 'border-[#0D5C3A] bg-[#0D5C3A]/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`${payMethod === m.id ? 'text-[#0D5C3A]' : 'text-gray-400'}`}>{m.icon}</div>
                      <span className={`text-sm font-bold ${payMethod === m.id ? 'text-[#0D5C3A]' : 'text-gray-600'}`}>{m.label}</span>
                      {payMethod === m.id && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-[#0D5C3A] flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Efectivo */}
                {payMethod === 'efectivo' && (
                  <div className="bg-[#F4F4F5] rounded-2xl p-5 space-y-4">
                    <p className="text-xs text-gray-500 font-medium">Paga en efectivo en el punto de tu elección</p>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Punto de pago</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'efecty', label: 'Efecty' },
                          { id: 'baloto', label: 'Baloto' },
                          { id: 'superpagos', label: 'Su Red' },
                          { id: 'tienda', label: 'Tienda BS' },
                        ].map(p => (
                          <button key={p.id} onClick={() => setEfectivoPunto(p.id)}
                            className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all ${efectivoPunto === p.id ? 'border-[#0D5C3A] bg-[#0D5C3A]/5 text-[#0D5C3A]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Código de pago</p>
                      <p className="text-sm font-black text-[#1A1A1A] tracking-wide" style={{fontFamily:'Montserrat,sans-serif'}}>Se genera al reservar</p>
                      <p className="text-[11px] text-gray-400 mt-1">El comprobante incluirá la referencia guardada del pedido</p>
                    </div>
                    <p className="text-[11px] text-gray-400">Tu pedido se procesará al confirmar el pago. Tienes <span className="font-bold text-[#1A1A1A]">48 horas</span> para realizar el pago.</p>
                  </div>
                )}

                {/* Order total */}
                <div className="bg-[#F4F4F5] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span>${total.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500"><span>IVA (19%)</span><span>${iva.toLocaleString('es-CO')}</span></div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Envío</span>
                    <span className="text-[#0D5C3A] font-bold">Gratis</span>
                  </div>
                  <div className="flex justify-between font-black text-[#1A1A1A] text-sm border-t border-gray-200 pt-2" style={{fontFamily:'Montserrat,sans-serif'}}>
                    <span>Total a pagar</span>
                    <span className="text-[#0D5C3A]">${grandTotal.toLocaleString('es-CO')} COP</span>
                  </div>
                </div>

                {formError && step === 'pago' && (
                  <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">{formError}</p>
                )}

                <div className="flex gap-3">
                  <button onClick={() => { setStep('envio'); setFormError('') }} className="flex-none border border-gray-200 hover:border-gray-300 text-gray-600 font-bold px-5 py-3.5 rounded-full text-sm transition-colors">
                    ← Volver
                  </button>
                  <button
                    onClick={handlePay}
                    disabled={processing}
                    className="flex-1 bg-[#0D5C3A] hover:bg-[#1A8A5A] disabled:bg-[#0D5C3A]/60 text-white font-black py-3.5 rounded-full text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Confirmar pedido
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Confirmación ── */}
            {step === 'confirmacion' && savedOrder && (() => {
              const invoice = savedOrder.invoice
              const invoiceDate = new Date(invoice.issuedAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
              const subtotal = invoice.subtotal
              const iva = invoice.taxAmount
              const totalConIva = invoice.total
              const payLabel = `Efectivo · ${invoice.paymentPoint}`

              const handleDownload = () => {
                try {
                  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
                  const pageWidth = pdf.internal.pageSize.getWidth()
                  const margin = 16
                  let y = 20
                  const formatCop = (amount: number) => `$${amount.toLocaleString('es-CO')} COP`

                  pdf.setFillColor(13, 92, 58)
                  pdf.rect(0, 0, pageWidth, 38, 'F')
                  pdf.setTextColor(255, 255, 255)
                  pdf.setFont('helvetica', 'bold')
                  pdf.setFontSize(18)
                  pdf.text('BS BIKE STORE', margin, y)
                  pdf.setFontSize(10)
                  pdf.setFont('helvetica', 'normal')
                  pdf.text('NIT: 900.123.456-7', margin, y + 7)
                  pdf.text('FACTURA DE VENTA', pageWidth - margin, y, { align: 'right' })
                  pdf.setFont('helvetica', 'bold')
                  pdf.text(invoice.number, pageWidth - margin, y + 7, { align: 'right' })
                  pdf.setFont('helvetica', 'normal')
                  pdf.text(invoiceDate, pageWidth - margin, y + 14, { align: 'right' })
                  pdf.setTextColor(26, 26, 26)
                  y = 50

                  pdf.setFont('helvetica', 'bold')
                  pdf.setFontSize(11)
                  pdf.text('CLIENTE', margin, y)
                  pdf.text('ENVÍO A', pageWidth / 2, y)
                  pdf.setFont('helvetica', 'normal')
                  pdf.setFontSize(9)
                  pdf.text(pdf.splitTextToSize(`${user.name}\n${user.email}${form.telefono ? `\n${form.telefono}` : ''}`, 80), margin, y + 6)
                  pdf.text(pdf.splitTextToSize(`${form.direccion}\n${form.ciudad}${form.departamento ? `, ${form.departamento}` : ''}\nEntrega: 3-7 días hábiles`, 80), pageWidth / 2, y + 6)
                  y += 30

                  pdf.setFillColor(244, 244, 245)
                  pdf.rect(margin, y, pageWidth - margin * 2, 9, 'F')
                  pdf.setFont('helvetica', 'bold')
                  pdf.setFontSize(8)
                  pdf.text('PRODUCTO', margin + 2, y + 6)
                  pdf.text('CANT.', 126, y + 6, { align: 'center' })
                  pdf.text('PRECIO UNITARIO', 157, y + 6, { align: 'right' })
                  pdf.text('SUBTOTAL', pageWidth - margin - 2, y + 6, { align: 'right' })
                  y += 9

                  pdf.setFont('helvetica', 'normal')
                  savedOrder.items.forEach((item) => {
                    const nameLines = pdf.splitTextToSize(item.name, 76)
                    const rowHeight = Math.max(9, nameLines.length * 4.5 + 4)
                    if (y + rowHeight > 245) {
                      pdf.addPage()
                      y = 20
                    }
                    pdf.setDrawColor(225, 228, 230)
                    pdf.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight)
                    pdf.text(nameLines, margin + 2, y + 6)
                    pdf.text(String(item.quantity), 126, y + 6, { align: 'center' })
                    pdf.text(formatCop(item.unitPrice), 157, y + 6, { align: 'right' })
                    pdf.text(formatCop(item.unitPrice * item.quantity), pageWidth - margin - 2, y + 6, { align: 'right' })
                    y += rowHeight
                  })

                  if (y > 245) {
                    pdf.addPage()
                    y = 20
                  }
                  y += 10
                  pdf.setFontSize(9)
                  pdf.text(`Subtotal: ${formatCop(subtotal)}`, pageWidth - margin, y, { align: 'right' })
                  y += 7
                  pdf.text(`IVA 19%: ${formatCop(iva)}`, pageWidth - margin, y, { align: 'right' })
                  y += 8
                  pdf.setFont('helvetica', 'bold')
                  pdf.setFontSize(12)
                  pdf.setTextColor(13, 92, 58)
                  pdf.text(`TOTAL: ${formatCop(totalConIva)}`, pageWidth - margin, y, { align: 'right' })
                  y += 8
                  pdf.setFont('helvetica', 'normal')
                  pdf.setFontSize(9)
                  pdf.setTextColor(80, 80, 80)
                  pdf.text(`Pedido confirmado · Pago: ${payLabel} · pendiente de pago`, margin, y)
                  pdf.setFontSize(8)
                  pdf.text('Comprobante de compra. Consérvalo para trámites de garantía o devolución.', margin, 282)
                  pdf.save(`Factura-${invoice.number}.pdf`)
                } catch (error) {
                  window.alert(error instanceof Error ? error.message : 'No fue posible descargar la factura PDF.')
                }
              }

              return (
                <div className="flex flex-col gap-5 py-4">
                  {/* Success header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0D5C3A] flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1A1A1A]" style={{fontFamily:'Montserrat,sans-serif'}}>¡Compra confirmada!</h3>
                      <p className="text-gray-500 text-sm">Gracias, {user.name.split(' ')[0]}. Tu pedido está confirmado y en preparación. El pago en efectivo queda pendiente hasta recibirlo.</p>
                    </div>
                  </div>

                  {/* Invoice */}
                  <div id="factura-bs" className="border border-gray-200 rounded-2xl overflow-hidden text-sm">
                    {/* Invoice header */}
                    <div className="invoice-header bg-[#0D5C3A] text-white px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BSLogo size={36} dark />
                        <div>
                          <div className="font-black text-base" style={{fontFamily:'Montserrat,sans-serif'}}>BS BIKE STORE</div>
                          <div className="text-green-200 text-[10px] tracking-wide">NIT: 900.123.456-7</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-green-200 uppercase tracking-wider">Factura de Venta</div>
                        <div className="font-black text-lg tracking-wider">{invoice.number}</div>
                        <div className="text-[10px] text-green-200">{invoiceDate}</div>
                      </div>
                    </div>

                    {/* Client + shipping */}
                    <div className="px-5 py-4 grid grid-cols-2 gap-4 bg-white border-b border-gray-100">
                      <div>
                        <div className="text-[10px] font-black text-[#0D5C3A] uppercase tracking-widest mb-1">Cliente</div>
                        <div className="font-bold text-[#1A1A1A]">{user.name}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                        {form.telefono && <div className="text-gray-500 text-xs">{form.telefono}</div>}
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-[#0D5C3A] uppercase tracking-widest mb-1">Envío a</div>
                        <div className="font-semibold text-[#1A1A1A] text-xs">{form.direccion}</div>
                        <div className="text-gray-500 text-xs">{form.ciudad}{form.departamento ? `, ${form.departamento}` : ''}</div>
                        <div className="text-gray-500 text-xs mt-1">Entrega: 3–7 días hábiles</div>
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="px-5 py-3 bg-white">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-[#0D5C3A] text-[10px] uppercase tracking-wider font-black">Producto</th>
                            <th className="text-center py-2 text-[#0D5C3A] text-[10px] uppercase tracking-wider font-black w-10">Cant.</th>
                            <th className="text-right py-2 text-[#0D5C3A] text-[10px] uppercase tracking-wider font-black w-24">P. Unit.</th>
                            <th className="text-right py-2 text-[#0D5C3A] text-[10px] uppercase tracking-wider font-black w-24">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savedOrder.items.map(item => (
                            <tr key={item.productId} className="border-b border-gray-50">
                              <td className="py-2 font-semibold text-[#1A1A1A]">{item.name}</td>
                              <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                              <td className="py-2 text-right text-gray-600">${item.unitPrice.toLocaleString('es-CO')}</td>
                              <td className="py-2 text-right font-bold text-[#1A1A1A]">${(item.unitPrice * item.quantity).toLocaleString('es-CO')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="px-5 py-3 bg-[#F4F4F5] space-y-1.5 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal (sin IVA)</span>
                        <span>${subtotal.toLocaleString('es-CO')} COP</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>IVA 19%</span>
                        <span>${iva.toLocaleString('es-CO')} COP</span>
                      </div>
                      <div className="flex justify-between font-black text-[#0D5C3A] text-sm pt-1.5 border-t border-gray-300">
                        <span>TOTAL DEL PEDIDO</span>
                        <span>${totalConIva.toLocaleString('es-CO')} COP</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-[11px] pt-1">
                        <span>Método de pago</span>
                        <span className="font-semibold">{payLabel} · pendiente de pago</span>
                      </div>
                    </div>

                    {/* Footer note */}
                    <div className="px-5 py-3 bg-white text-[10px] text-gray-400 border-t border-gray-100">
                      Esta factura es un comprobante de tu compra en BS Bike Store. Consérvala para cualquier trámite de garantía o devolución.
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleDownload}
                      className="w-full border-2 border-[#0D5C3A] text-[#0D5C3A] font-bold py-3 rounded-full text-sm hover:bg-[#0D5C3A]/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                      Descargar factura PDF
                    </button>
                  </div>

                  <button
                    onClick={() => onSuccess(savedOrder)}
                    className="w-full bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-black py-3.5 rounded-full text-sm transition-colors"
                  >
                    Volver a la tienda
                  </button>
                </div>
              )
            })()}
            </div>

            {/* Right: persistent order summary (desktop, non-confirmation steps) */}
            {step !== 'confirmacion' && (
              <div className="hidden md:block bg-[#F4F4F5] rounded-br-2xl p-5 border-l border-gray-100">
                <OrderSummary />
                <div className="mt-4 space-y-2 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-[#0D5C3A]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Pago 100% seguro SSL</div>
                  <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-[#0D5C3A]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>Envío gratis a Colombia</div>
                  <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-[#0D5C3A]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 14 4 9l5-5M20 20v-7a4 4 0 0 0-4-4H4"/></svg>Devoluciones en 15 días</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

interface AuthUser {
  id: number
  name: string
  email: string
  role: 'client' | 'admin'
}

function MyOrdersModal({ onClose }: { onClose: () => void }) {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void apiRequest<CustomerOrder[]>('/orders/mine')
      .then(setOrders)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar tus pedidos.'))
      .finally(() => setLoading(false))
  }, [])

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'Confirmado · en preparación',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[110]" onClick={onClose} />
      <div className="fixed inset-0 z-[111] flex items-center justify-center p-4">
        <section className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#0D5C3A]">Cuenta</p>
              <h2 className="text-xl font-black">Historial de pedidos</h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 text-gray-600" aria-label="Cerrar historial">×</button>
          </div>
          {loading && <p className="text-sm text-gray-500 py-8 text-center">Cargando pedidos…</p>}
          {error && <p className="text-sm text-red-600 py-4">{error}</p>}
          {!loading && !error && orders.length === 0 && <p className="text-sm text-gray-500 py-8 text-center">Aún no tienes pedidos.</p>}
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex flex-wrap justify-between gap-2 items-center">
                  <div>
                    <p className="font-bold">Pedido #{order.id} · {order.invoiceNumber ?? 'Factura pendiente'}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
                  </div>
                  <span className="rounded-full bg-[#0D5C3A]/10 text-[#0D5C3A] px-3 py-1 text-xs font-bold">{statusLabels[order.status] ?? order.status}</span>
                </div>
                <ul className="my-3 space-y-1 text-sm text-gray-600">
                  {order.items.map((item, index) => (
                    <li key={`${item.productId ?? 'item'}-${index}`} className="flex justify-between gap-3">
                      <span>{item.name} × {item.quantity}</span>
                      <span>${(item.unitPrice * item.quantity).toLocaleString('es-CO')}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-right font-black text-[#0D5C3A]">${Number(order.total).toLocaleString('es-CO')} COP</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function AuthModal({
  onClose,
  onLogin,
  onOpenLegal,
}: {
  onClose: () => void
  onLogin: (user: AuthUser) => void
  onOpenLegal: (section: 'terminos' | 'privacidad') => void
}) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot' | 'forgot-sent'>('login')
  const [role, setRole] = useState<'client' | 'admin'>('client')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const fail = (msg: string) => {
    setError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleLogin = async () => {
    setError('')
    if (!email.trim() || !password) return fail('Ingresa tu correo y contraseña')
    setSubmitting(true)
    try {
      const session = await apiRequest<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: { email: email.trim(), password },
      })
      if (session.user.role !== role) {
        await apiRequest<void>('/auth/logout', { method: 'POST' })
        throw new Error(role === 'admin' ? 'Esta cuenta no tiene permisos de administrador.' : 'Usa el acceso de administrador para esta cuenta.')
      }
      onLogin(session.user)
    } catch (err) {
      fail(err instanceof Error ? err.message : 'No fue posible iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async () => {
    setError('')
    const errors: Record<string, string> = {}
    if (!name.trim()) errors.name = 'El nombre es obligatorio.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'El correo no tiene un formato válido.'
    if (!/^\d{10}$/.test(phone)) errors.phone = 'El teléfono debe tener 10 dígitos numéricos.'
    if (password.length < 8) errors.password = 'La contraseña debe tener mínimo 8 caracteres.'
    if (password !== confirmPwd) errors.confirmPassword = 'Las contraseñas no coinciden.'
    if (!termsAccepted) errors.termsAccepted = 'Debes aceptar los términos y la política de privacidad.'
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      fail('Revisa los campos marcados.')
      return
    }
    setSubmitting(true)
    try {
      const session = await apiRequest<{ user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim(), phone, password, termsAccepted },
      })
      onLogin(session.user)
    } catch (err) {
      if (err instanceof ApiRequestError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors)
        fail('Revisa los campos marcados.')
      } else {
        fail(err instanceof Error ? err.message : 'No fue posible crear la cuenta.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all'
  const registerInputCls = (field: string) => `${inputCls} ${fieldErrors[field] ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`
  const clearRegisterError = (field: string) => {
    setFieldErrors((previous) => {
      const { [field]: _removed, ...remaining } = previous
      return remaining
    })
    setError('')
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transition-transform relative modal-animate ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            title="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>

          <div className="p-7">
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <BSLogo size={64} />
            </div>

            {/* Header tabs — hidden during forgot password flow */}
            {(authView === 'login' || authView === 'register') && (
              <div className="flex border-b border-gray-200 mb-5">
                {(['login', 'register'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setAuthView(t); setError('') }}
                    className={`flex-1 pb-3 text-sm font-black uppercase tracking-widest transition-colors ${
                      tab === t ? 'text-[#0D5C3A] border-b-2 border-[#0D5C3A]' : 'text-gray-400 hover:text-[#1A1A1A]'
                    }`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {t === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                  </button>
                ))}
              </div>
            )}

            {/* ── Forgot Password Views ── */}
            {authView === 'forgot' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => { setAuthView('login'); setError('') }} className="text-gray-400 hover:text-[#0D5C3A] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  </button>
                  <h3 className="text-sm font-black text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Restablecer contraseña</h3>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">Ingresa tu correo y te enviaremos las instrucciones. Revisa también tu carpeta de spam.</p>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Correo electrónico</label>
                  <input className={inputCls} type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="tu@correo.com" onKeyDown={(e) => e.key === 'Enter' && forgotEmail.includes('@') && setAuthView('forgot-sent')} />
                </div>
                {error && <p className="text-[11px] text-red-500 font-semibold">{error}</p>}
                <button
                  onClick={() => {
                    if (!forgotEmail.includes('@')) return setError('Ingresa un correo válido')
                    setAuthView('forgot-sent')
                  }}
                  className="w-full bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-bold py-2 rounded-xl text-sm transition-all duration-200"
                >
                  Enviar instrucciones
                </button>
              </div>
            )}

            {authView === 'forgot-sent' && (
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[#0D5C3A]/10 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-[#0D5C3A]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>¡Correo enviado!</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Revisa <strong>{forgotEmail}</strong></p>
                </div>
                <div className="bg-[#0D5C3A]/5 rounded-xl p-3 text-left space-y-1.5">
                  {['Abre el correo de BS Bike Store','Haz clic en el enlace para restablecer','Crea tu nueva contraseña','Inicia sesión normalmente'].map((s,i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#0D5C3A] text-white text-[8px] font-black flex items-center justify-center flex-shrink-0">{i+1}</span>
                      <p className="text-[10px] text-gray-600">{s}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setAuthView('login'); setTab('login'); setForgotEmail(''); setError('') }}
                  className="w-full border border-[#0D5C3A] text-[#0D5C3A] font-bold py-2 rounded-xl text-sm transition-all hover:bg-[#0D5C3A] hover:text-white">
                  Volver al inicio de sesión
                </button>
              </div>
            )}

            {(authView === 'login' || authView === 'register') && tab === 'login' ? (
              <div className="space-y-4">
                {/* Role selector */}
                <div className="flex gap-2 p-1 bg-[#F4F4F5] rounded-xl">
                  {(['client', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRole(r); setError('') }}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        role === r ? 'bg-white shadow text-[#0D5C3A]' : 'text-gray-500 hover:text-[#1A1A1A]'
                      }`}
                    >
                      {r === 'client' ? '🛒 Cliente' : '⚙️ Administrador'}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Correo electrónico</label>
                  <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    {role === 'admin' ? 'Contraseña de administrador' : 'Contraseña'}
                  </label>
                  <div className="relative">
                    <input className={inputCls + ' pr-10'} type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D5C3A] transition-colors" tabIndex={-1}>
                      {showPwd
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {role === 'client' && (
                    <button
                      type="button"
                      onClick={() => { setAuthView('forgot'); setError(''); setForgotEmail(email) }}
                      className="text-[10px] text-[#0D5C3A] font-semibold hover:underline mt-1 block text-right w-full"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>

                {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

                <button onClick={handleLogin} className="w-full bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-black py-3 rounded-xl text-sm transition-colors mt-1">
                  Ingresar
                </button>

                {role === 'client' && (
                  <p className="text-center text-xs text-gray-400">
                    ¿No tienes cuenta?{' '}
                    <button onClick={() => { setTab('register'); setAuthView('register'); setError('') }} className="text-[#0D5C3A] font-bold hover:underline">
                      Regístrate aquí
                    </button>
                  </p>
                )}

                {role === 'client' && (
                  <p className="text-[10px] text-gray-300 text-center pt-1">Demo: cliente@mail.com / cliente123</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre completo</label>
                  <input className={registerInputCls('name')} value={name} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'register-name-error' : undefined} onChange={(e) => { setName(e.target.value); clearRegisterError('name') }} placeholder="Tu nombre" />
                  {fieldErrors.name && <p id="register-name-error" className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Correo electrónico</label>
                  <input className={registerInputCls('email')} type="email" value={email} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'register-email-error' : undefined} onChange={(e) => { setEmail(e.target.value); clearRegisterError('email') }} placeholder="tu@correo.com" />
                  {fieldErrors.email && <p id="register-email-error" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Teléfono</label>
                  <input className={registerInputCls('phone')} type="tel" inputMode="numeric" maxLength={10} value={phone} aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'register-phone-error' : undefined} onKeyDown={handleDigitsOnlyKeyDown} onChange={(e) => { setPhone(digitsOnly(e.target.value).slice(0, 10)); clearRegisterError('phone') }} placeholder="3001234567" />
                  {fieldErrors.phone && <p id="register-phone-error" className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Contraseña</label>
                  <div className="relative">
                    <input className={registerInputCls('password') + ' pr-10'} type={showPwd ? 'text' : 'password'} value={password} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'register-password-error' : undefined} onChange={(e) => { setPassword(e.target.value); clearRegisterError('password') }} placeholder="Mínimo 8 caracteres" />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D5C3A] transition-colors" tabIndex={-1}>
                      {showPwd
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {fieldErrors.password && <p id="register-password-error" className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Confirmar contraseña</label>
                  <div className="relative">
                    <input className={registerInputCls('confirmPassword') + ' pr-10'} type={showConfirmPwd ? 'text' : 'password'} value={confirmPwd} aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? 'register-confirm-password-error' : undefined} onChange={(e) => { setConfirmPwd(e.target.value); clearRegisterError('confirmPassword') }} placeholder="Repite tu contraseña" onKeyDown={(e) => e.key === 'Enter' && handleRegister()} />
                    <button type="button" onClick={() => setShowConfirmPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D5C3A] transition-colors" tabIndex={-1}>
                      {showConfirmPwd
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p id="register-confirm-password-error" className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
                </div>

                <label className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                  <input type="checkbox" required checked={termsAccepted} aria-invalid={Boolean(fieldErrors.termsAccepted)} onChange={(e) => { setTermsAccepted(e.target.checked); clearRegisterError('termsAccepted') }} className="mt-0.5 accent-[#0D5C3A]" />
                  <span>
                    Acepto la{' '}
                    <button type="button" onClick={() => onOpenLegal('privacidad')} className="text-[#0D5C3A] underline">Política de Privacidad</button>
                    {' '}y los{' '}
                    <button type="button" onClick={() => onOpenLegal('terminos')} className="text-[#0D5C3A] underline">Términos y Condiciones</button>.
                  </span>
                </label>
                {fieldErrors.termsAccepted && <p className="text-xs text-red-600">{fieldErrors.termsAccepted}</p>}

                {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

                <button onClick={handleRegister} disabled={!termsAccepted || submitting} className="w-full bg-[#0D5C3A] hover:bg-[#1A8A5A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl text-sm transition-colors">
                  Crear cuenta
                </button>
                <p className="text-center text-xs text-gray-400">
                  ¿Ya tienes cuenta?{' '}
                  <button onClick={() => { setTab('login'); setAuthView('login'); setError('') }} className="text-[#0D5C3A] font-bold hover:underline">
                    Inicia sesión
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Admin Login Page ─────────────────────────────────────────────────────────

function AdminLoginPage({ onSuccess, onBack }: { onSuccess: (user: AuthUser) => void; onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password) return setError('Ingresa tu correo y contraseña')
    setLoading(true)
    setError('')
    try {
      const session = await apiRequest<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: { email: email.trim(), password },
      })
      if (session.user.role !== 'admin') {
        await apiRequest<void>('/auth/logout', { method: 'POST' })
        throw new Error('Esta cuenta no tiene permisos de administrador.')
      }
      onSuccess(session.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1A1A1A] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-cover bg-center" style={{ backgroundImage: `url(${bike1Img})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D5C3A]/70 via-[#1A1A1A]/60 to-[#1A1A1A]" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <BSLogo size={48} dark />
            <div>
              <p className="text-white font-black text-xl leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>BS BIKE STORE</p>
              <p className="text-[#1A8A5A] text-[10px] font-bold uppercase tracking-[0.2em]">Panel de Administración</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-7">
          {[
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1A8A5A" strokeWidth={1.8} className="w-6 h-6"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, title: 'Gestión de Productos', desc: 'Catálogo completo con fotos, precios y especificaciones' },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1A8A5A" strokeWidth={1.8} className="w-6 h-6"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>, title: 'Reportes y Estadísticas', desc: 'Ventas, clientes y métricas en tiempo real' },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1A8A5A" strokeWidth={1.8} className="w-6 h-6"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>, title: 'Inventario y Stock', desc: 'Control de disponibilidad y alertas de reposición' },
            { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1A8A5A" strokeWidth={1.8} className="w-6 h-6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Clientes y Usuarios', desc: 'Gestión de cuentas, roles y permisos' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#0D5C3A]/20 flex items-center justify-center">{f.icon}</div>
              <div>
                <p className="text-white font-bold text-sm">{f.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative text-gray-700 text-xs">© 2026 BS Bike Store · Acceso interno</p>
      </div>

      {/* Right login form */}
      <div className="flex-1 bg-[#F4F4F5] flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <BSLogo size={40} />
            <div>
              <p className="font-black text-[#1A1A1A] text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>BS BIKE STORE</p>
              <p className="text-[#0D5C3A] text-[10px] font-bold uppercase tracking-widest">Panel Admin</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header stripe */}
            <div className="bg-[#1A1A1A] px-8 py-5">
              <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Iniciar sesión</h1>
              <p className="text-gray-400 text-xs mt-0.5">Ingresa tus credenciales de administrador</p>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setError('') }}
                  onKeyDown={(event) => event.key === 'Enter' && handleLogin()}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all"
                  placeholder="admin@tienda.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all"
                    placeholder="••••••••"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPwd
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span className="text-xs text-red-600 font-semibold">{error}</span>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#0D5C3A] hover:bg-[#1A8A5A] disabled:opacity-60 text-white font-black py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Verificando...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Ingresar al Panel</>
                )}
              </button>

            </div>
          </div>

          <button
            onClick={onBack}
            className="mt-5 flex items-center gap-2 text-sm text-gray-400 hover:text-[#0D5C3A] transition-colors mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

type AdminSection = 'dashboard' | 'productos' | 'ofertas' | 'inventario' | 'usuarios' | 'clientes' | 'reportes' | 'pedidos' | 'resenas' | 'taller' | 'chats'
type DashboardOrdersFilter = 'todos' | 'por-atender' | 'pendiente' | 'en_proceso' | 'entregado'
type DashboardActiveFilter = 'all' | 'active'
type InventoryStockFilter = 'all' | 'critical' | 'empty'
type DashboardSalesFilter = 'all' | 'delivered'
type AppointmentFilter = 'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
type AppointmentStatus = AppointmentFilter

interface ServiceAppointment {
  id: number
  customerName: string
  phone: string
  bike: string
  serviceName: string
  serviceType: string | null
  scheduledAt: string
  status: AppointmentStatus
  observations: string
  createdAt: string
}

interface AdminChatSession {
  sessionId: string
  userId: number | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  escalationRequested: boolean | number
  escalationRequest: string | null
  createdAt: string
  updatedAt: string
  latestMessage: string | null
  latestMessageAt: string | null
  messageCount: number
}

interface AdminChatMessage {
  id: number
  sender: 'user' | 'assistant'
  message: string
  createdAt: string
}

interface AdminNotifications {
  pendingOrders: number
  pendingAppointments: number
  escalations: number
  criticalProducts: number
}

const ADMIN_ROUTE_SECTIONS: Record<string, AdminSection> = {
  '/admin/pedidos': 'pedidos',
  '/admin/reportes': 'reportes',
  '/admin/clientes': 'clientes',
  '/admin/inventario': 'inventario',
  '/admin/taller': 'taller',
  '/admin/chats': 'chats',
}

function getAdminSectionFromPath(pathname: string): AdminSection {
  return ADMIN_ROUTE_SECTIONS[pathname] ?? 'dashboard'
}

function getDashboardActiveFilter(search: string, key: 'status'): DashboardActiveFilter {
  return new URLSearchParams(search).get(key) === 'active' ? 'active' : 'all'
}

function getDashboardSalesFilter(search: string): DashboardSalesFilter {
  return new URLSearchParams(search).get('view') === 'delivered' ? 'delivered' : 'all'
}

function getDashboardOrdersFilter(search: string): DashboardOrdersFilter {
  const filter = new URLSearchParams(search).get('filter')
  return filter === 'pending' || filter === 'por-atender' ? 'por-atender'
    : filter === 'pendiente' || filter === 'en_proceso' || filter === 'entregado' ? filter
      : 'todos'
}

function getAppointmentFilter(search: string): AppointmentFilter {
  const status = new URLSearchParams(search).get('status')
  return status === 'pending' || status === 'in_progress' || status === 'completed' || status === 'cancelled' ? status : 'all'
}

const MOCK_ORDERS = [
  { id: 'BS-001', client: 'Andrés Morales', email: 'andres@mail.com', product: 'GW Hawk MTB 29 12V', total: 17400000, status: 'entregado', date: '2026-09-10', city: 'Medellín', payMethod: 'tarjeta' },
  { id: 'BS-002', client: 'Laura Jiménez', email: 'laura@mail.com', product: 'Optimus Corvus Carbono', total: 18900000, status: 'en_proceso', date: '2026-09-15', city: 'Bogotá', payMethod: 'transferencia' },
  { id: 'BS-003', client: 'Diego Ospina', email: 'diego@mail.com', product: 'GW Mortirolo 700C', total: 24900000, status: 'pendiente', date: '2026-09-18', city: 'Cali', payMethod: 'nequi' },
  { id: 'BS-004', client: 'Valentina Cruz', email: 'vale@mail.com', product: 'Starker Sport 2.0 Pro', total: 19900000, status: 'cancelado', date: '2026-09-17', city: 'Bucaramanga', payMethod: 'pse' },
  { id: 'BS-005', client: 'Carlos Rueda', email: 'carlos@mail.com', product: 'Jeep Baltoro 29', total: 21500000, status: 'entregado', date: '2026-09-12', city: 'Pereira', payMethod: 'tarjeta' },
]

interface AdminProduct {
  id: number; name: string; category: string; price: number; stock: number; img: string; active: boolean; specs: ProductSpec[]
}
interface AdminUser {
  id: number; name: string; email: string; role: 'admin'; createdAt: string; active: boolean
}
interface AdminClient {
  id: number; name: string; email: string; phone: string; orders: number; totalSpent: number; lastOrder: string | null; active: boolean
}
interface AdminOffer {
  id: number; title: string; discount: number; code: string; validFrom: string; validUntil: string | null; productIds: number[]; active: boolean
}
interface AdminReview {
  id: number; productId: number; productName: string; rating: number; comment: string
  approved: boolean; createdAt: string; author: string
}

const INIT_ADMIN_PRODUCTS: AdminProduct[] = ALL_PRODUCTS.map((p) => ({
  id: p.id, name: p.name, category: p.category, price: p.price, stock: p.stock, img: p.img, active: true, specs: p.specs,
}))

const INIT_CLIENTS: AdminClient[] = [
  { id: 1, name: 'Andrés Morales', email: 'andres@mail.com', phone: '311 234 5678', orders: 3, totalSpent: 4200000, lastOrder: '2026-09-10', active: true },
  { id: 2, name: 'Laura Jiménez', email: 'laura@mail.com', phone: '320 987 6543', orders: 1, totalSpent: 18900000, lastOrder: '2026-09-15', active: true },
  { id: 3, name: 'Diego Ospina', email: 'diego@mail.com', phone: '315 456 7890', orders: 5, totalSpent: 7600000, lastOrder: '2026-09-18', active: true },
  { id: 4, name: 'Sofía Vargas', email: 'sofia@mail.com', phone: '318 321 0987', orders: 2, totalSpent: 35400000, lastOrder: '2026-09-01', active: true },
]

const ADMIN_PAGE_SIZE = 10

function AdminPagination({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))
  if (total <= ADMIN_PAGE_SIZE) return null

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-gray-500">
      <span>{total} registros · página {page} de {pageCount}</span>
      <div className="flex gap-2">
        <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
        <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pageCount} className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button>
      </div>
    </div>
  )
}

function AdminPanel({
  onClose,
  darkMode,
  onToggleTheme,
}: {
  onClose: () => void
  darkMode: boolean
  onToggleTheme: () => void
}) {
  const [section, setSection] = useState<AdminSection>(() => getAdminSectionFromPath(window.location.pathname))
  const [filtroEstado, setFiltroEstado] = useState<DashboardOrdersFilter>(() =>
    getDashboardOrdersFilter(window.location.search),
  )
  const [clientsFilter, setClientsFilter] = useState<DashboardActiveFilter>(() =>
    getDashboardActiveFilter(window.location.search, 'status'),
  )
  const [inventoryFilter, setInventoryFilter] = useState<DashboardActiveFilter>(() =>
    getDashboardActiveFilter(window.location.search, 'status'),
  )
  const [inventoryStockFilter, setInventoryStockFilter] = useState<InventoryStockFilter>('all')
  const [salesFilter, setSalesFilter] = useState<DashboardSalesFilter>(() =>
    getDashboardSalesFilter(window.location.search),
  )
  const [appointmentsFilter, setAppointmentsFilter] = useState<AppointmentFilter>(() =>
    getAppointmentFilter(window.location.search),
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminPages, setAdminPages] = useState<Record<string, number>>({})
  const [productSearch, setProductSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const getAdminPage = <T,>(key: string, items: T[]) => {
    const pageCount = Math.max(1, Math.ceil(items.length / ADMIN_PAGE_SIZE))
    const page = Math.min(adminPages[key] ?? 1, pageCount)
    return {
      page,
      items: items.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE),
    }
  }
  const setAdminPage = (key: string, page: number) =>
    setAdminPages((previous) => ({ ...previous, [key]: page }))
  const navigateToAdminSection = (nextSection: AdminSection, query?: string) => {
    const paths: Partial<Record<AdminSection, string>> = {
      pedidos: '/admin/pedidos',
      reportes: '/admin/reportes',
      clientes: '/admin/clientes',
      inventario: '/admin/inventario',
      taller: '/admin/taller',
      chats: '/admin/chats',
    }
    const pathname = paths[nextSection] ?? '/'
    const routeQuery = query ?? (
      nextSection === 'pedidos' ? '?filter=todos'
        : nextSection === 'reportes' ? `?view=${salesFilter}`
          : nextSection === 'taller' ? `?status=${appointmentsFilter}`
          : nextSection === 'clientes' || nextSection === 'inventario' ? '?status=all'
            : ''
    )
    window.history.pushState({ adminSection: nextSection }, '', `${pathname}${routeQuery}`)
    setSection(nextSection)
    if (nextSection === 'pedidos') setFiltroEstado(getDashboardOrdersFilter(routeQuery))
    if (nextSection === 'clientes') setClientsFilter(getDashboardActiveFilter(routeQuery, 'status'))
    if (nextSection === 'inventario') setInventoryFilter(getDashboardActiveFilter(routeQuery, 'status'))
    if (nextSection === 'reportes') setSalesFilter(getDashboardSalesFilter(routeQuery))
    if (nextSection === 'taller') setAppointmentsFilter(getAppointmentFilter(routeQuery))
    setAdminPage('orders', 1)
    setAdminPage('clients', 1)
    setAdminPage('inventory', 1)
    setAdminPage('sales-report', 1)
    setAdminPage('appointments', 1)
    setAdminSectionKey((key) => key + 1)
  }
  const navigateToOrders = (filter: DashboardOrdersFilter) => {
    navigateToAdminSection('pedidos', `?filter=${filter}`)
  }
  const updateOrdersFilter = (filter: DashboardOrdersFilter) => {
    setFiltroEstado(filter)
    setAdminPage('orders', 1)
    const search = `?filter=${filter}`
    window.history.replaceState({ adminSection: 'pedidos' }, '', `${window.location.pathname}${search}`)
  }
  const navigateToClients = (filter: DashboardActiveFilter) => {
    navigateToAdminSection('clientes', `?status=${filter}`)
  }
  const navigateToInventory = (filter: DashboardActiveFilter) => {
    navigateToAdminSection('inventario', `?status=${filter}`)
  }
  const navigateToSales = (filter: DashboardSalesFilter) => {
    navigateToAdminSection('reportes', `?view=${filter}`)
  }
  const navigateToAppointments = (filter: AppointmentFilter) => {
    navigateToAdminSection('taller', `?status=${filter}`)
  }

  useEffect(() => {
    const syncAdminRoute = () => {
      const currentSection = getAdminSectionFromPath(window.location.pathname)
      setSection(currentSection)
      if (currentSection === 'pedidos') setFiltroEstado(getDashboardOrdersFilter(window.location.search))
      if (currentSection === 'clientes') setClientsFilter(getDashboardActiveFilter(window.location.search, 'status'))
      if (currentSection === 'inventario') setInventoryFilter(getDashboardActiveFilter(window.location.search, 'status'))
      if (currentSection === 'reportes') setSalesFilter(getDashboardSalesFilter(window.location.search))
      if (currentSection === 'taller') setAppointmentsFilter(getAppointmentFilter(window.location.search))
      setAdminPage('orders', 1)
      setAdminPage('clients', 1)
      setAdminPage('inventory', 1)
      setAdminPage('sales-report', 1)
      setAdminPage('appointments', 1)
      setAdminSectionKey((key) => key + 1)
    }
    window.addEventListener('popstate', syncAdminRoute)
    return () => window.removeEventListener('popstate', syncAdminRoute)
  }, [])

  // Products state
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>(INIT_ADMIN_PRODUCTS)
  useEffect(() => {
    void apiRequest<{ items: (Omit<AdminProduct, 'img'> & { img: string | null })[] }>('/admin/products')
      .then(({ items }) => {
        const localById = new Map(INIT_ADMIN_PRODUCTS.map((product) => [product.id, product]))
        setAdminProducts(items.map((item) => ({
          ...item,
          img: item.img || localById.get(item.id)?.img || '',
          active: item.active,
          specs: Array.isArray(item.specs) ? item.specs : [],
        })))
      })
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar los productos de administración.'))
  }, [])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null)
  const [newProduct, setNewProduct] = useState<{
    name: string
    category: string
    price: string
    stock: string
    imgPreview: string
    specs: ProductSpec[]
  }>({ name: '', category: 'Todo Terreno', price: '', stock: '', imgPreview: '', specs: [] })

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' })
  useEffect(() => {
    void apiRequest<{ items: AdminUser[] }>('/admin/users')
      .then(({ items }) => setUsers(items))
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar los usuarios.'))
  }, [])

  // Clients state
  const [clients, setClients] = useState<AdminClient[]>(INIT_CLIENTS)
  const [clientSearch, setClientSearch] = useState('')
  const [showAddClient, setShowAddClient] = useState(false)
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null)
  const [clientOrders, setClientOrders] = useState<AdminClientOrder[]>([])
  const [clientOrdersLoading, setClientOrdersLoading] = useState(false)
  const [clientOrdersError, setClientOrdersError] = useState('')
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', password: '', termsAccepted: false })
  useEffect(() => {
    void apiRequest<{ items: AdminClient[] }>('/admin/clients')
      .then(({ items }) => setClients(items.map((client) => ({
        ...client,
        orders: Number(client.orders),
        totalSpent: Number(client.totalSpent),
        lastOrder: client.lastOrder ? new Date(client.lastOrder).toISOString().slice(0, 10) : null,
      }))))
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar los clientes.'))
  }, [])
  const openClientOrders = async (client: AdminClient) => {
    setSelectedClient(client)
    setClientOrders([])
    setClientOrdersError('')
    setClientOrdersLoading(true)
    try {
      const { items } = await apiRequest<{ items: AdminClientOrder[] }>(`/admin/customers/${client.id}/orders`)
      setClientOrders(items)
    } catch (error) {
      setClientOrdersError(error instanceof Error ? error.message : 'No fue posible cargar el historial del cliente.')
    } finally {
      setClientOrdersLoading(false)
    }
  }

  // Offers state
  const [offers, setOffers] = useState<AdminOffer[]>([])
  const [showAddOffer, setShowAddOffer] = useState(false)
  const [editingOffer, setEditingOffer] = useState<AdminOffer | null>(null)
  const [newOffer, setNewOffer] = useState({ title: '', discount: '', code: '', validFrom: '', validUntil: '', productIds: [] as number[] })
  useEffect(() => {
    void apiRequest<{ items: AdminOffer[] }>('/admin/offers')
      .then(({ items }) => setOffers(items.map((offer) => ({
        ...offer,
        productIds: Array.isArray(offer.productIds) ? offer.productIds.map(Number) : [],
      }))))
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar las ofertas.'))
  }, [])

  const [adminSectionKey, setAdminSectionKey] = useState(0)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({})
  const [appointments, setAppointments] = useState<ServiceAppointment[]>([])
  const [adminChats, setAdminChats] = useState<AdminChatSession[]>([])
  const [adminChatMessages, setAdminChatMessages] = useState<AdminChatMessage[]>([])
  const [selectedAdminChat, setSelectedAdminChat] = useState<AdminChatSession | null>(null)
  const [adminNotifications, setAdminNotifications] = useState<AdminNotifications>({
    pendingOrders: 0,
    pendingAppointments: 0,
    escalations: 0,
    criticalProducts: 0,
  })
  const [adminChatsLoading, setAdminChatsLoading] = useState(false)
  const [adminChatMessagesLoading, setAdminChatMessagesLoading] = useState(false)
  const [adminChatsError, setAdminChatsError] = useState('')
  useEffect(() => {
    void apiRequest<{ items: ServiceAppointment[] }>('/admin/appointments')
      .then(({ items }) => setAppointments(items))
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar las citas del taller.'))
  }, [])
  useEffect(() => {
    let active = true
    const refreshAdminCommunications = async () => {
      try {
        const [chatResponse, notifications] = await Promise.all([
          apiRequest<{ items: AdminChatSession[] }>('/admin/chats'),
          apiRequest<AdminNotifications>('/admin/notifications'),
        ])
        if (!active) return
        setAdminChats(chatResponse.items)
        setAdminNotifications(notifications)
        setAdminChatsError('')
      } catch (error) {
        if (active) setAdminChatsError(error instanceof Error ? error.message : 'No fue posible cargar chats y notificaciones.')
      } finally {
        if (active) setAdminChatsLoading(false)
      }
    }
    setAdminChatsLoading(true)
    void refreshAdminCommunications()
    const refreshTimer = window.setInterval(() => void refreshAdminCommunications(), 30_000)
    return () => {
      active = false
      window.clearInterval(refreshTimer)
    }
  }, [])
  const openAdminChat = async (session: AdminChatSession) => {
    setSelectedAdminChat(session)
    setAdminChatMessages([])
    setAdminChatMessagesLoading(true)
    setAdminChatsError('')
    try {
      const { items } = await apiRequest<{ items: AdminChatMessage[] }>(
        `/admin/chats/${encodeURIComponent(session.sessionId)}`,
      )
      setAdminChatMessages(items)
    } catch (error) {
      setAdminChatsError(error instanceof Error ? error.message : 'No fue posible cargar la conversación.')
    } finally {
      setAdminChatMessagesLoading(false)
    }
  }
  useEffect(() => {
    void apiRequest<{
      id: number
      status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      total: number
      city: string
      createdAt: string
      customerName: string
      customerEmail: string
      invoiceNumber: string | null
      product: string
    }[]>('/orders')
      .then((savedOrders) => {
        const toUiStatus: Record<string, string> = {
          pending: 'pendiente', processing: 'en_proceso', shipped: 'enviado', delivered: 'entregado', cancelled: 'cancelado',
        }
        const rows = savedOrders.map((order) => ({
          id: String(order.id),
          client: order.customerName,
          email: order.customerEmail,
          product: order.product,
          total: Number(order.total),
          status: toUiStatus[order.status],
          date: new Date(order.createdAt).toISOString().slice(0, 10),
          city: order.city,
          payMethod: 'Efectivo',
          invoiceNumber: order.invoiceNumber ?? undefined,
        }))
        setOrders(rows)
        setOrderStatuses(Object.fromEntries(rows.map((order) => [order.id, order.status])))
      })
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar los pedidos.'))
  }, [])

  // Quick sale (guest purchase)
  const [showQuickSale, setShowQuickSale] = useState(false)
  const [quickSale, setQuickSale] = useState({ productId: '', qty: '1', buyerName: '', phone: '' })

  // Edit order
  type OrderRow = typeof MOCK_ORDERS[0] & { invoiceNumber?: string }
  const [editingOrder, setEditingOrder] = useState<OrderRow | null>(null)
  const [editOrderDraft, setEditOrderDraft] = useState<OrderRow | null>(null)
  const [adminReviews, setAdminReviews] = useState<AdminReview[]>([])
  useEffect(() => {
    void Promise.all([
      apiRequest<AdminReview[]>('/admin/reviews?approved=false'),
      apiRequest<AdminReview[]>('/admin/reviews?approved=true'),
    ])
      .then(([pending, approved]) => setAdminReviews([...approved, ...pending]))
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar las reseñas.'))
  }, [])

  const navItems: { id: AdminSection; label: string; icon: React.ReactElement }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { id: 'taller', label: 'Citas de taller', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3z"/></svg> },
    { id: 'pedidos', label: 'Pedidos', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg> },
    { id: 'productos', label: 'Productos', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    { id: 'inventario', label: 'Inventario', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg> },
    { id: 'ofertas', label: 'Ofertas', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/><path d="m15 19-3-3 3-3"/></svg> },
    { id: 'usuarios', label: 'Usuarios', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg> },
    { id: 'clientes', label: 'Clientes', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'resenas', label: 'Reseñas', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
    { id: 'reportes', label: 'Reportes', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> },
    { id: 'chats', label: 'Chats y alertas', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg> },
  ]

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500_000) {
      window.alert('La imagen debe pesar menos de 500 KB.')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setNewProduct((p) => ({ ...p, imgPreview: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const saveProduct = async () => {
    const price = Number(newProduct.price)
    const stock = Number(newProduct.stock || 0)
    if (newProduct.name.trim().length < 2 || newProduct.name.trim().length > 180 || !Number.isInteger(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
      window.alert('Ingresa un nombre, un precio entero mayor que cero y un inventario válido.')
      return
    }
    const imageUrl = newProduct.imgPreview || getBikeCategoryImage(newProduct.category)
    const payload = {
      name: newProduct.name.trim(),
      category: newProduct.category,
      price,
      stock,
      imageUrl,
      specs: newProduct.specs.filter((spec) => spec.label.trim() && spec.value.trim())
        .map((spec) => ({ label: spec.label.trim(), value: spec.value.trim() })),
    }
    setSavingProduct(true)
    try {
      if (editProduct) {
        await apiRequest(`/products/${editProduct.id}`, { method: 'PATCH', body: payload })
        setAdminProducts((prev) => prev.map((product) => product.id === editProduct.id
          ? { ...product, ...payload, img: newProduct.imgPreview || product.img }
          : product))
      } else {
        const created = await apiRequest<{ id: number }>('/products', {
          method: 'POST',
          body: { ...payload, description: '', gallery: [imageUrl], active: true },
        })
        setAdminProducts((prev) => [...prev, {
          id: created.id,
          name: payload.name,
          category: payload.category,
          price: payload.price,
          stock: payload.stock,
          img: payload.imageUrl,
          active: true,
          specs: payload.specs,
        }])
      }
      setShowAddProduct(false)
      setEditProduct(null)
      setNewProduct({ name: '', category: 'Todo Terreno', price: '', stock: '', imgPreview: '', specs: [] })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible guardar el producto.')
    } finally {
      setSavingProduct(false)
    }
  }

  const setProductActive = async (id: number, active: boolean) => {
    try {
      await apiRequest(`/products/${id}`, { method: 'PATCH', body: { active } })
      setAdminProducts((prev) => prev.map((product) => product.id === id ? { ...product, active } : product))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar el producto.')
    }
  }

  const adjustStock = async (id: number, stock: number) => {
    if (stock < 0) return
    try {
      await apiRequest(`/products/${id}`, { method: 'PATCH', body: { stock } })
      setAdminProducts((prev) => prev.map((product) => product.id === id ? { ...product, stock } : product))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar el inventario.')
    }
  }

  const updateAppointmentStatus = async (appointment: ServiceAppointment, status: AppointmentStatus) => {
    try {
      await apiRequest(`/admin/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        body: { status },
      })
      setAppointments((previous) => previous.map((item) =>
        item.id === appointment.id ? { ...item, status } : item
      ))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar el estado de la cita.')
    }
  }

  const updateOrderStatus = async (id: string, status: string): Promise<boolean> => {
    const currentStatus = orderStatuses[id] ?? orders.find((order) => order.id === id)?.status
    if (currentStatus === status) return true
    const toApiStatus: Record<string, string> = {
      pendiente: 'pending', en_proceso: 'processing', enviado: 'shipped', entregado: 'delivered', cancelado: 'cancelled',
    }
    const toUiStatus: Record<string, string> = {
      pending: 'pendiente', processing: 'en_proceso', shipped: 'enviado', delivered: 'entregado', cancelled: 'cancelado',
    }
    try {
      await apiRequest(`/orders/${id}/status`, {
        method: 'PATCH',
        body: { status: toApiStatus[status] ?? status },
      })
      const savedStatus = toUiStatus[toApiStatus[status] ?? status] ?? status
      setOrderStatuses((prev) => ({ ...prev, [id]: savedStatus }))
      setOrders((prev) => prev.map((order) => order.id === id ? { ...order, status: savedStatus } : order))
      return true
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar el pedido.')
      return false
    }
  }

  const openEditProduct = (p: AdminProduct) => {
    setEditProduct(p)
    setNewProduct({
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
      imgPreview: p.img,
      specs: Array.isArray(p.specs) ? p.specs : [],
    })
    setShowAddProduct(true)
  }

  const saveUser = async () => {
    try {
      const user = await apiRequest<AdminUser>('/admin/users', {
        method: 'POST',
        body: newUser,
      })
      setUsers((previous) => [user, ...previous])
      setShowAddUser(false)
      setNewUser({ name: '', email: '', password: '' })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible crear el usuario.')
    }
  }

  const setAdminUserActive = async (user: AdminUser, active: boolean) => {
    try {
      await apiRequest(`/admin/users/${user.id}/active`, { method: 'PATCH', body: { active } })
      setUsers((previous) => previous.map((item) => item.id === user.id ? { ...item, active } : item))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar el usuario.')
    }
  }

  const setClientActive = async (client: AdminClient, active: boolean) => {
    try {
      await apiRequest(`/admin/clients/${client.id}/active`, { method: 'PATCH', body: { active } })
      setClients((previous) => previous.map((item) => item.id === client.id ? { ...item, active } : item))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar el cliente.')
    }
  }

  const saveClient = async () => {
    if (!newClient.termsAccepted) return window.alert('Debes confirmar la aceptación de términos y privacidad.')
    if (newClient.name.trim().length < 2 || newClient.name.trim().length > 120) {
      return window.alert('El nombre debe contener entre 2 y 120 caracteres.')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClient.email)) {
      return window.alert('Ingresa un correo electrónico válido.')
    }
    if (newClient.password.length < 10 || newClient.password.length > 72) {
      return window.alert('La contraseña debe contener entre 10 y 72 caracteres.')
    }
    if (newClient.phone.length < 7 || newClient.phone.length > 15) {
      return window.alert('El teléfono debe contener entre 7 y 15 dígitos.')
    }
    try {
      const client = await apiRequest<AdminClient>('/admin/clients', {
        method: 'POST',
        body: newClient,
      })
      setClients((previous) => [client, ...previous])
      setNewClient({ name: '', email: '', phone: '', password: '', termsAccepted: false })
      setShowAddClient(false)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible registrar el cliente.')
    }
  }

  const saveOffer = async () => {
    const discount = Number(newOffer.discount)
    if (!Number.isInteger(discount) || discount < 1 || discount > 100) {
      window.alert('El descuento debe ser un número entero entre 1 y 100.')
      return
    }
    try {
      const offer = await apiRequest<AdminOffer>(editingOffer ? `/admin/offers/${editingOffer.id}` : '/admin/offers', {
        method: editingOffer ? 'PATCH' : 'POST',
        body: { ...newOffer, discount },
      })
      setOffers((previous) => editingOffer
        ? previous.map((item) => item.id === editingOffer.id ? offer : item)
        : [offer, ...previous])
      setShowAddOffer(false)
      setEditingOffer(null)
      setNewOffer({ title: '', discount: '', code: '', validFrom: '', validUntil: '', productIds: [] })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible guardar la oferta.')
    }
  }

  const setOfferActive = async (offer: AdminOffer, active: boolean) => {
    try {
      await apiRequest(`/admin/offers/${offer.id}/active`, { method: 'PATCH', body: { active } })
      setOffers((previous) => previous.map((item) => item.id === offer.id ? { ...item, active } : item))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar la oferta.')
    }
  }

  const archiveOffer = async (offer: AdminOffer) => {
    if (!window.confirm(`¿Archivar la oferta "${offer.title}"? Se conservará su registro, pero dejará de aplicar.`)) return
    try {
      await apiRequest(`/admin/offers/${offer.id}`, { method: 'DELETE' })
      setOffers((previous) => previous.map((item) => item.id === offer.id ? { ...item, active: false } : item))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible archivar la oferta.')
    }
  }

  const editOffer = (offer: AdminOffer) => {
    setEditingOffer(offer)
    setNewOffer({
      title: offer.title,
      discount: String(offer.discount),
      code: offer.code,
      validFrom: offer.validFrom,
      validUntil: offer.validUntil ?? '',
      productIds: offer.productIds,
    })
    setShowAddOffer(true)
  }

  const setReviewActive = async (review: AdminReview, active: boolean) => {
    try {
      await apiRequest(`/admin/reviews/${review.id}/approval`, { method: 'PATCH', body: { approved: active } })
      setAdminReviews((previous) => previous.map((item) => item.id === review.id ? { ...item, approved: active } : item))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar la reseña.')
    }
  }

  const saveQuickSale = () => {
    if (quickSale.buyerName.trim().length < 2 || !quickSale.productId) return
    const quantity = Number(quickSale.qty)
    if (!Number.isInteger(quantity) || quantity < 1) {
      window.alert('La cantidad debe ser un número entero mayor que cero.')
      return
    }
    const prod = adminProducts.find(p => String(p.id) === quickSale.productId)
    if (!prod) return
    const newId = `BS-${String(Date.now()).slice(-6)}`
    const newOrder = {
      id: newId,
      client: quickSale.buyerName.trim() + ' (Visita)',
      email: quickSale.phone || '—',
      product: prod.name,
      total: prod.price * quantity,
      status: 'pendiente',
      date: new Date().toISOString().split('T')[0],
      city: 'En tienda',
      payMethod: 'efectivo',
    }
    setOrders(prev => [newOrder, ...prev])
    setOrderStatuses(prev => ({ ...prev, [newId]: 'pendiente' }))
    setShowQuickSale(false)
    setQuickSale({ productId: '', qty: '1', buyerName: '', phone: '' })
    navigateToOrders('todos')
  }

  const exportClientXlsx = () => downloadXlsx([
    ['Cliente', 'Correo', 'Teléfono', 'Pedidos', 'Total gastado (COP)', 'Último pedido'],
    ...clients.map((client) => [client.name, client.email, client.phone, client.orders, client.totalSpent, client.lastOrder ?? '']),
  ], 'informe-clientes')

  const orderReportHeaders = ['Fecha', 'Pedido', 'Cliente', 'Correo', 'Productos', 'Ciudad', 'Método de pago', 'Total (COP)']
  const orderReportRows = orders.map((order) => [
    order.date, order.id, order.client, order.email, order.product, order.city, order.payMethod, order.total,
  ])
  const allSalesOrders = orders.filter((order) => (orderStatuses[order.id] ?? order.status) !== 'cancelado')
  const salesOrders = allSalesOrders.filter((order) =>
    salesFilter === 'all' || (orderStatuses[order.id] ?? order.status) === 'entregado'
  )
  const salesReportRows = salesOrders.map((order) => [
    order.date, order.id, order.client, order.email, order.product, order.city, order.payMethod, order.total,
  ])
  const allSalesRevenue = allSalesOrders.reduce((total, order) => total + order.total, 0)
  const salesRevenue = salesOrders.reduce((total, order) => total + order.total, 0)
  const reportPdf = (title: string, headers: string[], rows: (string | number)[][]) => {
    const reportWindow = window.open('', '_blank')
    if (!reportWindow) {
      window.alert('Permite las ventanas emergentes para imprimir el informe como PDF.')
      return
    }
    const escapeHtml = (value: string | number) => String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]!)
    const head = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')
    const body = rows.map((row) => `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('')
    reportWindow.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font:14px Arial,sans-serif;margin:32px;color:#000}h1{color:#000}p{color:#000}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border:1px solid #bbb;color:#000}th{background:#f4f4f5;color:#000}@media print{body{margin:12mm}}</style></head><body><h1>${escapeHtml(title)}</h1><p>BS Bike Store · ${new Date().toLocaleDateString('es-CO')}</p><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`)
    reportWindow.document.close()
    reportWindow.focus()
    reportWindow.setTimeout(() => reportWindow.print(), 250)
  }
  const exportClientPdf = () => reportPdf(
    'Informe de clientes',
    ['Cliente', 'Correo', 'Teléfono', 'Pedidos', 'Total gastado (COP)', 'Último pedido'],
    clients.map((client) => [client.name, client.email, client.phone, client.orders, client.totalSpent, client.lastOrder ?? '']),
  )
  const exportSalesXlsx = () => downloadXlsx([
    ['Fecha', 'Pedido', 'Cliente', 'Correo', 'Productos', 'Ciudad', 'Método de pago', 'Total (COP)'],
    ...salesReportRows,
    [],
    ['Ventas totales (COP)', salesRevenue],
    ['Pedidos incluidos', salesOrders.length],
  ], 'informe-ventas')
  const exportSalesPdf = () => reportPdf(
    'Informe de ventas y pedidos',
    orderReportHeaders,
    [...salesReportRows, ['', '', '', '', '', '', 'Ventas totales (COP)', salesRevenue]],
  )
  const exportOrdersXlsx = () => downloadXlsx([
    orderReportHeaders,
    ...orderReportRows,
  ], 'informe-pedidos')
  const exportOrdersPdf = () => reportPdf('Informe de pedidos', orderReportHeaders, orderReportRows)
  const filteredClients = clients.filter((c) =>
    (clientsFilter === 'all' || c.active) &&
    (c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase()))
  )
  const filteredProducts = adminProducts.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearch.toLowerCase())
  )
  const filteredInventoryProducts = filteredProducts.filter((product) =>
    (inventoryFilter === 'all' || (product.active && product.stock > 0)) &&
    (inventoryStockFilter === 'all'
      || (inventoryStockFilter === 'critical' && product.stock > 0 && product.stock <= 3)
      || (inventoryStockFilter === 'empty' && product.stock === 0))
  )
  const criticalStockProducts = adminProducts.filter((product) => product.stock <= 3)
  const filteredUsers = users.filter((admin) =>
    admin.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    admin.email.toLowerCase().includes(userSearch.toLowerCase())
  )
  const normalizeOrderStatus = (value: string) => {
    const rawStatus = value.trim().toLowerCase()
    if (rawStatus === 'pending') return 'pendiente'
    if (['processing', 'confirmed', 'confirmado'].includes(rawStatus)) return 'en_proceso'
    if (rawStatus === 'delivered') return 'entregado'
    if (rawStatus === 'shipped') return 'enviado'
    if (rawStatus === 'cancelled') return 'cancelado'
    return rawStatus
  }
  const filteredOrders = orders.filter((order) => {
    if (filtroEstado === 'todos') return true
    const status = normalizeOrderStatus(orderStatuses[order.id] || order.status)
    if (filtroEstado === 'por-atender') return status === 'pendiente' || status === 'en_proceso'
    return status === filtroEstado
  })
  const filteredAppointments = appointments.filter((appointment) =>
    appointmentsFilter === 'all' || appointment.status === appointmentsFilter
  )
  const notificationTotal = adminNotifications.pendingOrders
    + adminNotifications.pendingAppointments
    + adminNotifications.escalations
    + adminNotifications.criticalProducts

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all'
  const btnPrimary = 'bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors'
  const btnOutline = 'border border-gray-200 hover:border-[#0D5C3A] text-gray-600 hover:text-[#0D5C3A] font-semibold px-4 py-2 rounded-xl text-sm transition-colors'

  return (
    <div data-admin-theme={darkMode ? 'dark' : 'light'} className="admin-panel fixed inset-0 z-[100] flex bg-[#F4F4F5] text-slate-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-[#1A1A1A] flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <BSLogo size={32} dark />
              <span className="text-white font-black text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>ADMIN</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen((v) => !v)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors ml-auto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateToAdminSection(item.id)}
              className={`admin-sidebar__nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] ${
                section === item.id ? 'is-active bg-[#0D5C3A] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {sidebarOpen && (
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span>{item.label}</span>
                  {item.id === 'chats' && notificationTotal > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">{notificationTotal}</span>
                  )}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-2 pb-4">
          <button
            onClick={onClose}
            className="admin-sidebar__exit w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-white/10 hover:text-white transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span>Salir</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-black text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {navItems.find((n) => n.id === section)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span aria-hidden="true">{darkMode ? '☀️' : '🌙'}</span>
              <span className="hidden sm:inline">{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
            <button
              onClick={() => setShowQuickSale(true)}
              className="flex items-center gap-2 bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M12 5v14M5 12h14"/></svg>
              Venta rápida
            </button>
            <div className="w-8 h-8 rounded-full bg-[#0D5C3A] flex items-center justify-center text-white text-xs font-bold">A</div>
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">Administrador</span>
          </div>

          {/* Quick Sale Modal */}
          {showQuickSale && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowQuickSale(false)}>
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl modal-animate" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-black text-[#1A1A1A] text-base" style={{fontFamily:'Montserrat,sans-serif'}}>Venta rápida</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Registra una compra sin crear cliente</p>
                  </div>
                  <button onClick={() => setShowQuickSale(false)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Producto *</label>
                    <select className={inputCls} value={quickSale.productId} onChange={e => setQuickSale(q => ({...q, productId: e.target.value}))}>
                      <option value="">— Selecciona un producto —</option>
                      {adminProducts.filter(p => p.stock > 0).map(p => (
                        <option key={p.id} value={String(p.id)}>{p.name} · ${p.price.toLocaleString('es-CO')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Cantidad</label>
                    <input className={inputCls} type="text" inputMode="numeric" pattern="[0-9]*" min="1" value={quickSale.qty} onKeyDown={handleDigitsOnlyKeyDown} onChange={e => setQuickSale(q => ({...q, qty: digitsOnly(e.target.value)}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre del comprador *</label>
                    <input className={inputCls} required minLength={2} maxLength={120} placeholder="Nombre completo" value={quickSale.buyerName} onChange={e => setQuickSale(q => ({...q, buyerName: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Teléfono (opcional)</label>
                    <input className={inputCls} type="tel" inputMode="numeric" pattern="[0-9]{7,15}" maxLength={15} placeholder="3001234567" value={quickSale.phone} onKeyDown={handleDigitsOnlyKeyDown} onChange={e => setQuickSale(q => ({...q, phone: digitsOnly(e.target.value)}))} />
                  </div>
                  {quickSale.productId && (
                    <div className="bg-[#F4F4F5] rounded-xl px-4 py-3 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500">Total estimado</span>
                      <span className="font-black text-[#0D5C3A]">
                        ${((adminProducts.find(p=>String(p.id)===quickSale.productId)?.price||0) * Math.max(1,Number(quickSale.qty))).toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={saveQuickSale} disabled={quickSale.buyerName.trim().length < 2 || !quickSale.productId} className="flex-1 bg-[#0D5C3A] hover:bg-[#1A8A5A] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                    Registrar venta
                  </button>
                  <button onClick={() => setShowQuickSale(false)} className={btnOutline}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="p-6">
          <style>{`@keyframes adminFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <div key={adminSectionKey} style={{ animation: 'adminFadeIn 0.25s ease' }}>

          {/* ── DASHBOARD ── */}
          {section === 'dashboard' && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Total Ventas', value: `$${(allSalesRevenue/1000000).toFixed(1)}M`, sub: 'ventas no canceladas', color: '#0D5C3A', action: () => navigateToAdminSection('reportes', '?view=all') },
                  { label: 'Pedidos Totales', value: orders.length, sub: `${orders.filter(o=>(orderStatuses[o.id]||o.status)==='entregado').length} entregados`, color: '#1A8A5A', action: () => navigateToOrders('todos') },
                  { label: 'Pedidos por atender', value: orders.filter(o=>(orderStatuses[o.id]||o.status)==='pendiente'||(orderStatuses[o.id]||o.status)==='en_proceso').length, sub: 'incluye pedidos confirmados', color: '#1A8A5A', action: () => navigateToOrders('por-atender') },
                  { label: 'Clientes Activos', value: clients.filter((client) => client.active).length, sub: 'registrados', color: '#1A8A5A', action: () => navigateToClients('active') },
                  { label: 'Productos Activos', value: adminProducts.filter((product) => product.active && product.stock > 0).length, sub: 'con stock disponible', color: '#1A8A5A', action: () => navigateToInventory('active') },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    role="button"
                    tabIndex={0}
                    onClick={stat.action}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        stat.action()
                      }
                    }}
                    className="admin-dashboard-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:border-[#0D5C3A]/30 hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#0D5C3A]"
                  >
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className="text-3xl font-black" style={{ color: stat.color, fontFamily: 'Montserrat, sans-serif' }}>{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <section className={`admin-content-card mb-8 rounded-2xl border p-5 shadow-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-gray-100 bg-white text-slate-900'}`} aria-labelledby="admin-notifications-title">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 id="admin-notifications-title" className={`text-sm font-black uppercase tracking-wide ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Notificaciones</h2>
                    <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Pendientes de pedidos, taller, chat e inventario</p>
                  </div>
                  <button type="button" onClick={() => navigateToAdminSection('chats')} className={btnOutline}>
                    Ver chats y alertas
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {[
                    { label: 'Solicitudes de chat', value: adminNotifications.escalations, action: () => navigateToAdminSection('chats') },
                    { label: 'Pedidos pendientes', value: adminNotifications.pendingOrders, action: () => navigateToOrders('por-atender') },
                    { label: 'Citas pendientes', value: adminNotifications.pendingAppointments, action: () => navigateToAppointments('pending') },
                    { label: 'Stock crítico', value: adminNotifications.criticalProducts, action: () => navigateToInventory('all') },
                  ].map((notification) => (
                    <button
                      key={notification.label}
                      type="button"
                      onClick={notification.action}
                      className={`rounded-xl border p-4 text-left transition-colors hover:border-[#0D5C3A]/40 ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-700' : 'border-gray-100 bg-[#F8FAF9] text-slate-900 hover:bg-white'}`}
                    >
                      <span className="block text-2xl font-black text-[#0D5C3A]">{notification.value}</span>
                      <span className={`mt-1 block text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{notification.label}</span>
                    </button>
                  ))}
                </div>
                {adminChatsError && <p role="alert" className="mt-3 text-sm text-red-600">{adminChatsError}</p>}
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">Productos con stock crítico</h3>
                  <div className="space-y-3">
                    {getAdminPage('dashboard-stock', criticalStockProducts).items.map((p) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <div className="product-thumbnail">
                          <img
                            src={p.img || getBikeCategoryImage(p.category)}
                            alt={p.name}
                            className="product-thumbnail-image"
                            loading="lazy"
                            onError={(event) => handleImageFallback(event, getBikeImageFallback(p.category))}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
                        </span>
                      </div>
                    ))}
                    {criticalStockProducts.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Todo el stock en buen nivel ✓</p>
                    )}
                  </div>
                  <AdminPagination
                    page={getAdminPage('dashboard-stock', criticalStockProducts).page}
                    total={criticalStockProducts.length}
                    onChange={(page) => setAdminPage('dashboard-stock', page)}
                  />
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">Últimos clientes</h3>
                  <div className="space-y-3">
                    {getAdminPage('dashboard-clients', clients).items.map((c) => (
                      <div key={c.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0D5C3A]/10 flex items-center justify-center text-[#0D5C3A] font-black text-sm flex-shrink-0">
                          {c.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.orders} pedidos · {c.lastOrder}</p>
                        </div>
                        <span className="text-xs font-bold text-[#0D5C3A]">${(c.totalSpent/1000000).toFixed(1)}M</span>
                      </div>
                    ))}
                  </div>
                  <AdminPagination
                    page={getAdminPage('dashboard-clients', clients).page}
                    total={clients.length}
                    onChange={(page) => setAdminPage('dashboard-clients', page)}
                  />
                </div>
              </div>

              <section className="admin-content-card mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-black text-sm text-[#1A1A1A] uppercase tracking-wide">Agenda del taller</h3>
                    <p className="text-xs text-gray-500">{appointments.filter((appointment) => appointment.status === 'pending').length} citas pendientes</p>
                  </div>
                  <button type="button" onClick={() => navigateToAppointments('all')} className={btnOutline + ' hover:-translate-y-0.5'}>
                    Ver agendamientos
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {appointments
                    .filter((appointment) => appointment.status === 'pending' || appointment.status === 'in_progress')
                    .slice()
                    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
                    .slice(0, 4)
                    .map((appointment) => (
                      <div key={appointment.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                        <span className="font-mono text-xs font-bold text-gray-500">#{appointment.id}</span>
                        <span className="font-semibold text-[#1A1A1A]">{appointment.customerName}</span>
                        <span className="text-gray-500">{appointment.serviceName}</span>
                        <span className="ml-auto text-xs text-gray-500">{formatAppointmentDate(appointment.scheduledAt)}</span>
                      </div>
                    ))}
                  {appointments.length === 0 && (
                    <p className="py-4 text-sm text-gray-500">Todavía no hay citas agendadas.</p>
                  )}
                  {appointments.length > 0 && appointments.every((appointment) => appointment.status !== 'pending' && appointment.status !== 'in_progress') && (
                    <p className="py-4 text-sm text-gray-500">No hay citas pendientes o en proceso.</p>
                  )}
                </div>
              </section>
            </div>
          )}

          {section === 'chats' && (
            <section className={`admin-content-card rounded-2xl border p-5 shadow-sm ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-gray-100 bg-white text-slate-900'}`}>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className={`text-lg font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Conversaciones de clientes</h2>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Mensajes guardados en MySQL · actualización automática cada 30 segundos</p>
                </div>
                <span className="rounded-full bg-[#0D5C3A]/10 px-3 py-1 text-xs font-bold text-[#0D5C3A]">
                  {adminChats.length} conversaciones
                </span>
              </div>
              {adminChatsError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{adminChatsError}</p>}
              <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)]">
                <div className={`max-h-[34rem] min-w-0 overflow-y-auto rounded-xl border ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-slate-50'}`}>
                  {adminChatsLoading && adminChats.length === 0 && <p className={`p-5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Cargando conversaciones…</p>}
                  {!adminChatsLoading && adminChats.length === 0 && <p className={`p-5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Todavía no hay conversaciones.</p>}
                  {adminChats.map((chat) => (
                    <button
                      key={chat.sessionId}
                      type="button"
                      onClick={() => void openAdminChat(chat)}
                      className={`block w-full border-b p-4 text-left transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-100 hover:bg-slate-100'} ${selectedAdminChat?.sessionId === chat.sessionId ? (darkMode ? 'bg-emerald-500/15' : 'bg-[#0D5C3A]/5') : ''}`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className={`truncate text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{chat.contactName || (chat.userId ? 'Cliente registrado' : 'Visitante')}</span>
                        {!!chat.escalationRequested && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Asesor</span>}
                      </span>
                      <span className={`mt-1 block truncate text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{chat.contactEmail || chat.latestMessage || 'Sin mensajes todavía'}</span>
                      <span className={`mt-2 block line-clamp-2 text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{chat.latestMessage || chat.escalationRequest || 'Conversación iniciada'}</span>
                      <span className={`mt-2 block text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {chat.latestMessageAt ? formatAppointmentDate(chat.latestMessageAt) : formatAppointmentDate(chat.createdAt)}
                      </span>
                    </button>
                  ))}
                </div>

                <div className={`flex min-h-[24rem] min-w-0 flex-col overflow-hidden rounded-xl border ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-[#F8FAF9]'}`}>
                  {!selectedAdminChat ? (
                    <div className={`m-auto p-6 text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Selecciona una conversación para ver sus mensajes.</div>
                  ) : (
                    <>
                      <header className={`border-b p-4 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-white'}`}>
                        <h3 className={`font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{selectedAdminChat.contactName || (selectedAdminChat.userId ? 'Cliente registrado' : 'Visitante')}</h3>
                        <p className={`break-all text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {[selectedAdminChat.contactEmail, selectedAdminChat.contactPhone].filter(Boolean).join(' · ') || (selectedAdminChat.userId ? 'Datos de contacto no disponibles' : 'Sin datos de contacto')}
                        </p>
                        {!!selectedAdminChat.escalationRequested && (
                          <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                            Solicitud de asesor: {selectedAdminChat.escalationRequest || 'El cliente solicita atención personalizada.'}
                          </p>
                        )}
                      </header>
                      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
                        {adminChatMessagesLoading && <p className={`text-center text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Cargando mensajes…</p>}
                        {!adminChatMessagesLoading && adminChatMessages.length === 0 && <p className={`text-center text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Esta conversación aún no tiene mensajes.</p>}
                        {adminChatMessages.map((chatMessage) => (
                          <div key={chatMessage.id} className={`flex ${chatMessage.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-3 text-sm ${
                              chatMessage.sender === 'user' ? 'bg-[#0D5C3A] text-white' : (darkMode ? 'bg-slate-800 text-slate-100 shadow-sm' : 'bg-white text-slate-700 shadow-sm')
                            }`}>
                              <p>{chatMessage.message}</p>
                              <time className="mt-1 block text-[10px] opacity-70">
                                {new Date(chatMessage.createdAt).toLocaleString('es-CO')}
                              </time>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          )}

          {section === 'taller' && (
            <section className={`admin-content-card rounded-2xl border shadow-sm overflow-hidden ${darkMode ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-gray-100 bg-white text-slate-900'}`}>
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className={`text-lg font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Agendamientos de taller</h2>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{filteredAppointments.length} citas</p>
                </div>
                <label className={`flex items-center gap-2 text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Estado
                  <select
                    aria-label="Filtrar citas por estado"
                    className={inputCls + ' sm:w-56'}
                    value={appointmentsFilter}
                    onChange={(event) => navigateToAppointments(event.target.value as AppointmentFilter)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En proceso</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="admin-appointments-table w-full text-sm">
                  <thead className={darkMode ? 'bg-slate-900' : 'bg-[#F4F4F5]'}>
                    <tr>
                      {['ID','Cliente','Teléfono','Servicio','Bicicleta','Fecha y hora','Estado','Observaciones'].map((heading) => (
                        <th key={heading} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getAdminPage('appointments', filteredAppointments).items.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-[#F4F4F5]/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-bold">#{appointment.id}</td>
                        <td className="px-4 py-3 text-xs font-semibold">{appointment.customerName}</td>
                        <td className="px-4 py-3 text-xs">{appointment.phone}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className="block font-semibold">{appointment.serviceName}</span>
                          {appointment.serviceType && <span className="text-gray-500">{appointment.serviceType}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs">{appointment.bike}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">{formatAppointmentDate(appointment.scheduledAt)}</td>
                        <td className="px-4 py-3">
                          <select
                            aria-label={`Cambiar estado de la cita ${appointment.id}`}
                            className={inputCls + ' min-w-36'}
                            value={appointment.status}
                            onChange={(event) => void updateAppointmentStatus(appointment, event.target.value as AppointmentStatus)}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="in_progress">En proceso</option>
                            <option value="completed">Completada</option>
                            <option value="cancelled">Cancelada</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">{appointment.observations || '—'}</td>
                      </tr>
                    ))}
                    {filteredAppointments.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">No hay citas para este filtro.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <AdminPagination
                page={getAdminPage('appointments', filteredAppointments).page}
                total={filteredAppointments.length}
                onChange={(page) => setAdminPage('appointments', page)}
              />
            </section>
          )}

          {/* ── PRODUCTOS ── */}
          {section === 'productos' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500">{filteredProducts.length} productos registrados</p>
                <button onClick={() => { setEditProduct(null); setNewProduct({ name:'', category:'Todo Terreno', price:'', stock:'', imgPreview:'', specs:[] }); setShowAddProduct(true) }} className={btnPrimary}>
                  + Agregar producto
                </button>
              </div>
              <input
                className={`${inputCls} mb-4 max-w-sm`}
                aria-label="Buscar productos"
                placeholder="Buscar por producto o categoría..."
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
              />

              {showAddProduct && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">{editProduct ? 'Editar producto' : 'Nuevo producto'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre</label>
                      <input className={inputCls} required minLength={2} maxLength={180} value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} placeholder="Ej: Trek Top Fuel 9.9" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Categoría</label>
                      <select className={inputCls} value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value, imgPreview: getBikeCategoryImage(e.target.value) }))}>
                        {ADMIN_PRODUCT_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Precio (COP)</label>
                      <input className={inputCls} type="text" inputMode="numeric" pattern="[0-9]*" min="1" required value={newProduct.price} onKeyDown={handleDigitsOnlyKeyDown} onChange={(e) => setNewProduct((p) => ({ ...p, price: digitsOnly(e.target.value) }))} placeholder="18900000" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Stock</label>
                      <input className={inputCls} type="text" inputMode="numeric" pattern="[0-9]*" min="0" required value={newProduct.stock} onKeyDown={handleDigitsOnlyKeyDown} onChange={(e) => setNewProduct((p) => ({ ...p, stock: digitsOnly(e.target.value) }))} placeholder="10" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Foto del producto</label>
                      <input
                        className={inputCls + ' mb-3'}
                        type="url"
                        aria-label="URL de imagen del producto"
                        placeholder="Pega la URL de la imagen"
                        value={newProduct.imgPreview.startsWith('data:') ? '' : newProduct.imgPreview}
                        onChange={(event) => setNewProduct((product) => ({ ...product, imgPreview: event.target.value }))}
                      />
                      <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#0D5C3A] rounded-xl p-4 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-gray-400">
                          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                        <img
                          src={newProduct.imgPreview || editProduct?.img || getBikeCategoryImage(newProduct.category)}
                          alt={`Vista previa de ${newProduct.category}`}
                          onError={(event) => {
                            const fallback = getBikeImageFallback(newProduct.category)
                            handleImageFallback(event, fallback)
                            setNewProduct((product) => ({ ...product, imgPreview: fallback }))
                          }}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <span className="text-sm text-gray-500">Imagen sugerida por categoría · pulsa para subir otra</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImgUpload} />
                      </label>
                    </div>
                    <fieldset className="sm:col-span-2">
                      <legend className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Especificaciones técnicas</legend>
                      <div className="space-y-2">
                        {newProduct.specs.map((spec, index) => (
                          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                            <input
                              className={inputCls}
                              aria-label={`Nombre de especificación ${index + 1}`}
                              placeholder="Ej. Marco"
                              maxLength={120}
                              value={spec.label}
                              onChange={(event) => setNewProduct((product) => ({
                                ...product,
                                specs: product.specs.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item),
                              }))}
                            />
                            <input
                              className={inputCls}
                              aria-label={`Valor de especificación ${index + 1}`}
                              placeholder="Ej. Aluminio"
                              maxLength={300}
                              value={spec.value}
                              onChange={(event) => setNewProduct((product) => ({
                                ...product,
                                specs: product.specs.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item),
                              }))}
                            />
                            <button
                              type="button"
                              aria-label={`Eliminar especificación ${index + 1}`}
                              onClick={() => setNewProduct((product) => ({ ...product, specs: product.specs.filter((_, itemIndex) => itemIndex !== index) }))}
                              className="rounded-lg border border-gray-200 px-3 text-gray-500 hover:border-red-300 hover:text-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewProduct((product) => ({ ...product, specs: [...product.specs, { label: '', value: '' }] }))}
                        className="mt-3 rounded-lg border border-dashed border-[#0D5C3A]/40 px-3 py-2 text-xs font-bold text-[#0D5C3A] hover:bg-[#0D5C3A]/5"
                      >
                        + Agregar especificación
                      </button>
                    </fieldset>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => void saveProduct()} disabled={savingProduct} className={btnPrimary + ' disabled:opacity-50'}>{savingProduct ? 'Guardando…' : editProduct ? 'Guardar cambios' : 'Crear producto'}</button>
                    <button onClick={() => { setShowAddProduct(false); setEditProduct(null) }} className={btnOutline}>Cancelar</button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="min-w-[700px] w-full text-sm">
                  <thead className="bg-[#F4F4F5]">
                    <tr>
                      {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map(h=>(
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getAdminPage('products', filteredProducts).items.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F4F4F5]/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="product-thumbnail">
                              <img src={p.img} alt={p.name} className="product-thumbnail-image" />
                            </div>
                            <span className="font-semibold text-[#1A1A1A] text-xs">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.category}</td>
                        <td className="px-4 py-3 font-bold text-[#1A1A1A] text-xs">${p.price.toLocaleString('es-CO')}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            p.stock === 0 ? 'bg-red-100 text-red-600' :
                            p.stock <= 3 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-700'
                          }`}>{p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => void setProductActive(p.id, !p.active)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${p.active ? 'bg-[#0D5C3A]' : 'bg-gray-200'}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.active ? 'left-5' : 'left-0.5'}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditProduct(p)} className="text-[#0D5C3A] hover:underline text-xs font-bold">Editar</button>
                            <button onClick={() => void setProductActive(p.id, !p.active)} className="text-xs font-bold text-gray-600 hover:text-[#0D5C3A]">
                              {p.active ? 'Deshabilitar' : 'Habilitar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <AdminPagination
                  page={getAdminPage('products', filteredProducts).page}
                  total={filteredProducts.length}
                  onChange={(page) => setAdminPage('products', page)}
                />
              </div>
            </div>
          )}

          {/* ── INVENTARIO ── */}
          {section === 'inventario' && (
            <div>
              <input
                className={`${inputCls} mb-4 max-w-sm`}
                aria-label="Buscar productos del inventario"
                placeholder="Buscar por producto o categoría..."
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
              />
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-4">
                Estado
                <select
                  aria-label="Filtrar productos del inventario"
                  className={inputCls + ' max-w-xs'}
                  value={inventoryFilter}
                  onChange={(event) => navigateToInventory(event.target.value as DashboardActiveFilter)}
                >
                  <option value="all">Todos los productos</option>
                  <option value="active">Activos con stock disponible</option>
                </select>
              </label>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total unidades', value: adminProducts.reduce((sum, product) => sum + product.stock, 0), color: '#0D5C3A', filter: 'all' as const },
                  { label: 'Stock crítico (≤3)', value: adminProducts.filter((product) => product.stock > 0 && product.stock <= 3).length, color: '#0D5C3A', filter: 'critical' as const },
                  { label: 'Sin stock', value: adminProducts.filter((product) => product.stock === 0).length, color: '#0D5C3A', filter: 'empty' as const },
                ].map(s=>(
                  <button
                    key={s.label}
                    type="button"
                    aria-pressed={inventoryStockFilter === s.filter && (s.filter !== 'all' || inventoryFilter === 'all')}
                    onClick={() => {
                      setInventoryFilter('all')
                      setInventoryStockFilter(s.filter)
                      setAdminPage('inventory', 1)
                    }}
                    className={`rounded-2xl bg-white p-5 text-left shadow-sm transition-all ${inventoryStockFilter === s.filter && (s.filter !== 'all' || inventoryFilter === 'all') ? 'border-2 border-[#0D5C3A] ring-2 ring-[#0D5C3A]/10' : 'border border-gray-100 hover:border-[#0D5C3A]/40'}`}
                  >
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-3xl font-black" style={{color:s.color, fontFamily:'Montserrat, sans-serif'}}>{s.value}</p>
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F4F5]">
                    <tr>
                      {['ID','Producto','Categoría','Precio','Stock actual','Nivel','Estado','Ajustar stock'].map(h=>(
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getAdminPage('inventory', filteredInventoryProducts).items.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F4F4F5]/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="product-thumbnail">
                              <img src={p.img} alt={p.name} className="product-thumbnail-image" />
                            </div>
                            <span className="font-semibold text-xs text-[#1A1A1A]">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{p.category}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-[#1A1A1A]">${p.price.toLocaleString('es-CO')} COP</td>
                        <td className="px-4 py-3 font-black text-[#1A1A1A]">{p.stock}</td>
                        <td className="px-4 py-3">
                          <div className="w-24 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all" style={{
                              width: `${Math.min(100, (p.stock/15)*100)}%`,
                              backgroundColor: p.stock===0?'#dc2626':p.stock<=3?'#d97706':'#0D5C3A'
                            }} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold">
                          <span className={p.active ? 'text-green-700' : 'text-gray-500'}>{p.active ? 'Activo' : 'Inactivo'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => void adjustStock(p.id, p.stock - 1)} disabled={p.stock === 0} className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 flex items-center justify-center text-gray-600 font-bold transition-colors">−</button>
                            <span className="w-8 text-center text-sm font-bold">{p.stock}</span>
                            <button onClick={() => void adjustStock(p.id, p.stock + 1)} className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 font-bold transition-colors">+</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <AdminPagination
                  page={getAdminPage('inventory', filteredInventoryProducts).page}
                  total={filteredInventoryProducts.length}
                  onChange={(page) => setAdminPage('inventory', page)}
                />
              </div>
            </div>
          )}

          {/* ── OFERTAS ── */}
          {section === 'ofertas' && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <p className="text-sm text-gray-500">{offers.length} ofertas creadas</p>
                <button onClick={() => {
                  setEditingOffer(null)
                  setNewOffer({ title: '', discount: '', code: '', validFrom: new Date().toLocaleDateString('sv-SE'), validUntil: '', productIds: [] })
                  setShowAddOffer(true)
                }} className={btnPrimary}>+ Nueva oferta</button>
              </div>
              {showAddOffer && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">{editingOffer ? 'Editar oferta' : 'Crear oferta'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre de la oferta</label>
                      <input className={inputCls} value={newOffer.title} onChange={e=>setNewOffer(o=>({...o,title:e.target.value}))} placeholder="Ej: Temporada de MTB" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Descuento (%)</label>
                      <input className={inputCls} type="text" inputMode="numeric" pattern="[0-9]{1,3}" min="1" max="100" required value={newOffer.discount} onKeyDown={handleDigitsOnlyKeyDown} onChange={e=>setNewOffer(o=>({...o,discount:digitsOnly(e.target.value).slice(0, 3)}))} placeholder="15" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Código</label>
                      <input className={inputCls} maxLength={40} value={newOffer.code} onChange={e=>setNewOffer(o=>({...o,code:e.target.value.toUpperCase()}))} placeholder="MTB15" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Válido desde</label>
                      <input className={inputCls} type="date" value={newOffer.validFrom} onChange={e=>setNewOffer(o=>({...o,validFrom:e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Válido hasta</label>
                      <input className={inputCls} type="date" value={newOffer.validUntil} onChange={e=>setNewOffer(o=>({...o,validUntil:e.target.value}))} />
                    </div>
                  </div>
                  <fieldset className="mt-4">
                    <legend className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Productos incluidos</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto rounded-xl border border-gray-200 p-3">
                      {adminProducts.filter((product) => product.active).map((product) => (
                        <label key={product.id} className="flex items-center gap-2 text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={newOffer.productIds.includes(product.id)}
                            onChange={(event) => setNewOffer((offer) => ({
                              ...offer,
                              productIds: event.target.checked
                                ? [...offer.productIds, product.id]
                                : offer.productIds.filter((id) => id !== product.id),
                            }))}
                          />
                          <span>{product.name}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => void saveOffer()} disabled={!newOffer.title.trim() || !newOffer.discount || Number(newOffer.discount) < 1 || Number(newOffer.discount) > 100 || !newOffer.code.trim() || !newOffer.validFrom || newOffer.productIds.length === 0} className={btnPrimary + ' disabled:opacity-50'}>{editingOffer ? 'Guardar cambios' : 'Crear oferta'}</button>
                    <button onClick={() => { setShowAddOffer(false); setEditingOffer(null) }} className={btnOutline}>Cancelar</button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAdminPage('offers', offers).items.map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-black text-[#1A1A1A] text-sm">{o.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{o.validFrom} → {o.validUntil || 'Sin vencimiento'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{o.productIds.length} productos asociados</p>
                      </div>
                      <span className="text-2xl font-black text-[#0D5C3A]" style={{fontFamily:'Montserrat,sans-serif'}}>-{o.discount}%</span>
                    </div>
                    <div className="bg-[#F4F4F5] rounded-xl px-3 py-2 flex items-center justify-between mb-3">
                      <span className="font-mono text-sm font-bold tracking-widest text-[#1A1A1A]">{o.code}</span>
                      <span className="text-xs text-gray-400">código</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => void setOfferActive(o, !o.active)}
                        className={`flex items-center gap-2 text-xs font-bold ${o.active?'text-[#0D5C3A]':'text-gray-400'}`}
                      >
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${o.active?'bg-[#0D5C3A]':'bg-gray-200'}`}>
                          <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${o.active?'left-4':'left-0.5'}`} />
                        </div>
                        {o.active ? 'Activa' : 'Inactiva'}
                      </button>
                      <div className="flex items-center gap-3">
                        <button onClick={() => editOffer(o)} className="text-xs font-bold text-[#0D5C3A] hover:underline">Editar</button>
                        <button onClick={() => void archiveOffer(o)} className="text-xs font-bold text-red-600 hover:underline">Archivar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <AdminPagination
                page={getAdminPage('offers', offers).page}
                total={offers.length}
                onChange={(page) => setAdminPage('offers', page)}
              />
            </div>
          )}

          {/* ── USUARIOS ── */}
          {section === 'usuarios' && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <p className="text-sm text-gray-500">{filteredUsers.length} usuarios del sistema</p>
                <button onClick={() => setShowAddUser(true)} className={btnPrimary}>+ Crear administrador</button>
              </div>
              <input
                className={`${inputCls} mb-4 max-w-sm`}
                aria-label="Buscar usuarios"
                placeholder="Buscar por nombre o correo..."
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
              />
              {showAddUser && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">Nuevo usuario</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre completo</label>
                      <input className={inputCls} value={newUser.name} onChange={e=>setNewUser(u=>({...u,name:e.target.value}))} placeholder="Carlos Rodríguez" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Correo electrónico</label>
                      <input className={inputCls} type="email" value={newUser.email} onChange={e=>setNewUser(u=>({...u,email:e.target.value}))} placeholder="correo@bsbikestore.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Contraseña inicial</label>
                      <input className={inputCls} type="password" minLength={12} value={newUser.password} onChange={e=>setNewUser(u=>({...u,password:e.target.value}))} placeholder="Mínimo 12 caracteres" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => void saveUser()} disabled={!newUser.name.trim() || !newUser.email.trim() || newUser.password.length < 12} className={btnPrimary + ' disabled:opacity-50'}>Crear administrador</button>
                    <button onClick={() => setShowAddUser(false)} className={btnOutline}>Cancelar</button>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F4F5]">
                    <tr>
                      {['Usuario','Correo','Rol','Creado','Acciones'].map(h=>(
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getAdminPage('users', filteredUsers).items.map((u) => (
                      <tr key={u.id} className="hover:bg-[#F4F4F5]/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#0D5C3A]/10 flex items-center justify-center text-[#0D5C3A] font-black text-sm">{u.name[0]}</div>
                            <span className="font-semibold text-[#1A1A1A] text-sm">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.role==='admin'?'bg-[#0D5C3A]/10 text-[#0D5C3A]':'bg-gray-100 text-gray-600'}`}>
                            Administrador
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{u.createdAt}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => void setAdminUserActive(u, !u.active)}
                            className={`text-xs font-bold ${u.active ? 'text-[#0D5C3A]' : 'text-gray-400'}`}
                          >{u.active ? 'Deshabilitar' : 'Habilitar'}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <AdminPagination
                  page={getAdminPage('users', filteredUsers).page}
                  total={filteredUsers.length}
                  onChange={(page) => setAdminPage('users', page)}
                />
              </div>
            </div>
          )}

          {/* ── CLIENTES ── */}
          {section === 'clientes' && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-xs">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input className={`${inputCls} pl-9`} placeholder="Buscar cliente..." value={clientSearch} onChange={e=>setClientSearch(e.target.value)} />
                </div>
                <select
                  aria-label="Filtrar clientes"
                  className={inputCls + ' max-w-xs'}
                  value={clientsFilter}
                  onChange={(event) => navigateToClients(event.target.value as DashboardActiveFilter)}
                >
                  <option value="all">Todos los clientes</option>
                  <option value="active">Clientes activos</option>
                </select>
                <p className="text-sm text-gray-500">{filteredClients.length} clientes</p>
                <button onClick={() => setShowAddClient((visible) => !visible)} className={btnPrimary}>+ Registrar cliente</button>
              </div>
              {showAddClient && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                  <h3 className="font-black text-sm mb-4">Nuevo cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className={inputCls} aria-label="Nombre del cliente" placeholder="Nombre completo" value={newClient.name} onChange={(event) => setNewClient((client) => ({ ...client, name: event.target.value }))} />
                    <input className={inputCls} aria-label="Correo del cliente" type="email" placeholder="Correo electrónico" value={newClient.email} onChange={(event) => setNewClient((client) => ({ ...client, email: event.target.value }))} />
                    <input className={inputCls} aria-label="Teléfono del cliente" type="tel" inputMode="numeric" pattern="[0-9]{7,15}" maxLength={15} placeholder="Teléfono" value={newClient.phone} onKeyDown={handleDigitsOnlyKeyDown} onChange={(event) => setNewClient((client) => ({ ...client, phone: digitsOnly(event.target.value) }))} />
                    <input className={inputCls} aria-label="Contraseña inicial" type="password" minLength={10} placeholder="Contraseña inicial (mín. 10 caracteres)" value={newClient.password} onChange={(event) => setNewClient((client) => ({ ...client, password: event.target.value }))} />
                  </div>
                  <label className="flex items-start gap-2 text-xs text-gray-600 my-4">
                    <input type="checkbox" checked={newClient.termsAccepted} onChange={(event) => setNewClient((client) => ({ ...client, termsAccepted: event.target.checked }))} className="mt-0.5 accent-[#0D5C3A]" />
                    El cliente confirma la aceptación de los términos y la política de privacidad.
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => void saveClient()} disabled={!newClient.name || !newClient.email || newClient.phone.replace(/\D/g, '').length < 7 || newClient.password.length < 10 || !newClient.termsAccepted} className={btnPrimary + ' disabled:opacity-50'}>Guardar cliente</button>
                    <button onClick={() => setShowAddClient(false)} className={btnOutline}>Cancelar</button>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F4F5]">
                    <tr>
                      {['ID','Cliente','Contacto','Pedidos','Total gastado','Último pedido','Estado'].map(h=>(
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getAdminPage('clients', filteredClients).items.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F4F4F5]/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#1A8A5A]/10 flex items-center justify-center text-[#0D5C3A] font-black text-sm">{c.name[0]}</div>
                            <button onClick={() => void openClientOrders(c)} className="font-semibold text-[#1A1A1A] hover:text-[#0D5C3A] hover:underline text-left">{c.name}</button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-500">{c.email}</p>
                          <p className="text-xs text-gray-400">{c.phone}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#1A1A1A]">{c.orders}</td>
                        <td className="px-4 py-3 font-black text-[#0D5C3A] text-sm">${c.totalSpent.toLocaleString('es-CO')}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{c.lastOrder ?? '—'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => void setClientActive(c, !c.active)}
                            aria-label={`${c.active ? 'Deshabilitar' : 'Habilitar'} ${c.name}`}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                          >{c.active ? 'Habilitado' : 'Deshabilitado'}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <AdminPagination
                  page={getAdminPage('clients', filteredClients).page}
                  total={filteredClients.length}
                  onChange={(page) => setAdminPage('clients', page)}
                />
              </div>
              {selectedClient && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="client-orders-title">
                  <div className="w-full max-w-4xl max-h-[85vh] overflow-auto rounded-2xl bg-white p-5 shadow-2xl">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 id="client-orders-title" className="text-lg font-black">Historial de compras</h3>
                        <p className="text-sm text-gray-500">{selectedClient.name} · {selectedClient.email}</p>
                      </div>
                      <button onClick={() => setSelectedClient(null)} className={btnOutline} aria-label="Cerrar historial">Cerrar</button>
                    </div>
                    {clientOrdersLoading ? <p className="py-8 text-center text-sm text-gray-500">Cargando pedidos...</p>
                      : clientOrdersError ? <p role="alert" className="py-8 text-center text-sm text-red-600">{clientOrdersError}</p>
                        : clientOrders.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">Este cliente aún no tiene pedidos.</p>
                          : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                                  <tr>{['Pedido', 'Fecha', 'Productos', 'Total', 'Estado'].map((heading) => <th key={heading} className="px-3 py-2">{heading}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {clientOrders.map((order) => (
                                    <tr key={order.id}>
                                      <td className="px-3 py-3 font-mono">#{order.id}</td>
                                      <td className="px-3 py-3">{new Date(order.createdAt).toLocaleDateString('es-CO')}</td>
                                      <td className="px-3 py-3">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</td>
                                      <td className="px-3 py-3 font-bold">${order.total.toLocaleString('es-CO')}</td>
                                      <td className="px-3 py-3 capitalize">{({ pending: 'Pendiente', processing: 'En proceso', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' })[order.status]}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REPORTES ── */}
          {section === 'reportes' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ventas:</span>
                <select
                  aria-label="Filtrar ventas del reporte"
                  className={inputCls + ' max-w-xs'}
                  value={salesFilter}
                  onChange={(event) => navigateToSales(event.target.value as DashboardSalesFilter)}
                >
                  <option value="all">Todas las ventas</option>
                  <option value="delivered">Ventas entregadas</option>
                </select>
                <button onClick={exportSalesPdf} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-gray-200 text-black hover:bg-gray-50 transition-colors">📄 PDF</button>
                <button onClick={exportSalesXlsx} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-gray-200 text-black hover:bg-gray-50 transition-colors">📊 Excel (.xlsx)</button>
                <span className="ml-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Clientes:</span>
                <button
                  onClick={exportClientPdf}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-gray-200 text-black hover:bg-gray-50 transition-colors"
                >
                  📄 PDF
                </button>
                <button
                  onClick={exportClientXlsx}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-gray-200 text-black hover:bg-gray-50 transition-colors"
                >
                  📊 Excel (.xlsx)
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">Ventas recientes</h3>
                  {salesOrders.length ? (
                    <div className="space-y-3">
                      {salesOrders.slice(0, 6).map((order) => (
                        <div key={order.id} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#1A1A1A] truncate">{order.client}</p>
                            <p className="text-[11px] text-gray-500 truncate">{order.product} · {order.date}</p>
                          </div>
                          <span className="text-xs font-black text-[#0D5C3A] whitespace-nowrap">${order.total.toLocaleString('es-CO')}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500">Aún no hay ventas registradas.</p>}
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">Resumen financiero</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Ventas registradas', value: `$${salesRevenue.toLocaleString('es-CO')} COP`, highlight: true },
                      { label: 'Promedio por pedido', value: `$${(salesOrders.length ? salesRevenue / salesOrders.length : 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP`, highlight: false },
                      { label: 'Pedidos no cancelados', value: salesOrders.length, highlight: false },
                      { label: 'Clientes activos', value: clients.filter((client) => client.active).length, highlight: false },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{r.label}</span>
                        <span className={`font-black text-sm ${r.highlight ? 'text-[#0D5C3A]' : 'text-[#1A1A1A]'}`}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F4F5]">
                    <tr>
                      {['Pedido','Fecha','Cliente','Productos','Estado','Total'].map((header) => (
                        <th key={header} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getAdminPage('sales-report', salesOrders).items.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-[#1A1A1A]">{order.id}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{order.date}</td>
                        <td className="px-4 py-3 text-xs text-[#1A1A1A]">
                          <span className="block font-semibold">{order.client}</span>
                          <span className="text-gray-500">{order.email}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{order.product}</td>
                        <td className="px-4 py-3 text-xs font-semibold">{orderStatuses[order.id] ?? order.status}</td>
                        <td className="px-4 py-3 text-xs font-black text-[#0D5C3A]">${order.total.toLocaleString('es-CO')} COP</td>
                      </tr>
                    ))}
                    {salesOrders.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No hay ventas para este filtro.</td></tr>
                    )}
                  </tbody>
                </table>
                <AdminPagination
                  page={getAdminPage('sales-report', salesOrders).page}
                  total={salesOrders.length}
                  onChange={(page) => setAdminPage('sales-report', page)}
                />
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden">
                <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">Top clientes por gasto</h3>
                <div className="space-y-4">
                  {(() => {
                    const sorted = [...clients].sort((a,b) => b.totalSpent - a.totalSpent)
                    const max = sorted[0]?.totalSpent || 1
                    return sorted.map((c, i) => {
                      const pct = Math.min(100, Math.round((c.totalSpent / max) * 100))
                      return (
                        <div key={c.id} className="flex items-center gap-3 min-w-0">
                          <span className="w-5 text-xs font-black text-gray-400 flex-shrink-0">#{i+1}</span>
                          <div className="w-7 h-7 rounded-full bg-[#0D5C3A]/10 flex items-center justify-center text-[#0D5C3A] font-black text-xs flex-shrink-0">{c.name[0]}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold text-[#1A1A1A] truncate">{c.name}</p>
                              <span className="font-black text-xs text-[#0D5C3A] flex-shrink-0">${(c.totalSpent/1000000).toFixed(1)}M</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div className="h-1.5 bg-[#0D5C3A] rounded-full transition-all duration-500" style={{width:`${pct}%`}} />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>

            </div>
          )}

          {/* ── PEDIDOS ── */}
          {section === 'pedidos' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-black text-[#1A1A1A]">Gestión de pedidos</h2>
                  <p className="text-xs text-gray-500">
                    {filtroEstado === 'por-atender'
                      ? 'Pedidos pendientes y confirmados que aún están en proceso.'
                      : 'Todos los pedidos registrados.'}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  Mostrar
                  <select
                    aria-label="Filtrar pedidos"
                    className={inputCls + ' admin-order-status-select transition-colors duration-200 sm:w-56'}
                    value={filtroEstado}
                    onChange={(event) => updateOrdersFilter(event.target.value as DashboardOrdersFilter)}
                  >
                    <option value="todos">Todos los pedidos</option>
                    <option value="por-atender">Por atender</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="entregado">Entregados</option>
                  </select>
                  <span className="whitespace-nowrap text-[11px] text-gray-500" aria-live="polite">
                    {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
                  </span>
                </label>
              </div>
              <div className="flex justify-end gap-2 mb-4">
                <button onClick={exportOrdersPdf} className="px-3 py-2 rounded-lg border border-gray-200 text-black text-xs font-bold hover:bg-gray-50">📄 PDF pedidos</button>
                <button onClick={exportOrdersXlsx} className="px-3 py-2 rounded-lg border border-gray-200 text-black text-xs font-bold hover:bg-gray-50">📊 Excel pedidos</button>
              </div>
              {/* Edit order modal */}
              {editingOrder && editOrderDraft && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditingOrder(null)}>
                  <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl modal-animate" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <div>
                        <h3 className="font-black text-[#1A1A1A]" style={{fontFamily:'Montserrat,sans-serif'}}>Actualizar pedido</h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{editingOrder.id}</p>
                      </div>
                      <button onClick={() => setEditingOrder(null)} className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all duration-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <div className="px-6 py-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Cliente</label>
                          <input className={inputCls} value={editOrderDraft.client} readOnly />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Correo</label>
                          <input className={inputCls} type="email" value={editOrderDraft.email} readOnly />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Producto</label>
                        <input className={inputCls} value={editOrderDraft.product} readOnly />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Total (COP)</label>
                          <input className={inputCls} type="number" value={editOrderDraft.total} readOnly />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Ciudad</label>
                          <input className={inputCls} value={editOrderDraft.city} readOnly />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Método de pago</label>
                          <input className={inputCls} value={editOrderDraft.payMethod} readOnly />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Estado</label>
                          <select className={inputCls + ' admin-order-status-select transition-colors duration-200'} value={orderStatuses[editOrderDraft.id] || editOrderDraft.status} onChange={e => setOrderStatuses(prev => ({...prev, [editOrderDraft.id]: e.target.value}))}>
                            <option value="pendiente">Pendiente</option>
                            <option value="en_proceso">En proceso</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Fecha</label>
                        <input className={inputCls} type="date" value={editOrderDraft.date} readOnly />
                      </div>
                    </div>
                    <div className="flex gap-3 px-6 pb-6">
                      <button
                        onClick={async () => {
                          if (!editOrderDraft) return
                          const status = orderStatuses[editOrderDraft.id] || editOrderDraft.status
                          if (await updateOrderStatus(editOrderDraft.id, status)) setEditingOrder(null)
                        }}
                        className={btnPrimary + ' flex-1'}
                      >Guardar cambios</button>
                      <button onClick={() => setEditingOrder(null)} className={btnOutline}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total pedidos', value: orders.length, color: '#0D5C3A', filter: 'todos' as const },
                  { label: 'Pendientes', value: orders.filter((order) => normalizeOrderStatus(orderStatuses[order.id] || order.status) === 'pendiente').length, color: '#0D5C3A', filter: 'pendiente' as const },
                  { label: 'En proceso', value: orders.filter((order) => normalizeOrderStatus(orderStatuses[order.id] || order.status) === 'en_proceso').length, color: '#0D5C3A', filter: 'en_proceso' as const },
                  { label: 'Entregados', value: orders.filter((order) => normalizeOrderStatus(orderStatuses[order.id] || order.status) === 'entregado').length, color: '#0D5C3A', filter: 'entregado' as const },
                ].map(s => (
                  <button
                    key={s.label}
                    type="button"
                    aria-pressed={filtroEstado === s.filter}
                    onClick={() => updateOrdersFilter(s.filter)}
                    className={`rounded-2xl bg-white p-5 text-left shadow-sm transition-all hover:scale-[1.02] ${filtroEstado === s.filter ? 'border-2 border-[#0D5C3A] ring-2 ring-[#0D5C3A]/10' : 'border border-gray-100 hover:border-[#0D5C3A]/40'}`}
                  >
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-3xl font-black" style={{color:s.color, fontFamily:'Montserrat, sans-serif'}}>{s.value}</p>
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F4F4F5]">
                      <tr>
                        {['#Pedido','Factura','Cliente','Producto','Estado','Total','Fecha','Acciones'].map(h=>(
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getAdminPage('orders', filteredOrders).items.map(o => {
                        const st = orderStatuses[o.id] || o.status
                        const normalizedStatus = st.trim().toLowerCase()
                        const isPendingStatus = normalizedStatus === 'pendiente' || normalizedStatus === 'pending'
                        const isProcessingStatus = ['en_proceso', 'processing', 'confirmado', 'confirmed'].includes(normalizedStatus)
                        return (
                          <tr key={o.id} className="hover:bg-[#F4F4F5]/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs font-bold text-[#1A1A1A]">{o.id}</td>
                            <td className="px-4 py-3 font-mono text-[10px] text-gray-500">{o.invoiceNumber ?? '—'}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-xs text-[#1A1A1A]">{o.client}</p>
                              <p className="text-[10px] text-gray-400">{o.email}</p>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px] truncate">{o.product}</td>
                            <td className="px-4 py-3">
                              <span className={`admin-order-status admin-order-status--${
                                isPendingStatus ? 'pending'
                                  : isProcessingStatus ? 'processing'
                                    : normalizedStatus === 'enviado' || normalizedStatus === 'shipped' ? 'shipped'
                                      : normalizedStatus === 'entregado' || normalizedStatus === 'delivered' ? 'delivered'
                                        : normalizedStatus === 'cancelado' || normalizedStatus === 'cancelled' ? 'cancelled'
                                          : 'default'
                              }`}>
                                {isPendingStatus ? 'Pendiente' : isProcessingStatus ? 'Confirmado' : st.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-black text-xs text-[#0D5C3A] whitespace-nowrap">${o.total.toLocaleString('es-CO')}</td>
                            <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{o.date}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setEditingOrder(o); setEditOrderDraft({...o}) }}
                                  className="admin-order-action admin-order-action--edit p-1 rounded transition-colors duration-200"
                                  title="Editar pedido"
                                  aria-label={`Editar pedido ${o.id}`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button
                                  onClick={() => void updateOrderStatus(o.id, 'cancelado')}
                                  disabled={!isPendingStatus && !isProcessingStatus}
                                  className="admin-order-action admin-order-action--cancel p-1 rounded transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Cancelar pedido y devolver existencias"
                                  aria-label={`Cancelar pedido ${o.id}`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <AdminPagination
                  page={getAdminPage('orders', filteredOrders).page}
                  total={filteredOrders.length}
                  onChange={(page) => setAdminPage('orders', page)}
                />
              </div>
            </div>
          )}

          {/* ── RESEÑAS ── */}
          {section === 'resenas' && (
            <div>
              <p className="text-sm text-gray-500 mb-5">{adminReviews.length} reseñas de clientes</p>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F4F4F5]">
                      <tr>
                        {['Reviewer','Calificación','Comentario','Fecha','Estado','Acciones'].map(h=>(
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {getAdminPage('reviews', adminReviews).items.map((review) => {
                        const active = review.approved
                        const reviewDate = new Date(review.createdAt).toLocaleDateString()
                        return (
                          <tr key={review.id} className="hover:bg-[#F4F4F5]/50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-xs text-[#1A1A1A]">{review.author}</p>
                              <p className="text-[10px] text-[#0D5C3A] font-bold">{review.productName}</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-0.5">
                                {[1,2,3,4,5].map(s=>(
                                  <svg key={s} className={`w-3 h-3 ${s<=review.rating?'fill-[#0D5C3A] text-[#0D5C3A]':'fill-gray-200 text-gray-200'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px]">
                              <p className="truncate">{review.comment}</p>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">{reviewDate}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{active ? 'Activa' : 'Inactiva'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => void setReviewActive(review, !active)}
                                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${active ? 'border-gray-200 text-gray-600' : 'border-green-200 text-green-700'}`}
                              >{active ? 'Deshabilitar' : 'Habilitar'}</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <AdminPagination
                  page={getAdminPage('reviews', adminReviews).page}
                  total={adminReviews.length}
                  onChange={(page) => setAdminPage('reviews', page)}
                />
              </div>
            </div>
          )}

          </div>{/* end adminSectionKey fade wrapper */}
        </div>
      </div>
    </div>
  )
}

// ─── Admin Login Gate ──────────────────────────────────────────────────────────

// ─── Main App ─────────────────────────────────────────────────────────────────

const CART_STORAGE_KEY = 'bs-bike-store-cart'
const WISHLIST_STORAGE_KEY = 'bs-bike-store-wishlist'

function getSavedCart(): CartItem[] {
  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) throw new Error('El formato guardado no es una lista.')
    return parsed.filter((item): item is CartItem => {
      if (typeof item !== 'object' || item === null) return false
      const cartItem = item as Record<string, unknown>
      return Number.isSafeInteger(cartItem.id) && Number(cartItem.id) > 0
        && typeof cartItem.name === 'string'
        && typeof cartItem.price === 'number' && Number.isFinite(cartItem.price) && cartItem.price >= 0
        && typeof cartItem.priceLabel === 'string'
        && typeof cartItem.img === 'string'
        && Number.isSafeInteger(cartItem.qty) && Number(cartItem.qty) > 0
    })
  } catch (error) {
    console.warn('No fue posible leer el carrito guardado.', error)
    return []
  }
}

function saveCart(items: CartItem[]): void {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.warn('No fue posible guardar el carrito local.', error)
  }
}

function clearSavedCart(): void {
  try {
    window.localStorage.removeItem(CART_STORAGE_KEY)
  } catch (error) {
    console.warn('No fue posible limpiar el carrito local sincronizado.', error)
  }
}

function getSavedWishlist(): number[] {
  try {
    const saved = window.localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) throw new Error('El formato guardado no es una lista.')
    return [...new Set(parsed.filter((id): id is number => Number.isSafeInteger(id) && id > 0))]
  } catch (error) {
    console.warn('No fue posible leer la lista de deseos guardada.', error)
    return []
  }
}

function saveGuestWishlist(items: number[]): void {
  try {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.warn('No fue posible guardar la lista de deseos local.', error)
  }
}

function clearGuestWishlist(): void {
  try {
    window.localStorage.removeItem(WISHLIST_STORAGE_KEY)
  } catch (error) {
    console.warn('No fue posible limpiar la lista de deseos local sincronizada.', error)
  }
}

function normalizePriceFilter(value: string): string {
  if (!value) return ''
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return '0'
  return String(Math.round(amount / 10_000) * 10_000)
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeNavMenu, setActiveNavMenu] = useState<string | null>(null)
  const [pageTransition, setPageTransition] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>(getSavedCart)
  const [storeProducts, setStoreProducts] = useState<Product[]>(ALL_PRODUCTS)
  const [wishlist, setWishlist] = useState<number[]>(getSavedWishlist)
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [priceSort, setPriceSort] = useState<'relevancia' | 'menor' | 'mayor'>('relevancia')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [addedId, setAddedId] = useState<number | null>(null)
  const [cartToast, setCartToast] = useState('')
  const [selectedService, setSelectedService] = useState<(typeof SERVICES)[0] | null>(null)
  const [selectedPartCategory, setSelectedPartCategory] = useState<(typeof PART_CATEGORIES)[0] | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminLoginOpen, setAdminLoginOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [ordersModalOpen, setOrdersModalOpen] = useState(false)
  const [checkoutAfterAuth, setCheckoutAfterAuth] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [legalModal, setLegalModal] = useState<'terminos' | 'privacidad' | 'cookies' | null>(null)
  // The initial experience is always light; the theme control can opt in to dark mode.
  const [darkMode, setDarkMode] = useState(false)
  const [publicReviews, setPublicReviews] = useState<PublicReview[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const transitionTimeoutRef = useRef<number | null>(null)
  const cartToastTimeoutRef = useRef<number | null>(null)
  const wishlistRequestsRef = useRef(new Set<number>())
  const cartSyncReadyUserIdRef = useRef<number | null>(null)
  const cartSyncQueueRef = useRef<Promise<void>>(Promise.resolve())

  const refreshUserWishlist = async (user: AuthUser): Promise<void> => {
    const guestItems = getSavedWishlist()
    let guestSyncError: unknown = null
    if (guestItems.length > 0) {
      try {
        await Promise.all(guestItems.map((productId) =>
          apiRequest<{ productId: number; saved: boolean }>('/wishlist', {
            method: 'POST',
            body: { productId, action: 'add' },
          })
        ))
      } catch (error) {
        guestSyncError = error
        console.error('No fue posible sincronizar todos los favoritos de invitado.', error)
      }
    }

    const { items } = await apiRequest<{
      items: (Omit<Partial<Product>, 'img'> & {
        id: number
        name: string
        category: string
        price: number
        stock: number
        img: string | null
      })[]
    }>(`/wishlist/${user.id}`)
    const localById = new Map(ALL_PRODUCTS.map((product) => [product.id, product]))
    const products = items.map((item): Product => {
      const local = localById.get(item.id)
      return {
        ...local,
        ...item,
        price: Number(item.price),
        priceLabel: `$${Number(item.price).toLocaleString('es-CO')}`,
        img: item.img || local?.img || getBikeCategoryImage(item.category),
        description: item.description || local?.description || '',
        gallery: Array.isArray(item.gallery) ? item.gallery : local?.gallery ?? [],
        specs: Array.isArray(item.specs) ? item.specs : local?.specs ?? [],
        rating: Number(item.rating ?? local?.rating ?? 0),
        reviews: Number(item.reviews ?? local?.reviews ?? 0),
        badge: item.badge ?? local?.badge ?? null,
        darkBg: local?.darkBg,
      } as Product
    })
    setWishlistProducts(products)
    setWishlist([...new Set(products.map((product) => product.id))])
    if (guestItems.length > 0 && guestSyncError === null) clearGuestWishlist()
    if (guestSyncError !== null) {
      window.alert(guestSyncError instanceof Error ? guestSyncError.message : 'No fue posible sincronizar todos los favoritos guardados como invitado.')
    }
  }

  const restoreUserCart = async (user: AuthUser): Promise<void> => {
    if (user.role !== 'client') return
    const { items } = await apiRequest<{
      items: { id: number; name: string; category: string; price: number; img: string | null; qty: number }[]
    }>(`/cart/${user.id}`)
    const localById = new Map(ALL_PRODUCTS.map((product) => [product.id, product]))
    const merged = new Map<number, CartItem>()
    for (const item of items) {
      const local = localById.get(item.id)
      merged.set(item.id, {
        id: item.id,
        name: item.name,
        price: Number(item.price),
        priceLabel: `$${Number(item.price).toLocaleString('es-CO')}`,
        img: item.img || local?.img || getBikeCategoryImage(item.category),
        qty: Number(item.qty),
      })
    }
    for (const item of getSavedCart()) {
      const existing = merged.get(item.id)
      merged.set(item.id, {
        ...item,
        ...existing,
        qty: Math.min(20, item.qty + (existing?.qty ?? 0)),
      })
    }
    const cart = [...merged.values()]
    await apiRequest('/cart', {
      method: 'POST',
      body: { items: cart.map(({ id, qty }) => ({ productId: id, quantity: qty })) },
    })
    clearSavedCart()
    setCartItems(cart)
    cartSyncReadyUserIdRef.current = user.id
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    try {
      window.localStorage.setItem('bs-bike-store-theme', darkMode ? 'dark' : 'light')
    } catch (error) {
      console.warn('No fue posible guardar la preferencia de tema.', error)
    }
  }, [darkMode])

  useEffect(() => {
    if (currentUser?.role === 'client' && cartSyncReadyUserIdRef.current === currentUser.id) clearSavedCart()
    else if (cartSyncReadyUserIdRef.current === null) saveCart(cartItems)
  }, [cartItems, currentUser])

  useEffect(() => {
    if (currentUser?.role !== 'client' || cartSyncReadyUserIdRef.current !== currentUser.id) return
    const items = cartItems.map(({ id, qty }) => ({ productId: id, quantity: qty }))
    const timeout = window.setTimeout(() => {
      cartSyncQueueRef.current = cartSyncQueueRef.current
        .then(() => apiRequest('/cart', { method: 'POST', body: { items } }).then(() => undefined))
        .catch((error: unknown) => {
          window.alert(error instanceof Error ? error.message : 'No fue posible sincronizar el carrito de tu cuenta.')
        })
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [cartItems, currentUser])

  useEffect(() => {
    void apiRequest<{ items: (Partial<Product> & { id: number; price: number; stock: number; img: string | null })[] }>('/products?limit=100')
      .then(({ items }) => {
        if (!items.length) return
        const localById = new Map(ALL_PRODUCTS.map((product) => [product.id, product]))
        setStoreProducts(items.map((item) => {
          const local = localById.get(item.id)
          return {
            ...local,
            ...item,
            price: Number(item.price),
            img: item.img || local?.img || getBikeCategoryImage(item.category),
            priceLabel: `$${Number(item.price).toLocaleString('es-CO')}`,
            description: item.description || local?.description || '',
            gallery: item.gallery?.length ? item.gallery : local?.gallery ?? [],
            specs: item.specs?.length ? item.specs : local?.specs ?? [],
            rating: Number(item.rating ?? local?.rating ?? 0),
            reviews: Number(item.reviews ?? local?.reviews ?? 0),
            badge: item.badge ?? local?.badge ?? null,
            darkBg: local?.darkBg,
          } as Product
        }))
      })
      .catch((error: unknown) => console.warn('No fue posible cargar el catálogo desde el servidor; se muestra el catálogo local.', error))
  }, [adminOpen])

  useEffect(() => {
    void apiRequest<{ user: AuthUser }>('/auth/me')
      .then(async ({ user }) => {
        if (user.role === 'client') {
          try {
            await restoreUserCart(user)
          } catch (error) {
            console.warn('No fue posible cargar el carrito de tu cuenta.', error)
          }
        }
        setCurrentUser(user)
        void refreshUserWishlist(user).catch((error: unknown) => {
          console.warn('No fue posible cargar tu lista de deseos.', error)
        })
        if (user.role === 'admin' && getAdminSectionFromPath(window.location.pathname) !== 'dashboard') {
          setAdminOpen(true)
        }
      })
      .catch((error: unknown) => {
        if (getAdminSectionFromPath(window.location.pathname) !== 'dashboard') {
          setAdminLoginOpen(true)
          return
        }
        if (error instanceof Error && !error.message.includes('iniciar sesión')) {
          console.error('No fue posible restaurar la sesión de usuario.', error)
        }
      })
  }, [])

  useEffect(() => {
    void apiRequest<PublicReview[]>('/reviews?limit=100')
      .then(setPublicReviews)
      .catch((error: unknown) => console.warn('No fue posible cargar las reseñas.', error))
  }, [])

  useEffect(() => () => {
    if (transitionTimeoutRef.current !== null) window.clearTimeout(transitionTimeoutRef.current)
  }, [])

  useEffect(() => {
    if (!activeNavMenu) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setActiveNavMenu(null)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveNavMenu(null)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [activeNavMenu])

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)

  const filteredProducts = (() => {
    let list = activeCategory === 'Todas'
      ? storeProducts.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : storeProducts.filter(
          (p) =>
            p.category === activeCategory &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.category.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    const minPrice = Number(priceMin) || 0
    const maxPrice = Number(priceMax) || Number.POSITIVE_INFINITY
    list = list.filter((product) => {
      const price = Number(product.price)
      const matchPrecio = price >= minPrice && price <= maxPrice
      return Number.isFinite(price) && matchPrecio
    })
    if (priceSort === 'menor') list = [...list].sort((a, b) => a.price - b.price)
    else if (priceSort === 'mayor') list = [...list].sort((a, b) => b.price - a.price)
    return list
  })()

  const addToCart = (product: Pick<CartItem, 'id' | 'name' | 'price' | 'priceLabel' | 'img'>) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      return [...prev, { id: product.id, name: product.name, price: product.price, priceLabel: product.priceLabel, img: product.img, qty: 1 }]
    })
    playCartAddedSound()
    setAddedId(product.id)
    setCartToast(`${product.name} se añadió al carrito`)
    if (cartToastTimeoutRef.current !== null) window.clearTimeout(cartToastTimeoutRef.current)
    cartToastTimeoutRef.current = window.setTimeout(() => {
      setCartToast('')
      cartToastTimeoutRef.current = null
    }, 3000)
    setTimeout(() => setAddedId(null), 1500)
  }

  const handleAuthSuccess = async (user: AuthUser) => {
    if (user.role === 'client') {
      try {
        await restoreUserCart(user)
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'No fue posible sincronizar el carrito de tu cuenta.')
      }
    }
    setCurrentUser(user)
    setAuthModalOpen(false)
    void refreshUserWishlist(user).catch((error: unknown) => {
      window.alert(error instanceof Error ? error.message : 'No fue posible cargar tu lista de deseos.')
    })
    if (user.role === 'client' && checkoutAfterAuth) setCheckoutOpen(true)
    setCheckoutAfterAuth(false)
    if (user.role === 'admin') { setAdminLoginOpen(false); setAdminOpen(true) }
  }

  const handleAdminLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user)
    setAdminLoginOpen(false)
    setAdminOpen(true)
    void refreshUserWishlist(user).catch((error: unknown) => {
      window.alert(error instanceof Error ? error.message : 'No fue posible cargar tu lista de deseos.')
    })
  }

  const handleLogout = async () => {
    try {
      if (currentUser?.role === 'client' && cartSyncReadyUserIdRef.current === currentUser.id) {
        await cartSyncQueueRef.current
        await apiRequest('/cart', {
          method: 'POST',
          body: { items: cartItems.map(({ id, qty }) => ({ productId: id, quantity: qty })) },
        })
      }
      await apiRequest<void>('/auth/logout', { method: 'POST' })
      cartSyncReadyUserIdRef.current = null
      setCurrentUser(null)
      setCartItems([])
      setWishlist(getSavedWishlist())
      setWishlistProducts([])
      setUserMenuOpen(false)
      setAdminOpen(false)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible cerrar la sesión.')
    }
  }

  const changeQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
    }
  }

  const removeItem = (id: number) => setCartItems((prev) => prev.filter((i) => i.id !== id))

  const toggleWishlist = async (id: number) => {
    if (!currentUser) {
      setWishlist((previous) => {
        const next = previous.includes(id) ? previous.filter((itemId) => itemId !== id) : [...previous, id]
        saveGuestWishlist(next)
        return next
      })
      return
    }
    if (wishlistRequestsRef.current.has(id)) return

    wishlistRequestsRef.current.add(id)
    try {
      const { saved } = await apiRequest<{ productId: number; saved: boolean }>('/wishlist', {
        method: 'POST',
        body: { productId: id },
      })
      setWishlist((previous) => saved
        ? (previous.includes(id) ? previous : [...previous, id])
        : previous.filter((itemId) => itemId !== id))
      const product = storeProducts.find((item) => item.id === id)
      setWishlistProducts((previous) => saved
        ? (previous.some((item) => item.id === id) || !product ? previous : [...previous, product])
        : previous.filter((item) => item.id !== id))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar la lista de deseos.')
    } finally {
      wishlistRequestsRef.current.delete(id)
    }
  }

  const removeWishlistItem = async (id: number) => {
    if (!currentUser) {
      setWishlist((previous) => {
        const next = previous.filter((itemId) => itemId !== id)
        saveGuestWishlist(next)
        return next
      })
      return
    }
    if (wishlistRequestsRef.current.has(id)) return

    wishlistRequestsRef.current.add(id)
    try {
      await apiRequest<void>(`/wishlist/${currentUser.id}/${id}`, { method: 'DELETE' })
      setWishlist((previous) => previous.filter((itemId) => itemId !== id))
      setWishlistProducts((previous) => previous.filter((item) => item.id !== id))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible quitar el producto de la lista de deseos.')
    } finally {
      wishlistRequestsRef.current.delete(id)
    }
  }

  const runPrimaryTransition = (message: string, action: () => void) => {
    if (transitionTimeoutRef.current !== null) window.clearTimeout(transitionTimeoutRef.current)
    setPageTransition(message)
    transitionTimeoutRef.current = window.setTimeout(() => {
      action()
      setPageTransition(null)
      transitionTimeoutRef.current = null
    }, 260)
  }

  const followNavMenuLink = (link: NavMenuLink) => {
    if (link.category) setActiveCategory(link.category)
    scrollTo(link.section)
    setActiveNavMenu(null)
  }

  const scrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const handleSearchToggle = () => {
    setSearchOpen((v) => !v)
    setTimeout(() => searchRef.current?.focus(), 100)
  }

  return (
    <div className="app-shell min-h-screen dark:text-gray-100 transition-colors duration-200">
      {cartToast && (
        <div role="status" aria-live="polite" className="fixed right-4 top-4 z-[220] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl bg-[#0D5C3A] px-4 py-3 text-sm font-bold text-white shadow-2xl motion-safe:animate-[pulse_0.35s_ease-out_1]">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20" aria-hidden="true">✓</span>
          <span className="line-clamp-2">{cartToast}</span>
          <button type="button" onClick={() => setCartToast('')} aria-label="Cerrar notificación" className="rounded-full p-1 text-white/80 hover:bg-white/15 hover:text-white">×</button>
        </div>
      )}
      {/* ─── NAV ─────────────────────────────────────────────────────────── */}
      <header
        ref={headerRef}
        id="store-header"
        className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button onClick={() => scrollTo('hero')} className="flex-shrink-0 flex items-center">
              <BSLogo size={52} />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  aria-expanded={activeNavMenu === link.label}
                  aria-controls={activeNavMenu === link.label ? 'store-mega-menu' : undefined}
                  onClick={() => setActiveNavMenu((current) => current === link.label ? null : link.label)}
                  className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors tracking-wide ${
                    activeNavMenu === link.label ? 'text-[#0D5C3A]' : 'text-gray-700 hover:text-[#0D5C3A]'
                  }`}
                >
                  {link.label}
                  <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${activeNavMenu === link.label ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m3.5 6 4.5 4 4.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </nav>

            {/* Utility Icons */}
            <div className="site-header-actions flex items-center gap-1 sm:gap-2">
              {/* Search desktop */}
              <div className={`hidden md:flex items-center bg-gray-50 rounded-full px-3 py-1.5 gap-2 border transition-all duration-200 ${searchOpen ? 'border-[#0D5C3A] w-48' : 'border-gray-200 w-36'}`}>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); if (!searchOpen) setSearchOpen(true) }}
                  onFocus={() => { setSearchOpen(true); scrollTo('productos') }}
                  placeholder="Buscar..."
                  className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search mobile */}
              <button onClick={handleSearchToggle} aria-label="Buscar productos" className="md:hidden flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>

              {/* User / Auth */}
              {/* Admin shortcut — always visible */}
              {!currentUser && (
                <button
                  onClick={() => setAdminLoginOpen(true)}
                  title="Panel Administrador"
                  className="hidden sm:flex p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#0D5C3A]"
                />
              )}

              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="site-user-menu-button flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black ${currentUser.role === 'admin' ? 'bg-[#0D5C3A]' : 'bg-[#1A1A1A]'}`}>
                      {currentUser.name[0]}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[90px] truncate">{currentUser.name.split(' ')[0]}</span>
                    <svg className="hidden sm:block w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-56 z-20">
                        <div className="px-4 py-3 border-b border-gray-100 mb-1">
                          <p className="text-sm font-black text-[#1A1A1A]">{currentUser.name}</p>
                          <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                          <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${currentUser.role === 'admin' ? 'bg-[#0D5C3A]/10 text-[#0D5C3A]' : 'bg-gray-100 text-gray-500'}`}>
                            {currentUser.role === 'admin' ? '⚙️ Administrador' : '🛒 Cliente'}
                          </span>
                        </div>
                        {currentUser.role === 'client' && (
                          <button onClick={() => { setUserMenuOpen(false); setOrdersModalOpen(true) }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F4F4F5] transition-colors">
                            Mis pedidos
                          </button>
                        )}
                        {currentUser.role === 'admin' && (
                          <button onClick={() => { setUserMenuOpen(false); setAdminOpen(true) }} className="w-full text-left px-4 py-2.5 text-sm text-[#0D5C3A] font-semibold hover:bg-[#F4F4F5] transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                            Panel de administración
                          </button>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Cerrar sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  Ingresar
                </button>
              )}

              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(d => !d)}
                className="site-header-theme flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setWishlistOpen(true)}
                aria-label="Abrir favoritos"
                className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <svg
                  className={`w-5 h-5 transition-colors ${wishlist.length > 0 ? 'fill-[#0D5C3A] text-[#0D5C3A]' : 'text-gray-700'}`}
                  fill={wishlist.length > 0 ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#0D5C3A] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart — shopping cart icon with badge */}
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Abrir carrito"
                className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#0D5C3A] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuOpen}
                className="lg:hidden flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-100"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  {menuOpen ? <path d="M6 18 18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {activeNavMenu && NAV_MENU_CONTENT[activeNavMenu] && (
            <div
              id="store-mega-menu"
              className="store-mega-menu absolute left-4 right-4 top-full z-40 lg:left-0 lg:right-0"
            >
              <div className="store-mega-menu__surface grid gap-8 rounded-b-2xl border border-t-0 p-6 shadow-2xl lg:grid-cols-[1fr_1fr_0.9fr] lg:p-8">
                {NAV_MENU_CONTENT[activeNavMenu].columns.map((column, columnIndex) => (
                  <div className="store-mega-menu__column" style={{ animationDelay: `${columnIndex * 55}ms` }} key={column.heading}>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">{column.heading}</p>
                    <div className="grid gap-1">
                      {column.links.map((item, itemIndex) => (
                        <button
                          key={item.label}
                          type="button"
                          style={{ animationDelay: `${columnIndex * 55 + itemIndex * 35}ms` }}
                          onClick={() => followNavMenuLink(item)}
                          className="store-mega-menu__link rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:text-[#0D5C3A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C3A]"
                        >
                          {item.label}
                          <svg className="h-4 w-4 opacity-60" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="store-mega-menu__featured">
                  <p className="store-mega-menu__eyebrow mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{NAV_MENU_CONTENT[activeNavMenu].featured.eyebrow}</p>
                  <h3 className="mb-2 text-xl font-black text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>{NAV_MENU_CONTENT[activeNavMenu].featured.title}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-gray-600">{NAV_MENU_CONTENT[activeNavMenu].featured.description}</p>
                  <button
                    type="button"
                    onClick={() => followNavMenuLink(NAV_MENU_CONTENT[activeNavMenu].featured.link)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0D5C3A] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1A8A5A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C3A]"
                  >
                    {NAV_MENU_CONTENT[activeNavMenu].featured.link.label}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile search bar */}
          {searchOpen && (
            <div className="md:hidden pb-3 flex items-center gap-2 border-t border-gray-100 pt-3">
              <div className="flex-1 flex items-center bg-gray-50 rounded-full px-3 py-2 gap-2 border border-[#0D5C3A]">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); scrollTo('productos') }}
                  placeholder="Buscar bicicletas..."
                  className="bg-transparent text-sm outline-none flex-1 placeholder-gray-400"
                />
              </div>
              <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="text-sm text-gray-500">Cancelar</button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => { scrollTo(link.section); setMenuOpen(false) }}
                className="min-h-11 text-sm font-medium text-gray-700 hover:text-[#0D5C3A] text-left"
              >
                {link.label}
              </button>
            ))}
            <div className="border-t border-gray-100 pt-3">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0D5C3A] flex items-center justify-center text-white text-xs font-black">{currentUser.name[0]}</div>
                    <span className="text-sm font-semibold text-gray-700">{currentUser.name.split(' ')[0]}</span>
                  </div>
                  <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="text-xs text-red-500 font-bold">Cerrar sesión</button>
                </div>
              ) : (
                <button onClick={() => { setAuthModalOpen(true); setMenuOpen(false) }} className="w-full bg-[#0D5C3A] text-white font-bold py-2.5 rounded-full text-sm">
                  Iniciar sesión / Registrarse
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="store-hero relative overflow-hidden bg-[#0b1713] text-white">
        <div
          className="store-hero__image absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506316940527-4d1c138978a0?auto=format&fit=crop&w=2000&q=85)' }}
        />
        <div className="store-hero__overlay absolute inset-0" />
        <div className="store-hero__glow absolute -right-32 -top-32 h-96 w-96 rounded-full" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-40">
          <div className="store-hero__content max-w-2xl">
            <span className="store-hero__eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
              Diseñadas para ir más lejos
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight sm:leading-none mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Encuentra tu <br /><span className="store-hero__accent">ruta perfecta.</span>
            </h1>
            <p className="store-hero__description text-base sm:text-lg lg:text-xl leading-relaxed mb-8 sm:mb-10 max-w-xl">
              Explora nuestra colección de bicicletas de ruta, montaña y urbanas de alto rendimiento.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => runPrimaryTransition('Preparando el catálogo…', () => {
                  setActiveCategory('Todas')
                  scrollTo('productos')
                })}
                className="store-hero__cta min-h-12 bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-bold px-8 sm:px-10 py-4 rounded-full text-sm tracking-widest uppercase"
              >
                Ver Bicicletas
              </button>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="store-hero__stats relative border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Modelos disponibles', value: '200+' },
              { label: 'Clientes satisfechos', value: '12.000+' },
              { label: 'Años de experiencia', value: '15' },
              { label: 'Servicios al año', value: '5.000+' },
            ].map((s) => (
              <div key={s.label} className="store-hero__stat text-center">
                <div className="store-hero__stat-value text-2xl lg:text-3xl font-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.value}</div>
                <div className="store-hero__stat-label text-xs mt-1 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      <section id="productos" className="catalog-section py-12 sm:py-20 lg:py-28">
        <div className="catalog-section__content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[#0D5C3A] text-xs font-bold tracking-[0.2em] uppercase block mb-2">Selección Editorial</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Bicicletas Destacadas
              </h2>
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-500 hidden md:block">
                {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} para "{searchQuery}"
              </p>
            )}
          </div>

          {/* Category filter */}
          <div className="catalog-categories flex gap-2 flex-wrap mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`min-h-11 px-4 sm:px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-[#0D5C3A] text-white shadow-md'
                    : 'bg-[#F4F4F5] text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="catalog-sort ml-auto flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Ordenar por precio:</label>
              <select
                value={priceSort}
                onChange={e => setPriceSort(e.target.value as 'relevancia' | 'menor' | 'mayor')}
                className="border border-gray-200 rounded-full px-3 py-2 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#0D5C3A] transition-colors"
              >
                <option value="relevancia">Relevancia</option>
                <option value="menor">Menor precio</option>
                <option value="mayor">Mayor precio</option>
              </select>
            </div>
          </div>

          {/* Price range filter */}
          <div className="catalog-price-filters flex flex-wrap items-center gap-3 mb-6 bg-[#F4F4F5] rounded-2xl px-4 py-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rango de precio:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">De</span>
              <span className="price-range-input__currency" aria-hidden="true">$</span>
              <input
                type="number"
                min="0"
                step="10000"
                placeholder="380.000"
                aria-label="Precio mínimo en pesos colombianos"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                onBlur={e => setPriceMin(normalizePriceFilter(e.target.value))}
                className="price-range-input rounded-xl px-3 py-1.5 text-sm w-28 transition-colors duration-200"
              />
              <span className="text-xs text-gray-500">a</span>
              <span className="price-range-input__currency" aria-hidden="true">$</span>
              <input
                type="number"
                min="0"
                step="10000"
                placeholder="36.000.000"
                aria-label="Precio máximo en pesos colombianos"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                onBlur={e => setPriceMax(normalizePriceFilter(e.target.value))}
                className="price-range-input rounded-xl px-3 py-1.5 text-sm w-28 transition-colors duration-200"
              />
              <span className="text-xs text-gray-400">COP</span>
            </div>
            {(priceMin || priceMax || activeCategory !== 'Todas' || priceSort !== 'relevancia') && (
              <button
                onClick={() => { setPriceMin(''); setPriceMax(''); setActiveCategory('Todas'); setPriceSort('relevancia') }}
                className="ml-auto text-xs font-bold text-[#0D5C3A] hover:underline flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
                Limpiar filtros
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <p className="font-medium">No se encontraron bicicletas para "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="mt-3 text-[#0D5C3A] text-sm font-bold hover:underline">
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid min-w-0 grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((p) => (
                <div key={p.id} className="catalog-card group min-w-0 hover:-translate-y-1">
                  <div
                    className="catalog-card__media relative cursor-zoom-in"
                    onClick={() => setSelectedProduct(p)}
                  >
                    <img
                      src={p.img || getBikeCategoryImage(p.category)}
                      alt={p.name}
                      className={`catalog-card__image absolute inset-0 transition-transform duration-500 group-hover:scale-105 ${
                        ALL_PRODUCTS.some((catalogProduct) => catalogProduct.id === p.id) ? '' : 'catalog-card__image--managed'
                      }`}
                      loading="lazy"
                      decoding="async"
                      onError={(event) => handleImageFallback(event, getBikeImageFallback(p.category))}
                    />
                    <div className="absolute inset-0 bg-transparent transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-[#0D5C3A]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                        Ver detalles
                      </div>
                    </div>
                    {p.stock === 0 && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase z-10">
                        Agotado
                      </span>
                    )}
                    {p.stock > 0 && p.badge && (
                      <span className="absolute top-3 left-3 bg-[#0D5C3A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">
                        {p.badge}
                      </span>
                    )}
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <svg
                        className={`w-4 h-4 transition-colors ${wishlist.includes(p.id) ? 'fill-[#0D5C3A] text-[#0D5C3A]' : 'text-gray-400'}`}
                        fill={wishlist.includes(p.id) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  <div className="catalog-card__content">
                    <span className="catalog-card__eyebrow">{p.category}</span>
                    <h3 className="catalog-card__title">{p.name}</h3>
                    <p className="catalog-card__description line-clamp-2">{p.description}</p>
                    <div className="flex items-center gap-1.5 mb-2">
                      <StarRating rating={p.rating} />
                      <span className="text-[10px] text-gray-500">({p.reviews})</span>
                    </div>
                    <div className="catalog-card__purchase mt-auto flex items-center justify-between gap-2">
                      <span className="flex flex-col">
                        {p.offerDiscount && p.originalPrice && <span className="text-xs text-gray-400 line-through">${p.originalPrice.toLocaleString('es-CO')}</span>}
                        <span className="text-base font-black text-[#1A1A1A]">{p.priceLabel}</span>
                        {p.offerDiscount && <span className="text-[10px] font-bold text-emerald-700">Oferta -{p.offerDiscount}%</span>}
                      </span>
                      <button
                        onClick={() => p.stock > 0 && addToCart(p)}
                        disabled={p.stock === 0}
                        className={`catalog-card__add-button min-h-11 h-11 w-36 flex-none justify-center whitespace-nowrap text-white text-xs font-bold rounded-full transition-all duration-200 tracking-wide flex items-center gap-1.5 ${
                          p.stock === 0
                            ? 'bg-gray-300 opacity-60 cursor-not-allowed'
                            : addedId === p.id
                            ? 'bg-[#1A8A5A] scale-95'
                            : 'bg-[#0D5C3A] hover:bg-[#1A8A5A]'
                        }`}
                      >
                        {p.stock === 0 ? 'Sin stock' : addedId === p.id ? '✓ Agregado' : 'Agregar al carrito'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── PARTS & COMPONENTS ─────────────────────────────────────────── */}
      <section id="repuestos" className="py-12 sm:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-[#0D5C3A] text-xs font-bold tracking-[0.2em] uppercase block mb-3">Todo para tu bicicleta</span>
            <h2 className="text-4xl lg:text-5xl font-black text-[#1A1A1A] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Repuestos y Partes
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Encuentra componentes confiables para mantenimiento, reparación y mejoras. Te ayudamos a elegir la pieza compatible con tu bicicleta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PART_CATEGORIES.map((part) => (
              <button
                key={part.title}
                onClick={() => setSelectedPartCategory(part)}
                className="catalog-card parts-category-card group text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D5C3A] focus-visible:outline-offset-2"
              >
                <div className="parts-card__media">
                  <img
                    src={part.img}
                    alt={part.title}
                    className="catalog-card__image parts-card__image group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => handleImageFallback(event, getPartImageFallback(part.title))}
                  />
                </div>
                <div className="catalog-card__content">
              <span className="catalog-card__eyebrow">
                    Disponible en tienda
                  </span>
              <h3 className="catalog-card__title">
                    {part.title}
                  </h3>
              <p className="catalog-card__description">{part.desc}</p>
              <span className="catalog-card__link">
                    Ver repuestos y precios
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-[#0D5C3A] px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-black text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                ¿No sabes cuál repuesto necesitas?
              </h3>
              <p className="text-green-100 text-sm mt-1">Nuestro equipo revisa la compatibilidad antes de tu compra.</p>
            </div>
            <button
              onClick={() => runPrimaryTransition('Conectando con un asesor…', () => window.dispatchEvent(new Event(OPEN_CHAT_EVENT)))}
              className="bg-white text-[#0D5C3A] font-black px-6 py-3 rounded-full hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
            >
              Solicitar asesoría
            </button>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ────────────────────────────────────────────────────── */}
      <section id="servicios" className="service-section py-20 lg:py-28 bg-[#1A1A1A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="service-section__accent text-[#1A8A5A] text-xs font-bold tracking-[0.2em] uppercase block mb-3">Nuestro Taller</span>
            <h2 className="text-4xl lg:text-5xl font-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Servicios de Taller<br className="hidden lg:block" /> y Mantenimiento
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s) => (
              <button
                key={s.title}
                onClick={() => runPrimaryTransition('Abriendo agenda de servicio…', () => setSelectedService(s))}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-[#0D5C3A] hover:bg-[#0D5C3A]/10 transition-all duration-300 group text-left"
              >
                <div className="service-section__accent mb-5 group-hover:text-white transition-colors">{s.icon}</div>
                <h3 className="service-section__title font-black text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.title}</h3>
                <p className="service-section__description text-gray-400 text-sm leading-relaxed mb-4">{s.desc}</p>
                <span className="service-section__accent font-black text-lg">{s.price}</span>
                {s.title !== 'Envío Express' && (
                  <div className="service-section__accent mt-4 flex items-center gap-1.5 text-xs font-semibold">
                    Agendar cita
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-12 bg-[#0D5C3A] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-black text-2xl mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>¿Tu bici necesita atención?</h3>
              <p className="text-green-200 text-sm">Agenda tu cita en minutos. Atención de lunes a sábado.</p>
            </div>
            <button
              onClick={() => runPrimaryTransition('Preparando tu agenda…', () => setSelectedService(SERVICES[0]))}
              className="bg-white text-[#0D5C3A] font-black px-8 py-3.5 rounded-full hover:bg-gray-100 transition-colors text-sm tracking-wide uppercase whitespace-nowrap"
            >
              Agendar Servicio
            </button>
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ─────────────────────────────────────────────────────── */}
      <section id="resenas" className="py-20 lg:py-28 bg-[#F4F4F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#0D5C3A] text-xs font-bold tracking-[0.2em] uppercase block mb-3">Opiniones</span>
            <h2 className="text-4xl lg:text-5xl font-black text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Reseñas de Clientes</h2>
            <p className="text-gray-500 mt-3 text-sm">Lo que dicen nuestros ciclistas sobre sus bicicletas</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicReviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-[#0D5C3A] text-[#0D5C3A]' : 'fill-gray-200 text-gray-200'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic">"{r.comment}"</p>
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <p className="font-black text-[#1A1A1A] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{r.author}</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('es-CO')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-[#0D5C3A] bg-[#0D5C3A]/10 px-3 py-1 rounded-full">{r.productName}</span>
                    {r.verifiedPurchase && <span className="text-[10px] font-bold text-emerald-700">Compra verificada</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!publicReviews.length && <p className="text-center text-gray-500 text-sm mt-8">Aún no hay reseñas aprobadas.</p>}
          <ReviewForm
            products={storeProducts}
            user={currentUser}
            onRequestLogin={() => setAuthModalOpen(true)}
            onSubmit={async (review) => {
              await apiRequest('/reviews', { method: 'POST', body: review })
            }}
          />
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="site-footer bg-[#1A1A1A] text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3"><BSLogo size={64} dark withBackground={false} /></div>
              <p className="text-sm leading-relaxed text-gray-500">Tu tienda de bicicletas de confianza. Equipos de alto rendimiento para cada tipo de ruta.</p>
            </div>

            {[
              { title: 'Explorar', links: ['Bicicletas de Ruta', 'Bicicletas de Montaña', 'Urbanas', 'Accesorios'] },
              { title: 'Servicios', links: ['Mantenimiento', 'Ensamble', 'Reparaciones', 'Asesoría', 'Envíos'] },
              { title: 'Soporte', links: ['Centro de Ayuda', 'Devoluciones', 'Garantía', 'Contacto', 'Tiendas'] },
              { title: 'Empresa', links: ['Nosotros', 'Trabaja con nosotros', 'Blog', 'Prensa'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-black text-sm mb-4 tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <button
                        onClick={() => scrollTo(col.title === 'Explorar' || col.title === 'Servicios' ? 'productos' : 'resenas')}
                        className="site-footer__link text-sm hover:text-[#1A8A5A] transition-colors text-left"
                      >
                        {l}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="site-footer__legal border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <p>© 2026 BS Bike Store. Todos los derechos reservados.</p>
            <div className="flex gap-6 items-center">
              <button onClick={() => setLegalModal('terminos')} className="site-footer__link hover:text-[#1A8A5A] transition-colors">Términos y Condiciones</button>
              <button onClick={() => setLegalModal('privacidad')} className="site-footer__link hover:text-[#1A8A5A] transition-colors">Política de Privacidad</button>
              <button onClick={() => setLegalModal('cookies')} className="site-footer__link hover:text-[#1A8A5A] transition-colors">Cookies</button>
              <button
                onClick={() => setAdminLoginOpen(true)}
                className="site-footer__link flex items-center gap-1.5 hover:text-[#1A8A5A] transition-colors border border-white/10 hover:border-[#1A8A5A]/40 rounded-lg px-3 py-1.5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Admin
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── MODALS & DRAWERS ────────────────────────────────────────────── */}
      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlist={wishlist}
        products={currentUser ? wishlistProducts : storeProducts}
        onRemoveWishlist={removeWishlistItem}
        onAddToCart={(p) => { addToCart(p); setWishlistOpen(false); }}
      />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onQtyChange={changeQty}
        onRemove={removeItem}
        onCheckout={() => {
          if (!currentUser || currentUser.role !== 'client') {
            setCheckoutAfterAuth(true)
            setAuthModalOpen(true)
          }
          else { setCheckoutOpen(true) }
        }}
      />
      <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      <PartsModal
        key={selectedPartCategory?.title ?? 'closed'}
        category={selectedPartCategory}
        onClose={() => setSelectedPartCategory(null)}
        onAddToCart={addToCart}
      />
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p) => { addToCart(p); }}
        onToggleWishlist={toggleWishlist}
        inWishlist={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
      />

      {authModalOpen && (
        <AuthModal
          onClose={() => {
            setAuthModalOpen(false)
            setCheckoutAfterAuth(false)
          }}
          onLogin={handleAuthSuccess}
          onOpenLegal={setLegalModal}
        />
      )}
      {ordersModalOpen && currentUser && <MyOrdersModal onClose={() => setOrdersModalOpen(false)} />}
      {adminLoginOpen && !adminOpen && (
        <AdminLoginPage
          onSuccess={handleAdminLoginSuccess}
          onBack={() => setAdminLoginOpen(false)}
        />
      )}
      {adminOpen && currentUser?.role === 'admin' && (
        <AdminPanel
          onClose={() => setAdminOpen(false)}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode((enabled) => !enabled)}
        />
      )}

      {checkoutOpen && currentUser && currentUser.role === 'client' && (
        <CheckoutModal
          items={cartItems}
          user={currentUser}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={(order) => {
            setCheckoutOpen(false)
            setCartItems([])
            setStoreProducts((products) => products.map((product) => {
              const line = order.items.find((item) => item.productId === product.id)
              return line ? { ...product, stock: Math.max(0, product.stock - line.quantity) } : product
            }))
          }}
        />
      )}

      {legalModal === 'terminos' && <TerminosModal onClose={() => setLegalModal(null)} />}
      {legalModal === 'privacidad' && <PrivacidadModal onClose={() => setLegalModal(null)} />}
      {legalModal === 'cookies' && <CookiesModal onClose={() => setLegalModal(null)} />}
      {!adminOpen && !adminLoginOpen && <FloatingChatWidget user={currentUser} />}
      {pageTransition && (
        <div className="store-transition-screen fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-[2px]" role="status" aria-live="polite">
          <div className="store-transition-screen__card flex min-w-64 flex-col items-center rounded-2xl border px-8 py-7 text-center shadow-2xl">
            <span className="store-transition-screen__spinner mb-4 h-10 w-10 rounded-full border-[3px] border-emerald-100 border-t-emerald-700" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-700">{pageTransition}</span>
          </div>
        </div>
      )}
    </div>
  )
}
