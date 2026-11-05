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
import cockpitHandlebarImg from './assets/parts/cockpit/product-1.png'
import cockpitStemImg from './assets/parts/cockpit/product-2.png'
import cockpitGripsImg from './assets/parts/cockpit/product-3.png'
import cockpitSaddleImg from './assets/parts/cockpit/product-4.png'
import { WHEEL_PHOTOS } from './parts-images'
import { apiRequest, AUTH_TOKEN_KEY } from './api'
import { downloadXlsx } from './xlsx'

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

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Bicicletas', section: 'productos' },
  { label: 'Repuestos y Partes', section: 'repuestos' },
  { label: 'Taller y Servicios', section: 'servicios' },
  { label: 'Reseñas', section: 'resenas' },
]

const REVIEWS = [
  { name: 'Carlos Andrés Ospina', date: 'Agosto 2026', rating: 5, bike: 'GW Hawk MTB 29 12V', comment: 'Increíble bicicleta. La compré para el cerro El Ávila y superó todas mis expectativas. La suspensión absorbe todo y la transmisión es muy precisa. El equipo de BS me asesoró muy bien desde el principio.' },
  { name: 'Valentina Ríos Herrera', date: 'Julio 2026', rating: 5, bike: 'GW Gavia 700C', comment: 'La Gavia es una bicicleta liviana, rígida y rápida. La recomiendo 100% para ciclovía y entrenamientos en carretera. El servicio posventa de BS es excelente.' },
  { name: 'Sebastián Gómez Jaramillo', date: 'Septiembre 2026', rating: 5, bike: 'Starker Sport 2.0 Pro', comment: 'Me cambió la vida. Puedo subir el Alto de Patios sin morir en el intento. La bicicleta eléctrica es perfecta para quienes queremos disfrutar sin sufrir. ¡Gracias BS Bike Store!' },
  { name: 'Marcela Torres Agudelo', date: 'Agosto 2026', rating: 4, bike: 'GW Dancer 12', comment: 'Compré la Dancer para mi hija de 3 años y le encantó. Llegó bien embalada y el ensamble fue sencillo. La calidad es superior a otras marcas que probé.' },
  { name: 'Jhon Alexander Peña', date: 'Julio 2026', rating: 5, bike: 'Jeep Baltoro 29', comment: 'Para los que hacemos descenso en La Cuchilla, esta Baltoro es una bestia. El soporte de BS fue impecable, me explicaron cada componente antes de comprar. Sin duda la mejor inversión.' },
  { name: 'Diana Milena Castillo', date: 'Septiembre 2026', rating: 4, bike: 'Starker T-Flex Pro', comment: 'La uso para ir al trabajo todos los días en Bogotá. La batería me permite llegar sin problema desde Suba hasta Chapinero. Muy satisfecha con la compra y el equipo de BS.' },
]

interface Product {
  id: number
  name: string
  category: string
  price: number
  priceLabel: string
  rating: number
  reviews: number
  img: string
  badge: string | null
  gallery: string[]
  specs: { label: string; value: string }[]
  description: string
  stock: number
  darkBg?: boolean
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
    id: 7, name: 'Scott Strike eRIDE 930', category: 'Eléctrica',
    price: 5900000, priceLabel: '$5.900.000', rating: 4.9, reviews: 143, badge: 'Más Vendido',
    img: electricSportImg, stock: 5,
    gallery: gal(electricSportImg, EMTB, 0),
    description: 'La Starker Sport 2.0 Pro es una bicicleta eléctrica versátil de la marca colombiana. Su motor, batería extraíble y suspensión delantera ofrecen potencia y autonomía para moverse dentro y fuera de la ciudad.',
    specs: [
      { label: 'Marca', value: 'STARKER' }, { label: 'Modelo', value: 'SPORT 2.0 PRO' },
      { label: 'Motor', value: '350W central' }, { label: 'Batería', value: '500Wh' },
      { label: 'Autonomía', value: 'Hasta 80 km' }, { label: 'Velocidades', value: '21 velocidades' },
      { label: 'Rin', value: '27.5"' }, { label: 'Suspensión', value: 'Delantera 100mm' },
    ],
  },
  {
    id: 8, name: 'EVOBIKE ÁGUILA PRO', category: 'Eléctrica',
    price: 4800000, priceLabel: '$4.800.000', rating: 4.8, reviews: 89, badge: 'Nuevo',
    img: electricAguilaImg, stock: 4,
    gallery: gal(electricAguilaImg, EMTB, 1),
    description: 'La Evobike Águila Pro es la bicicleta eléctrica urbana más elegante de la marca. Motor trasero de 250W con batería de 36V extraíble, perfecta para desplazamientos diarios con asistencia eficiente y diseño moderno.',
    specs: [
      { label: 'Marca', value: 'EVOBIKE' }, { label: 'Modelo', value: 'ÁGUILA PRO' },
      { label: 'Motor', value: '250W trasero' }, { label: 'Batería', value: '36V 10Ah extraíble' },
      { label: 'Autonomía', value: 'Hasta 60 km' }, { label: 'Velocidades', value: '7 velocidades Shimano' },
      { label: 'Rin', value: '700c' }, { label: 'Frenos', value: 'Disco hidráulico' },
    ],
  },
  {
    id: 9, name: 'EVOBIKE SOL', category: 'Eléctrica',
    price: 5200000, priceLabel: '$5.200.000', rating: 4.8, reviews: 62, badge: null,
    img: electricSolImg, stock: 7,
    gallery: gal(electricSolImg, EMTB, 2),
    description: 'La Evobike Sol combina potencia y autonomía en una bicicleta eléctrica completa para toda la familia. Con motor de 350W y batería de 48V, ofrece una conducción asistida suave y progresiva.',
    specs: [
      { label: 'Marca', value: 'EVOBIKE' }, { label: 'Modelo', value: 'SOL' },
      { label: 'Motor', value: '350W central' }, { label: 'Batería', value: '48V 13Ah' },
      { label: 'Autonomía', value: 'Hasta 90 km' }, { label: 'Velocidades', value: '21 velocidades' },
      { label: 'Rin', value: '27.5"' }, { label: 'Pantalla', value: 'LCD multifunción' },
    ],
  },
  {
    id: 10, name: 'GW E-MAX 800W', category: 'Eléctrica',
    price: 6500000, priceLabel: '$6.500.000', rating: 4.9, reviews: 55, badge: 'Premium',
    img: electricEMaxImg, stock: 3,
    gallery: gal(electricEMaxImg, EMTB, 3),
    description: 'La GW E-Max 800W es una bicicleta eléctrica diseñada para quienes buscan potencia y comodidad. Su batería de alta densidad y sus acabados modernos brindan una experiencia sobresaliente en ciudad y carretera.',
    specs: [
      { label: 'Marca', value: 'GW' }, { label: 'Modelo', value: 'E-MAX 800W' },
      { label: 'Motor', value: '500W trasero' }, { label: 'Batería', value: '48V 15Ah' },
      { label: 'Autonomía', value: 'Hasta 100 km' }, { label: 'Velocidades', value: '7 velocidades' },
      { label: 'Rin', value: '700c' }, { label: 'Extras', value: 'Luz LED + guardabarros' },
    ],
  },
  {
    id: 20, name: 'STARKER T-FLEX PRO', category: 'Eléctrica',
    price: 4200000, priceLabel: '$4.200.000', rating: 4.7, reviews: 48, badge: null,
    img: electricTFlexImg, stock: 6,
    gallery: gal(electricTFlexImg, EMTB, 3),
    description: 'La Starker T-Flex Pro es una bicicleta eléctrica plegable de la reconocida marca colombiana. Es perfecta para la movilidad diaria gracias a su motor eficiente, batería desmontable y diseño compacto para la ciudad.',
    specs: [
      { label: 'Marca', value: 'STARKER' }, { label: 'Modelo', value: 'T-FLEX PRO' },
      { label: 'Motor', value: '250W trasero' }, { label: 'Batería', value: '36V 8Ah' },
      { label: 'Autonomía', value: 'Hasta 50 km' }, { label: 'Velocidades', value: '7 velocidades' },
      { label: 'Rin', value: '700c' }, { label: 'Frenos', value: 'Disco mecánico' },
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
    id: 11, name: 'Specialized S-Works Epic', category: 'Ruta',
    price: 3490000, priceLabel: '$3.490.000', rating: 5.0, reviews: 76, badge: 'Pro Tour',
    img: roadGaviaImg, stock: 3,
    gallery: gal(roadGaviaImg, ROAD, 0),
    description: 'La GW Gavia es la bicicleta de ruta bandera de la marca GW. Marco de aluminio aeronáutico, componentes Shimano 105 y ruedas de carbono para competir al más alto nivel. Una máquina diseñada para rodar rápido y cómodo en las carreteras colombianas.',
    specs: [
      { label: 'Marca', value: 'GW' }, { label: 'Modelo', value: 'GAVIA 700C' },
      { label: 'Marco', value: 'Aluminio aeronáutico' }, { label: 'Velocidades', value: '22 velocidades Shimano 105' },
      { label: 'Rin', value: '700c' }, { label: 'Frenos', value: 'Disco hidráulico' },
      { label: 'Peso', value: '8.4 kg' }, { label: 'Garantía', value: '1 año' },
    ],
  },
  {
    id: 12, name: 'Specialized S-Works Epic', category: 'Ruta',
    price: 2890000, priceLabel: '$2.890.000', rating: 4.9, reviews: 94, badge: 'Más Vendido',
    img: roadFlammaImg, stock: 5,
    gallery: gal(roadFlammaImg, ROAD, 2),
    description: 'La GW Flamma es una bicicleta de ruta ágil y veloz para ciclistas exigentes. Con geometría deportiva, manubrio drop, transmisión de 16 velocidades y frenos de disco para afrontar tanto rutas llanas como subidas empinadas.',
    specs: [
      { label: 'Marca', value: 'GW' }, { label: 'Modelo', value: 'FLAMMA DISCO 700C' },
      { label: 'Marco', value: 'Aluminio 7005' }, { label: 'Velocidades', value: '16 velocidades Shimano Claris' },
      { label: 'Rin', value: '700c' }, { label: 'Frenos', value: 'Disco mecánico' },
      { label: 'Peso', value: '9.1 kg' }, { label: 'Garantía', value: '1 año' },
    ],
  },
  {
    id: 22, name: 'Specialized S-Works', category: 'Ruta',
    price: 4100000, priceLabel: '$4.100.000', rating: 5.0, reviews: 41, badge: 'Top de Gama',
    img: roadMortiroloImg, stock: 2,
    gallery: gal(roadMortiroloImg, ROAD, 4),
    description: 'La GW Mortirolo 700C toma su nombre de uno de los ascensos más exigentes del ciclismo. Su marco liviano y sus componentes de alto desempeño están pensados para quienes buscan velocidad en carretera.',
    specs: [
      { label: 'Marca', value: 'GW' }, { label: 'Modelo', value: 'MORTIROLO 700C' },
      { label: 'Marco', value: 'Carbono T700' }, { label: 'Transmisión', value: 'Shimano Ultegra Di2 12v' },
      { label: 'Rin', value: '700c' }, { label: 'Frenos', value: 'Disco hidráulico integrado' },
      { label: 'Peso', value: '7.6 kg' }, { label: 'Garantía', value: '2 años' },
    ],
  },
  {
    id: 23, name: 'Specialized S-Works Epic', category: 'Ruta',
    price: 2450000, priceLabel: '$2.450.000', rating: 4.8, reviews: 63, badge: null,
    img: roadK2Img, stock: 7,
    gallery: gal(roadK2Img, ROAD, 3),
    description: 'La GW K2 es la bicicleta de ruta perfecta para ciclovías y rutas largas del fin de semana. Cómoda, eficiente y de fácil mantenimiento, con cuadro de aluminio y componentes de calidad para rodar kilómetros sin fatiga.',
    specs: [
      { label: 'Marca', value: 'GW' }, { label: 'Modelo', value: 'K2 700C' },
      { label: 'Marco', value: 'Aluminio 6061' }, { label: 'Velocidades', value: '21 velocidades Shimano' },
      { label: 'Rin', value: '700c' }, { label: 'Frenos', value: 'V-Brake' },
      { label: 'Peso', value: '9.8 kg' }, { label: 'Garantía', value: '1 año' },
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

const WHITE_GRID_IMAGE_PRODUCT_IDS = new Set([1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 15, 16, 22])

const CATEGORIES = ['Todas', 'Todo Terreno', 'Eléctrica', 'Ruta', 'Infantil']

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
    img: 'https://images.unsplash.com/photo-1671179517648-0e4e6ddd3ea7?auto=format&fit=crop&w=900&q=85',
    products: [
      { name: 'Llanta Chaoyang MTB 29 x 2.10', price: '$89.900', img: 'https://images.unsplash.com/photo-1684072460085-5b51541d122b?auto=format&fit=crop&w=500&q=85' },
      { name: 'Rin de aluminio doble pared 29', price: '$149.900', img: 'https://images.unsplash.com/photo-1756967587801-63704d039cbd?auto=format&fit=crop&w=500&q=85' },
      { name: 'Cámara 29 válvula presta', price: '$24.900', img: 'https://images.unsplash.com/photo-1564680955772-254d76db8aaf?auto=format&fit=crop&w=500&q=85' },
      { name: 'Kit tubeless para dos ruedas', price: '$79.900', img: 'https://images.unsplash.com/photo-1671790673593-194e2164128b?auto=format&fit=crop&w=500&q=85' },
    ],
  },
  {
    title: 'Transmisión',
    desc: 'Cadenas, cassettes, platos, bielas y desviadores.',
    img: 'https://images.unsplash.com/photo-1517263975512-e1e9172f466b?auto=format&fit=crop&w=900&q=85',
    products: [
      { name: 'Cadena Shimano Deore 12 velocidades', price: '$189.900', img: 'https://images.unsplash.com/photo-1517263975512-e1e9172f466b?auto=format&fit=crop&w=500&q=85' },
      { name: 'Cassette Shimano 11–51T 11 velocidades', price: '$329.900', img: 'https://images.unsplash.com/photo-1625242825294-dcc908480fae?auto=format&fit=crop&w=500&q=85' },
      { name: 'Desviador Shimano Altus 9 velocidades', price: '$159.900', img: 'https://images.unsplash.com/photo-1687640977275-3bd12cb1ddce?auto=format&fit=crop&w=500&q=85' },
      { name: 'Plato monoplato 32T narrow-wide', price: '$99.900', img: 'https://images.unsplash.com/photo-1661453444174-105f3bfebca7?auto=format&fit=crop&w=500&q=85' },
    ],
  },
  {
    title: 'Frenos',
    desc: 'Pastillas, discos, mordazas y sistemas hidráulicos.',
    img: 'https://images.unsplash.com/photo-1637289031879-dc6acc591e3f?auto=format&fit=crop&w=900&q=85',
    products: [
      { name: 'Pastillas de resina Shimano B05S', price: '$49.900', img: 'https://images.unsplash.com/photo-1637289031879-dc6acc591e3f?auto=format&fit=crop&w=500&q=85' },
      { name: 'Disco de freno 180 mm', price: '$79.900', img: 'https://images.unsplash.com/photo-1639745159169-db1d3c0cfe78?auto=format&fit=crop&w=500&q=85' },
      { name: 'Frenos hidráulicos Shimano MT200', price: '$349.900', img: 'https://images.unsplash.com/photo-1649498936735-27af90c73259?auto=format&fit=crop&w=500&q=85' },
      { name: 'Líquido mineral para frenos 100 ml', price: '$39.900', img: 'https://images.unsplash.com/photo-1617307327024-14c0a02125fd?auto=format&fit=crop&w=500&q=85' },
    ],
  },
  {
    title: 'Suspensión',
    desc: 'Horquillas, amortiguadores, retenes y repuestos.',
    img: 'https://images.unsplash.com/photo-1570539589648-51a594f1676d?auto=format&fit=crop&w=900&q=85',
    products: [
      { name: 'Horquilla Suntour XCM para rin 29', price: '$649.900', img: 'https://images.unsplash.com/photo-1727281623511-e85c1c34d151?auto=format&fit=crop&w=500&q=85' },
      { name: 'Amortiguador RockShox Deluxe', price: '$1.249.900', img: 'https://images.unsplash.com/photo-1636925281365-f82e35b7e1c7?auto=format&fit=crop&w=500&q=85' },
      { name: 'Kit de retenes para barras de 32 mm', price: '$89.900', img: 'https://images.unsplash.com/photo-1638194216708-fb57a1bf7cf7?auto=format&fit=crop&w=500&q=85' },
      { name: 'Control de bloqueo remoto', price: '$129.900', img: 'https://images.unsplash.com/photo-1614675498441-693649a7df6d?auto=format&fit=crop&w=500&q=85' },
    ],
  },
  {
    title: 'Sillines y Cockpit',
    desc: 'Sillines, manubrios, potencias y puños para mejorar el control y la comodidad.',
    img: cockpitSaddleImg,
    products: [
      { name: 'Manubrio MTB de aluminio 31.8 mm', price: '$119.900', img: cockpitHandlebarImg },
      { name: 'Potencia MTB corta 31.8 mm', price: '$89.900', img: cockpitStemImg },
      { name: 'Puños ergonómicos con bloqueo', price: '$54.900', img: cockpitGripsImg },
      { name: 'Sillín GW deportivo 270 mm', price: '$109.900', img: cockpitSaddleImg },
    ],
  },
  {
    title: 'Componentes Eléctricos',
    desc: 'Baterías, motores, controladores y kits de conversión.',
    img: 'https://images.unsplash.com/photo-1763041821558-13fb6264be3f?auto=format&fit=crop&w=900&q=85',
    products: [
      { name: 'Batería de litio 48V 13Ah', price: '$1.699.900', img: 'https://images.unsplash.com/photo-1669183013484-88ecafacc5f3?auto=format&fit=crop&w=500&q=85' },
      { name: 'Controlador para motor 48V', price: '$289.900', img: 'https://images.unsplash.com/photo-1700705581209-0c207be805ed?auto=format&fit=crop&w=500&q=85' },
      { name: 'Pantalla LCD multifunción', price: '$349.900', img: 'https://images.unsplash.com/photo-1700792746333-0402b7893b55?auto=format&fit=crop&w=500&q=85' },
      { name: 'Cargador inteligente 48V 2A', price: '$179.900', img: 'https://images.unsplash.com/photo-1763041821558-13fb6264be3f?auto=format&fit=crop&w=500&q=85' },
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
  img: WHEEL_PHOTOS[kindIndex][variantIndex].img,
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
    if (product) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [product])

  if (!product) return null

  const handleAdd = () => {
    onAddToCart(product)
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 1800)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl modal-animate">
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
                  src={product.gallery[activeImg]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain p-4 transition-all duration-300 img-product"
                />
              </div>
              {product.gallery.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {product.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`rounded-lg overflow-hidden h-14 border-2 transition-all duration-200 ${
                        activeImg === i ? 'border-[#0D5C3A] scale-105 shadow-md' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Vista ${i + 1} de ${product.name}`} className="w-full h-full object-contain bg-white img-thumb" />
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
                  {product.specs.map((s) => (
                    <div key={s.label} className="flex flex-wrap items-baseline gap-x-1 min-w-0">
                      <span className="text-[9px] font-bold text-[#0D5C3A] uppercase tracking-wider shrink-0">{s.label}:</span>
                      <span className="text-[11px] font-semibold text-[#1A1A1A] break-words" style={{ overflowWrap: 'anywhere' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price + actions */}
              <div className="mt-auto">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-black text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {product.priceLabel}
                  </span>
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

function ReviewForm({ onSubmit }: { onSubmit: (r: { name: string; date: string; rating: number; bike: string; comment: string }) => void }) {
  const [reviewName, setReviewName] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewBike, setReviewBike] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewName.trim() || !reviewComment.trim()) { setReviewError('Por favor completa tu nombre y comentario.'); return }
    if (reviewRating === 0) { setReviewError('Selecciona una calificación de estrellas.'); return }
    const now = new Date()
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    onSubmit({ name: reviewName.trim(), date: `${months[now.getMonth()]} ${now.getFullYear()}`, rating: reviewRating, bike: reviewBike.trim() || 'Bicicleta BS', comment: reviewComment.trim() })
    setReviewSubmitted(true)
  }

  if (reviewSubmitted) {
    return (
      <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-[#0D5C3A]/20 text-center">
        <div className="w-14 h-14 bg-[#0D5C3A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#0D5C3A]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <p className="font-black text-[#1A1A1A] text-xl mb-1" style={{fontFamily:'Montserrat, sans-serif'}}>¡Gracias por tu reseña!</p>
        <p className="text-gray-500 text-sm">Tu opinión ya aparece en nuestra sección de reseñas.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-black text-[#1A1A1A] mb-1" style={{fontFamily:'Montserrat, sans-serif'}}>¿Tienes una bicicleta de BS?</h3>
      <p className="text-gray-500 text-sm mb-6">Comparte tu experiencia con otros ciclistas</p>
      <div className="space-y-5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tu nombre *</label>
            <input value={reviewName} onChange={e=>setReviewName(e.target.value)} placeholder="Ej: Carlos Andrés Ospina" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Modelo de bicicleta</label>
            <input value={reviewBike} onChange={e=>setReviewBike(e.target.value)} placeholder="Ej: GW Hawk MTB 29 12V" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tu comentario *</label>
          <textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="Cuéntanos tu experiencia con tu bicicleta BS..." rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all resize-none" />
        </div>
        {reviewError && <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">{reviewError}</p>}
        <button type="submit" className="bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-black px-8 py-3.5 rounded-full text-sm tracking-wide transition-colors">
          Enviar reseña
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
  onToggleWishlist,
  onAddToCart,
}: {
  open: boolean
  onClose: () => void
  wishlist: number[]
  onToggleWishlist: (id: number) => void
  onAddToCart: (p: Product) => void
}) {
  const products = ALL_PRODUCTS.filter(p => wishlist.includes(p.id))

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
          {products.length === 0 ? (
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
            products.map((p) => (
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
                      onClick={() => onToggleWishlist(p.id)}
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
  const isCockpitCategory = category.title === 'Sillines y Cockpit'
  const products = isWheelCategory && selectedWheelType !== null
    ? WHEEL_VARIANTS[selectedWheelType]
    : category.products

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
          <div className="relative h-48 flex-shrink-0">
            <img src={category.img} alt={category.title} className="w-full h-full object-cover img-hero" />
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

          <div ref={contentRef} className="overflow-y-auto p-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((product, productIndex) => {
                const choosingType = isWheelCategory && selectedWheelType === null
                const itemId = isWheelCategory
                  ? 2000 + selectedWheelType! * 10 + productIndex
                  : 1000 + categoryIndex * 10 + productIndex
                const numericPrice = Number(product.price.replace(/\D/g, ''))
                const wheelPhoto = isWheelCategory
                  ? WHEEL_PHOTOS[choosingType ? productIndex : selectedWheelType!][choosingType ? 0 : productIndex]
                  : null
                const image = wheelPhoto?.img ?? product.img
                const openWheelType = () => { setSelectedWheelType(productIndex); contentRef.current?.scrollTo(0, 0) }
                return (
                  <div
                    key={product.name}
                    className="group rounded-xl border border-gray-100 bg-[#F4F4F5] overflow-hidden flex flex-col hover:-translate-y-1 hover:border-[#0D5C3A]/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden bg-white">
                      {choosingType ? (
                        <button onClick={openWheelType} className="w-full h-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D5C3A]" aria-label={`Ver opciones de ${['llantas', 'rines', 'cámaras', 'kits tubeless'][productIndex]}`}>
                          <img src={image} alt="" className="w-full h-full object-contain p-3 img-product group-hover:scale-105 transition-transform duration-500" />
                        </button>
                      ) : isCockpitCategory ? (
                        <img
                          src={image}
                          alt={product.name}
                          className={`h-full w-full object-cover img-product group-hover:scale-105 transition-transform duration-500 ${
                            productIndex === 0
                              ? 'object-center'
                              : productIndex === 2
                                ? 'object-[center_58%]'
                                : productIndex === 3
                                  ? 'object-[center_52%]'
                                  : 'object-center'
                          }`}
                        />
                      ) : (
                        <img
                          src={image}
                          alt={product.name}
                          className="w-full h-full object-contain p-3 img-product group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      {wheelPhoto && (
                        <a href={wheelPhoto.source} target="_blank" rel="noopener noreferrer" className="mb-2 text-[10px] text-gray-500 hover:text-[#0D5C3A] underline underline-offset-2">
                          Foto: {wheelPhoto.credit}
                        </a>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D5C3A] mb-1">{choosingType ? '4 opciones disponibles' : 'Disponible'}</span>
                      {choosingType ? (
                        <button onClick={openWheelType} className="text-left text-sm font-bold text-[#1A1A1A] leading-snug mb-3 group-hover:text-[#0D5C3A] hover:underline focus-visible:outline-2 focus-visible:outline-[#0D5C3A]">
                          {['Llantas', 'Rines', 'Cámaras', 'Kits tubeless'][productIndex]}
                        </button>
                      ) : (
                        <p className="text-sm font-bold text-[#1A1A1A] leading-snug mb-3 group-hover:text-[#0D5C3A] transition-colors">{product.name}</p>
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
  const [mechanicalArea, setMechanicalArea] = useState('')
  const [issueDetails, setIssueDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!service) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
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
                <p className="text-gray-500 text-sm">Nos comunicaremos contigo pronto para confirmar tu cita.</p>
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
                    placeholder="Tu nombre"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Teléfono</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="300 000 0000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Bicicleta / modelo</label>
                  <input value={bike} onChange={(e) => setBike(e.target.value)} required placeholder="Marca y modelo" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors" />
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
                      <input type="number" min="0" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="Ej. 1200 km" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Última revisión (opcional)</label>
                      <input type="date" value={issueDetails} onChange={(e) => setIssueDetails(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors" />
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
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0D5C3A] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-black py-3 rounded-full text-sm tracking-wide transition-colors"
                >
                  Confirmar Cita
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
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

const PRIVACY_CONSENT_KEY = 'bs-bikestore-privacy-consent-v1'

function PrivacyConsentGate({
  onAccept,
  onOpenTerms,
  onOpenPrivacy,
}: {
  onAccept: () => void
  onOpenTerms: () => void
  onOpenPrivacy: () => void
}) {
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-consent-title"
      aria-describedby="privacy-consent-description"
    >
      <div className="modal-animate w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-black px-6 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <BSLogo size={52} />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-100">Bicicenter Bikestore</p>
              <h2 id="privacy-consent-title" className="font-display mt-1 text-xl font-black text-gray-100 sm:text-2xl">
                Tu privacidad es importante
              </h2>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <p id="privacy-consent-description" className="text-sm leading-relaxed text-gray-600">
            Antes de ingresar, queremos informarte cómo usamos y protegemos tus datos personales al navegar,
            crear una cuenta o realizar un pedido.
          </p>

          <div className="my-5 space-y-3 rounded-xl border border-gray-100 bg-[#F4F4F5] p-4">
            {[
              'Usamos tus datos para gestionar pedidos, entregas, soporte y facturación.',
              'Protegemos tu información y no la vendemos a terceros.',
              'Puedes consultar, actualizar o solicitar la eliminación de tus datos.',
            ].map((item) => (
              <div key={item} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0D5C3A] text-white" aria-hidden="true">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </span>
                <p className="text-sm leading-relaxed text-gray-700">{item}</p>
              </div>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-gray-600">
            Revisa nuestros{' '}
            <button type="button" onClick={onOpenTerms} className="font-bold text-[#0D5C3A] underline underline-offset-2 hover:text-[#1A8A5A]">
              Términos y Condiciones
            </button>{' '}
            y la{' '}
            <button type="button" onClick={onOpenPrivacy} className="font-bold text-[#0D5C3A] underline underline-offset-2 hover:text-[#1A8A5A]">
              Política de Privacidad
            </button>
            .
          </p>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:border-[#0D5C3A]/40">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#0D5C3A]"
            />
            <span className="text-sm font-medium leading-relaxed text-gray-700">
              He leído y acepto los Términos y Condiciones y la Política de Privacidad.
            </span>
          </label>

          <button
            type="button"
            disabled={!confirmed}
            onClick={onAccept}
            className="mt-5 w-full rounded-full bg-[#0D5C3A] px-6 py-3.5 text-sm font-black text-white transition-all hover:bg-[#1A8A5A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Aceptar y entrar
          </button>

          <p className="mt-3 text-center text-xs leading-relaxed text-gray-400">
            Debes aceptar para acceder a la tienda.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

type PayMethod = 'efectivo'
type CheckoutStep = 'envio' | 'pago' | 'confirmacion'

function CheckoutModal({
  items,
  user,
  token,
  onClose,
  onSuccess,
}: {
  items: CartItem[]
  user: AuthUser
  token: string
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
        token,
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
                      <input className={inputCls} type="tel" value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} placeholder="310 234 5678" />
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

              const handlePrint = () => window.print()
              const handleDownload = async () => {
                const el = document.getElementById('factura-bs')
                if (!el) return
                try {
                  const logoResponse = await fetch(logoImg)
                  if (!logoResponse.ok) throw new Error('No se pudo cargar el logo de la tienda.')
                  const logoBlob = await logoResponse.blob()
                  const logoData = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('No se pudo preparar el logo.'))
                    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el logo.'))
                    reader.readAsDataURL(logoBlob)
                  })
                  const invoiceCopy = el.cloneNode(true) as HTMLElement
                  const logo = invoiceCopy.querySelector('img')
                  if (logo) {
                    logo.src = logoData
                    logo.style.width = '36px'
                    logo.style.height = '36px'
                    logo.style.objectFit = 'contain'
                  }
                  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Factura ${invoice.number}</title><style>body{font:14px Arial,sans-serif;max-width:800px;margin:32px auto;padding:24px;color:#1a1a1a;border:1px solid #e5e7eb;border-radius:16px}h1,h2{font-weight:900}table{width:100%;border-collapse:collapse}td,th{padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:13px}th{text-align:left;color:#0D5C3A;font-size:11px;text-transform:uppercase}.invoice-header{background:#0D5C3A!important;color:white!important;padding:20px;border-radius:12px}.invoice-header img{width:36px;height:36px;object-fit:contain}@media print{body{margin:0;border:0}}</style></head><body>${invoiceCopy.innerHTML}</body></html>`
                  const blob = new Blob([html], { type: 'text/html' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `Factura-${invoice.number}.html`
                  a.click()
                  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
                } catch (error) {
                  window.alert(error instanceof Error ? error.message : 'No fue posible descargar la factura.')
                }
              }
              const handleInvoiceExcel = () => {
                downloadXlsx([
                  ['Factura', invoice.number],
                  ['Fecha', invoiceDate],
                  ['Cliente', user.name],
                  ['Correo', user.email],
                  ['Método de pago', payLabel],
                  [],
                  ['Producto', 'Cantidad', 'Precio unitario (COP)', 'Subtotal (COP)'],
                  ...savedOrder.items.map((item) => [item.name, item.quantity, item.unitPrice, item.unitPrice * item.quantity]),
                  [],
                  ['Subtotal', subtotal],
                  ['IVA', iva],
                  ['Total', totalConIva],
                ], `Factura-${invoice.number}`)
              }

              return (
                <div className="flex flex-col gap-5 py-4">
                  {/* Success header */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0D5C3A] flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1A1A1A]" style={{fontFamily:'Montserrat,sans-serif'}}>¡Pedido guardado!</h3>
                      <p className="text-gray-500 text-sm">Gracias, {user.name.split(' ')[0]}. El pago en efectivo está pendiente de confirmación.</p>
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
                        <span>TOTAL PAGADO</span>
                        <span>${totalConIva.toLocaleString('es-CO')} COP</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-[11px] pt-1">
                        <span>Método de pago</span>
                        <span className="font-semibold">{payLabel} · pendiente</span>
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
                      onClick={handlePrint}
                      className="flex-1 border-2 border-[#0D5C3A] text-[#0D5C3A] font-bold py-3 rounded-full text-sm hover:bg-[#0D5C3A]/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      Imprimir
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 border-2 border-[#0D5C3A] text-[#0D5C3A] font-bold py-3 rounded-full text-sm hover:bg-[#0D5C3A]/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                      Descargar
                    </button>
                    <button onClick={handleInvoiceExcel} className="flex-1 border-2 border-[#0D5C3A] text-[#0D5C3A] font-bold py-3 rounded-full text-sm hover:bg-[#0D5C3A]/5 transition-colors">
                      Excel
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

function MyOrdersModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void apiRequest<CustomerOrder[]>('/orders/mine', { token })
      .then(setOrders)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar tus pedidos.'))
      .finally(() => setLoading(false))
  }, [token])

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    processing: 'En proceso',
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
  onLogin: (user: AuthUser, token: string) => void
  onOpenLegal: (section: 'terminos' | 'privacidad') => void
}) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot' | 'forgot-sent'>('login')
  const [role, setRole] = useState<'client' | 'admin'>('client')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
      const session = await apiRequest<{ user: AuthUser; token: string }>('/auth/login', {
        method: 'POST',
        body: { email: email.trim(), password },
      })
      if (session.user.role !== role) {
        throw new Error(role === 'admin' ? 'Esta cuenta no tiene permisos de administrador.' : 'Usa el acceso de administrador para esta cuenta.')
      }
      onLogin(session.user, session.token)
    } catch (err) {
      fail(err instanceof Error ? err.message : 'No fue posible iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async () => {
    setError('')
    if (!name.trim() || !email.trim() || !password) return fail('Completa todos los campos')
    if (password !== confirmPwd) return fail('Las contraseñas no coinciden')
    if (password.length < 10) return fail('La contraseña debe tener al menos 10 caracteres')
    if (!email.includes('@')) return fail('Correo inválido')
    if (!termsAccepted) return fail('Debes aceptar los términos y la política de privacidad')
    setSubmitting(true)
    try {
      const session = await apiRequest<{ user: AuthUser; token: string }>('/auth/register', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim(), password, termsAccepted },
      })
      onLogin(session.user, session.token)
    } catch (err) {
      fail(err instanceof Error ? err.message : 'No fue posible crear la cuenta.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all'

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
                  <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Correo electrónico</label>
                  <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Contraseña</label>
                  <div className="relative">
                    <input className={inputCls + ' pr-10'} type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 10 caracteres" />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D5C3A] transition-colors" tabIndex={-1}>
                      {showPwd
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Confirmar contraseña</label>
                  <div className="relative">
                    <input className={inputCls + ' pr-10'} type={showConfirmPwd ? 'text' : 'password'} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Repite tu contraseña" onKeyDown={(e) => e.key === 'Enter' && handleRegister()} />
                    <button type="button" onClick={() => setShowConfirmPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D5C3A] transition-colors" tabIndex={-1}>
                      {showConfirmPwd
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                  <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 accent-[#0D5C3A]" />
                  <span>
                    Acepto la{' '}
                    <button type="button" onClick={() => onOpenLegal('privacidad')} className="text-[#0D5C3A] underline">Política de Privacidad</button>
                    {' '}y los{' '}
                    <button type="button" onClick={() => onOpenLegal('terminos')} className="text-[#0D5C3A] underline">Términos y Condiciones</button>.
                  </span>
                </label>

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

function AdminLoginPage({ onSuccess, onBack }: { onSuccess: (user: AuthUser, token: string) => void; onBack: () => void }) {
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
      const session = await apiRequest<{ user: AuthUser; token: string }>('/auth/login', {
        method: 'POST',
        body: { email: email.trim(), password },
      })
      if (session.user.role !== 'admin') throw new Error('Esta cuenta no tiene permisos de administrador.')
      onSuccess(session.user, session.token)
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

type AdminSection = 'dashboard' | 'productos' | 'ofertas' | 'inventario' | 'usuarios' | 'clientes' | 'reportes' | 'pedidos' | 'resenas'

const MOCK_ORDERS = [
  { id: 'BS-001', client: 'Andrés Morales', email: 'andres@mail.com', product: 'GW Hawk MTB 29 12V', total: 17400000, status: 'entregado', date: '2026-09-10', city: 'Medellín', payMethod: 'tarjeta' },
  { id: 'BS-002', client: 'Laura Jiménez', email: 'laura@mail.com', product: 'Optimus Corvus Carbono', total: 18900000, status: 'en_proceso', date: '2026-09-15', city: 'Bogotá', payMethod: 'transferencia' },
  { id: 'BS-003', client: 'Diego Ospina', email: 'diego@mail.com', product: 'GW Mortirolo 700C', total: 24900000, status: 'pendiente', date: '2026-09-18', city: 'Cali', payMethod: 'nequi' },
  { id: 'BS-004', client: 'Valentina Cruz', email: 'vale@mail.com', product: 'Starker Sport 2.0 Pro', total: 19900000, status: 'cancelado', date: '2026-09-17', city: 'Bucaramanga', payMethod: 'pse' },
  { id: 'BS-005', client: 'Carlos Rueda', email: 'carlos@mail.com', product: 'Jeep Baltoro 29', total: 21500000, status: 'entregado', date: '2026-09-12', city: 'Pereira', payMethod: 'tarjeta' },
]

interface AdminProduct {
  id: number; name: string; category: string; price: number; stock: number; img: string; active: boolean
}
interface AdminUser {
  id: number; name: string; email: string; role: 'admin'; createdAt: string; active: boolean
}
interface AdminClient {
  id: number; name: string; email: string; phone: string; orders: number; totalSpent: number; lastOrder: string | null; active: boolean
}
interface AdminOffer {
  id: number; title: string; discount: number; code: string; validUntil: string | null; active: boolean
}
interface AdminReview {
  id: number; productId: number; productName: string; rating: number; comment: string
  approved: boolean; createdAt: string; author: string
}

const INIT_ADMIN_PRODUCTS: AdminProduct[] = ALL_PRODUCTS.map((p) => ({
  id: p.id, name: p.name, category: p.category, price: p.price, stock: p.stock, img: p.img, active: true,
}))

const INIT_CLIENTS: AdminClient[] = [
  { id: 1, name: 'Andrés Morales', email: 'andres@mail.com', phone: '311 234 5678', orders: 3, totalSpent: 4200000, lastOrder: '2026-09-10', active: true },
  { id: 2, name: 'Laura Jiménez', email: 'laura@mail.com', phone: '320 987 6543', orders: 1, totalSpent: 18900000, lastOrder: '2026-09-15', active: true },
  { id: 3, name: 'Diego Ospina', email: 'diego@mail.com', phone: '315 456 7890', orders: 5, totalSpent: 7600000, lastOrder: '2026-09-18', active: true },
  { id: 4, name: 'Sofía Vargas', email: 'sofia@mail.com', phone: '318 321 0987', orders: 2, totalSpent: 35400000, lastOrder: '2026-09-01', active: true },
]

function AdminPanel({ onClose, token }: { onClose: () => void; token: string }) {
  const [section, setSection] = useState<AdminSection>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminDarkMode, setAdminDarkMode] = useState(false)

  // Products state
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>(INIT_ADMIN_PRODUCTS)
  useEffect(() => {
    void apiRequest<{ items: (Omit<AdminProduct, 'img'> & { img: string | null })[] }>('/admin/products', { token })
      .then(({ items }) => {
        const localById = new Map(INIT_ADMIN_PRODUCTS.map((product) => [product.id, product]))
        setAdminProducts(items.map((item) => ({
          ...item,
          img: item.img || localById.get(item.id)?.img || '',
          active: item.active,
        })))
      })
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar los productos de administración.'))
  }, [token])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null)
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Todo Terreno', price: '', stock: '', imgPreview: '' })

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' })
  useEffect(() => {
    void apiRequest<{ items: AdminUser[] }>('/admin/users', { token })
      .then(({ items }) => setUsers(items))
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar los usuarios.'))
  }, [token])

  // Clients state
  const [clients, setClients] = useState<AdminClient[]>(INIT_CLIENTS)
  const [clientSearch, setClientSearch] = useState('')
  const [showAddClient, setShowAddClient] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', password: '', termsAccepted: false })
  useEffect(() => {
    void apiRequest<{ items: AdminClient[] }>('/admin/clients', { token })
      .then(({ items }) => setClients(items.map((client) => ({
        ...client,
        orders: Number(client.orders),
        totalSpent: Number(client.totalSpent),
        lastOrder: client.lastOrder ? new Date(client.lastOrder).toISOString().slice(0, 10) : null,
      }))))
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar los clientes.'))
  }, [token])

  // Offers state
  const [offers, setOffers] = useState<AdminOffer[]>([])
  const [showAddOffer, setShowAddOffer] = useState(false)
  const [newOffer, setNewOffer] = useState({ title: '', discount: '', code: '', validUntil: '' })
  useEffect(() => {
    void apiRequest<{ items: AdminOffer[] }>('/admin/offers', { token })
      .then(({ items }) => setOffers(items))
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar las ofertas.'))
  }, [token])

  const [adminSectionKey, setAdminSectionKey] = useState(0)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({})
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
    }[]>('/orders', { token })
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
  }, [token])

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
      apiRequest<AdminReview[]>('/admin/reviews?approved=false', { token }),
      apiRequest<AdminReview[]>('/admin/reviews?approved=true', { token }),
    ])
      .then(([pending, approved]) => setAdminReviews([...approved, ...pending]))
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar las reseñas.'))
  }, [token])

  const navItems: { id: AdminSection; label: string; icon: React.ReactElement }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { id: 'pedidos', label: 'Pedidos', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg> },
    { id: 'productos', label: 'Productos', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    { id: 'inventario', label: 'Inventario', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg> },
    { id: 'ofertas', label: 'Ofertas', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/><path d="m15 19-3-3 3-3"/></svg> },
    { id: 'usuarios', label: 'Usuarios', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg> },
    { id: 'clientes', label: 'Clientes', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'resenas', label: 'Reseñas', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
    { id: 'reportes', label: 'Reportes', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> },
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
    if (!newProduct.name.trim() || !Number.isInteger(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
      window.alert('Ingresa un nombre, un precio entero mayor que cero y un inventario válido.')
      return
    }
    const payload = {
      name: newProduct.name.trim(),
      category: newProduct.category,
      price,
      stock,
      ...(newProduct.imgPreview ? { imageUrl: newProduct.imgPreview } : {}),
    }
    setSavingProduct(true)
    try {
      if (editProduct) {
        await apiRequest(`/products/${editProduct.id}`, { method: 'PATCH', token, body: payload })
        setAdminProducts((prev) => prev.map((product) => product.id === editProduct.id
          ? { ...product, ...payload, img: newProduct.imgPreview || product.img }
          : product))
      } else {
        const created = await apiRequest<{ id: number }>('/products', {
          method: 'POST',
          token,
          body: { ...payload, description: '', gallery: [], specs: [], active: true, imageUrl: newProduct.imgPreview || null },
        })
        setAdminProducts((prev) => [...prev, {
          id: created.id,
          name: payload.name,
          category: payload.category,
          price: payload.price,
          stock: payload.stock,
          img: newProduct.imgPreview || MTN,
          active: true,
        }])
      }
      setShowAddProduct(false)
      setEditProduct(null)
      setNewProduct({ name: '', category: 'Todo Terreno', price: '', stock: '', imgPreview: '' })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible guardar el producto.')
    } finally {
      setSavingProduct(false)
    }
  }

  const setProductActive = async (id: number, active: boolean) => {
    try {
      await apiRequest(`/products/${id}`, { method: 'PATCH', token, body: { active } })
      setAdminProducts((prev) => prev.map((product) => product.id === id ? { ...product, active } : product))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar el producto.')
    }
  }

  const adjustStock = async (id: number, stock: number) => {
    if (stock < 0) return
    try {
      await apiRequest(`/products/${id}`, { method: 'PATCH', token, body: { stock } })
      setAdminProducts((prev) => prev.map((product) => product.id === id ? { ...product, stock } : product))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar el inventario.')
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
        token,
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
    setNewProduct({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), imgPreview: '' })
    setShowAddProduct(true)
  }

  const saveUser = async () => {
    try {
      const user = await apiRequest<AdminUser>('/admin/users', {
        method: 'POST',
        token,
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
      await apiRequest(`/admin/users/${user.id}/active`, { method: 'PATCH', token, body: { active } })
      setUsers((previous) => previous.map((item) => item.id === user.id ? { ...item, active } : item))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar el usuario.')
    }
  }

  const setClientActive = async (client: AdminClient, active: boolean) => {
    try {
      await apiRequest(`/admin/clients/${client.id}/active`, { method: 'PATCH', token, body: { active } })
      setClients((previous) => previous.map((item) => item.id === client.id ? { ...item, active } : item))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar el cliente.')
    }
  }

  const saveClient = async () => {
    if (!newClient.termsAccepted) return window.alert('Debes confirmar la aceptación de términos y privacidad.')
    try {
      const client = await apiRequest<AdminClient>('/admin/clients', {
        method: 'POST',
        token,
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
    try {
      const offer = await apiRequest<AdminOffer>('/admin/offers', {
        method: 'POST',
        token,
        body: { ...newOffer, discount: Number(newOffer.discount) },
      })
      setOffers((previous) => [offer, ...previous])
      setShowAddOffer(false)
      setNewOffer({ title: '', discount: '', code: '', validUntil: '' })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible guardar la oferta.')
    }
  }

  const setOfferActive = async (offer: AdminOffer, active: boolean) => {
    try {
      await apiRequest(`/admin/offers/${offer.id}/active`, { method: 'PATCH', token, body: { active } })
      setOffers((previous) => previous.map((item) => item.id === offer.id ? { ...item, active } : item))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar la oferta.')
    }
  }

  const setReviewActive = async (review: AdminReview, active: boolean) => {
    try {
      await apiRequest(`/admin/reviews/${review.id}/approval`, { method: 'PATCH', token, body: { approved: active } })
      setAdminReviews((previous) => previous.map((item) => item.id === review.id ? { ...item, approved: active } : item))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No fue posible actualizar la reseña.')
    }
  }

  const saveQuickSale = () => {
    if (!quickSale.buyerName || !quickSale.productId) return
    const prod = adminProducts.find(p => String(p.id) === quickSale.productId)
    if (!prod) return
    const newId = `BS-${String(Date.now()).slice(-6)}`
    const newOrder = {
      id: newId,
      client: quickSale.buyerName + ' (Visita)',
      email: quickSale.phone || '—',
      product: prod.name,
      total: prod.price * Math.max(1, Number(quickSale.qty)),
      status: 'pendiente',
      date: new Date().toISOString().split('T')[0],
      city: 'En tienda',
      payMethod: 'efectivo',
    }
    setOrders(prev => [newOrder, ...prev])
    setOrderStatuses(prev => ({ ...prev, [newId]: 'pendiente' }))
    setShowQuickSale(false)
    setQuickSale({ productId: '', qty: '1', buyerName: '', phone: '' })
    setSection('pedidos')
    setAdminSectionKey(k => k + 1)
  }

  const exportClientXlsx = () => downloadXlsx([
    ['Cliente', 'Correo', 'Teléfono', 'Pedidos', 'Total gastado (COP)', 'Último pedido'],
    ...clients.map((client) => [client.name, client.email, client.phone, client.orders, client.totalSpent, client.lastOrder ?? '']),
  ], 'informe-clientes')

  const orderReportHeaders = ['Fecha', 'Pedido', 'Cliente', 'Correo', 'Productos', 'Ciudad', 'Método de pago', 'Total (COP)']
  const orderReportRows = orders.map((order) => [
    order.date, order.id, order.client, order.email, order.product, order.city, order.payMethod, order.total,
  ])
  const salesOrders = orders.filter((order) => (orderStatuses[order.id] ?? order.status) !== 'cancelado')
  const salesReportRows = salesOrders.map((order) => [
    order.date, order.id, order.client, order.email, order.product, order.city, order.payMethod, order.total,
  ])
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
    reportWindow.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font:14px Arial,sans-serif;margin:32px;color:#000}h1{color:#000}p{color:#000}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border:1px solid #bbb;color:#000}th{background:#f4f4f5;color:#000}@media print{body{margin:12mm}}</style></head><body><h1>${escapeHtml(title)}</h1><p>BS Bike Store · ${new Date().toLocaleDateString('es-CO')}</p><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`)
    reportWindow.document.close()
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
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 focus:border-[#0D5C3A] transition-all'
  const btnPrimary = 'bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors'
  const btnOutline = 'border border-gray-200 hover:border-[#0D5C3A] text-gray-600 hover:text-[#0D5C3A] font-semibold px-4 py-2 rounded-xl text-sm transition-colors'

  return (
    <div data-admin-theme={adminDarkMode ? 'dark' : 'light'} className="fixed inset-0 z-[100] flex bg-[#F4F4F5]">
      <style>{`
        [data-admin-theme="dark"]{color-scheme:dark;background:#111827;color:#e5e7eb}
        [data-admin-theme="dark"] [class~="bg-white"],[data-admin-theme="dark"] [class~="bg-[#F4F4F5]"],[data-admin-theme="dark"] [class~="bg-gray-50"],[data-admin-theme="dark"] [class~="bg-gray-100"]{background-color:#1f2937!important}
        [data-admin-theme="dark"] [class*="bg-[#F4F4F5]/"]{background-color:#273449!important}
        [data-admin-theme="dark"] [class~="text-[#1A1A1A]"],[data-admin-theme="dark"] [class~="text-gray-700"]{color:#f3f4f6!important}
        [data-admin-theme="dark"] [class~="text-gray-600"]{color:#d1d5db!important}
        [data-admin-theme="dark"] [class~="text-gray-500"],[data-admin-theme="dark"] [class~="text-gray-400"]{color:#9ca3af!important}
        [data-admin-theme="dark"] [class~="border-gray-100"],[data-admin-theme="dark"] [class~="border-gray-200"]{border-color:#374151!important}
        [data-admin-theme="dark"] input,[data-admin-theme="dark"] select,[data-admin-theme="dark"] textarea{background-color:#111827;color:#f3f4f6;border-color:#4b5563}
        [data-admin-theme="dark"] input::placeholder,[data-admin-theme="dark"] textarea::placeholder{color:#9ca3af}
      `}</style>
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
              onClick={() => { setSection(item.id); setAdminSectionKey(k => k + 1) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] ${
                section === item.id ? 'bg-[#0D5C3A] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-2 pb-4">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-white/10 hover:text-white transition-all"
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
              onClick={() => setAdminDarkMode((enabled) => !enabled)}
              aria-label={adminDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={adminDarkMode ? 'Modo claro' : 'Modo oscuro'}
              className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span aria-hidden="true">{adminDarkMode ? '☀️' : '🌙'}</span>
              <span className="hidden sm:inline">{adminDarkMode ? 'Modo claro' : 'Modo oscuro'}</span>
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
                    <input className={inputCls} type="number" min="1" value={quickSale.qty} onChange={e => setQuickSale(q => ({...q, qty: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre del comprador *</label>
                    <input className={inputCls} placeholder="Nombre completo" value={quickSale.buyerName} onChange={e => setQuickSale(q => ({...q, buyerName: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Teléfono (opcional)</label>
                    <input className={inputCls} placeholder="300 123 4567" value={quickSale.phone} onChange={e => setQuickSale(q => ({...q, phone: e.target.value}))} />
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
                  <button onClick={saveQuickSale} disabled={!quickSale.buyerName || !quickSale.productId} className="flex-1 bg-[#0D5C3A] hover:bg-[#1A8A5A] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
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
                  { label: 'Total Ventas', value: `$${(orders.reduce((s,o)=>s+o.total,0)/1000000).toFixed(1)}M`, sub: 'suma de pedidos', color: '#0D5C3A' },
                  { label: 'Pedidos Totales', value: orders.length, sub: `${orders.filter(o=>(orderStatuses[o.id]||o.status)==='entregado').length} entregados`, color: '#1A8A5A' },
                  { label: 'Pedidos Pendientes', value: orders.filter(o=>(orderStatuses[o.id]||o.status)==='pendiente'||(orderStatuses[o.id]||o.status)==='en_proceso').length, sub: 'por procesar', color: '#1A8A5A' },
                  { label: 'Clientes Activos', value: clients.length, sub: 'registrados', color: '#1A8A5A' },
                  { label: 'Productos Activos', value: adminProducts.filter(p=>p.active).length, sub: `de ${adminProducts.length} totales`, color: '#1A8A5A' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:scale-105 transition-transform duration-200 cursor-default">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className="text-3xl font-black" style={{ color: stat.color, fontFamily: 'Montserrat, sans-serif' }}>{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">Productos con stock crítico</h3>
                  <div className="space-y-3">
                    {adminProducts.filter(p=>p.stock<=3).map((p) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-contain p-1 img-product" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
                        </span>
                      </div>
                    ))}
                    {adminProducts.filter(p=>p.stock<=3).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Todo el stock en buen nivel ✓</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">Últimos clientes</h3>
                  <div className="space-y-3">
                    {clients.slice(0, 4).map((c) => (
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
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTOS ── */}
          {section === 'productos' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500">{adminProducts.length} productos registrados</p>
                <button onClick={() => { setEditProduct(null); setNewProduct({ name:'', category:'Todo Terreno', price:'', stock:'', imgPreview:'' }); setShowAddProduct(true) }} className={btnPrimary}>
                  + Agregar producto
                </button>
              </div>

              {showAddProduct && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">{editProduct ? 'Editar producto' : 'Nuevo producto'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre</label>
                      <input className={inputCls} value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} placeholder="Ej: Trek Top Fuel 9.9" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Categoría</label>
                      <select className={inputCls} value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}>
                        {CATEGORIES.filter(c=>c!=='Todas').map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Precio (COP)</label>
                      <input className={inputCls} type="number" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} placeholder="18900000" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Stock</label>
                      <input className={inputCls} type="number" value={newProduct.stock} onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))} placeholder="10" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Foto del producto</label>
                      <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#0D5C3A] rounded-xl p-4 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-gray-400">
                          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                        {newProduct.imgPreview || editProduct?.img
                          ? <img src={newProduct.imgPreview || editProduct?.img} alt="preview" className="h-16 w-16 object-contain rounded-lg" />
                          : <span className="text-sm text-gray-400">Subir foto (JPG, PNG, WebP)</span>}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImgUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => void saveProduct()} disabled={savingProduct} className={btnPrimary + ' disabled:opacity-50'}>{savingProduct ? 'Guardando…' : editProduct ? 'Guardar cambios' : 'Crear producto'}</button>
                    <button onClick={() => { setShowAddProduct(false); setEditProduct(null) }} className={btnOutline}>Cancelar</button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F4F5]">
                    <tr>
                      {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map(h=>(
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F4F4F5]/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-contain p-1 flex-shrink-0 img-product" />
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
              </div>
            </div>
          )}

          {/* ── INVENTARIO ── */}
          {section === 'inventario' && (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total unidades', value: adminProducts.reduce((s,p)=>s+p.stock,0), color: '#0D5C3A' },
                  { label: 'Stock crítico (≤3)', value: adminProducts.filter(p=>p.stock>0&&p.stock<=3).length, color: '#0D5C3A' },
                  { label: 'Sin stock', value: adminProducts.filter(p=>p.stock===0).length, color: '#0D5C3A' },
                ].map(s=>(
                  <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-3xl font-black" style={{color:s.color, fontFamily:'Montserrat, sans-serif'}}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F4F5]">
                    <tr>
                      {['Producto','Categoría','Stock actual','Nivel','Ajustar stock'].map(h=>(
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F4F4F5]/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.img} alt={p.name} className="w-9 h-9 rounded-lg object-contain p-1 flex-shrink-0 img-product" />
                            <span className="font-semibold text-xs text-[#1A1A1A]">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{p.category}</td>
                        <td className="px-4 py-3 font-black text-[#1A1A1A]">{p.stock}</td>
                        <td className="px-4 py-3">
                          <div className="w-24 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all" style={{
                              width: `${Math.min(100, (p.stock/15)*100)}%`,
                              backgroundColor: p.stock===0?'#dc2626':p.stock<=3?'#d97706':'#0D5C3A'
                            }} />
                          </div>
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
              </div>
            </div>
          )}

          {/* ── OFERTAS ── */}
          {section === 'ofertas' && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <p className="text-sm text-gray-500">{offers.length} ofertas creadas</p>
                <button onClick={() => setShowAddOffer(true)} className={btnPrimary}>+ Nueva oferta</button>
              </div>
              {showAddOffer && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                  <h3 className="font-black text-sm text-[#1A1A1A] mb-4 uppercase tracking-wide">Crear oferta</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre de la oferta</label>
                      <input className={inputCls} value={newOffer.title} onChange={e=>setNewOffer(o=>({...o,title:e.target.value}))} placeholder="Ej: Temporada de MTB" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Descuento (%)</label>
                      <input className={inputCls} type="number" min="1" max="100" value={newOffer.discount} onChange={e=>setNewOffer(o=>({...o,discount:e.target.value}))} placeholder="15" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Código</label>
                      <input className={inputCls} maxLength={40} value={newOffer.code} onChange={e=>setNewOffer(o=>({...o,code:e.target.value.toUpperCase()}))} placeholder="MTB15" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Válido hasta</label>
                      <input className={inputCls} type="date" value={newOffer.validUntil} onChange={e=>setNewOffer(o=>({...o,validUntil:e.target.value}))} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => void saveOffer()} disabled={!newOffer.title.trim() || !newOffer.discount || Number(newOffer.discount) < 1 || Number(newOffer.discount) > 100 || !newOffer.code.trim()} className={btnPrimary + ' disabled:opacity-50'}>Crear oferta</button>
                    <button onClick={() => setShowAddOffer(false)} className={btnOutline}>Cancelar</button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-black text-[#1A1A1A] text-sm">{o.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Hasta {o.validUntil || '—'}</p>
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
                      <span className="text-xs text-gray-400">{o.active ? 'Oferta visible' : 'Oferta pausada'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USUARIOS ── */}
          {section === 'usuarios' && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <p className="text-sm text-gray-500">{users.length} usuarios del sistema</p>
                <button onClick={() => setShowAddUser(true)} className={btnPrimary}>+ Crear administrador</button>
              </div>
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
                    {users.map((u) => (
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
                <p className="text-sm text-gray-500">{filteredClients.length} clientes</p>
                <button onClick={() => setShowAddClient((visible) => !visible)} className={btnPrimary}>+ Registrar cliente</button>
              </div>
              {showAddClient && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                  <h3 className="font-black text-sm mb-4">Nuevo cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className={inputCls} aria-label="Nombre del cliente" placeholder="Nombre completo" value={newClient.name} onChange={(event) => setNewClient((client) => ({ ...client, name: event.target.value }))} />
                    <input className={inputCls} aria-label="Correo del cliente" type="email" placeholder="Correo electrónico" value={newClient.email} onChange={(event) => setNewClient((client) => ({ ...client, email: event.target.value }))} />
                    <input className={inputCls} aria-label="Teléfono del cliente" type="tel" placeholder="Teléfono" value={newClient.phone} onChange={(event) => setNewClient((client) => ({ ...client, phone: event.target.value }))} />
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
                      {['Cliente','Contacto','Pedidos','Total gastado','Último pedido','Estado'].map(h=>(
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredClients.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F4F4F5]/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#1A8A5A]/10 flex items-center justify-center text-[#0D5C3A] font-black text-sm">{c.name[0]}</div>
                            <span className="font-semibold text-[#1A1A1A]">{c.name}</span>
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
              </div>
            </div>
          )}

          {/* ── REPORTES ── */}
          {section === 'reportes' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ventas:</span>
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
                          <select className={inputCls} value={orderStatuses[editOrderDraft.id] || editOrderDraft.status} onChange={e => setOrderStatuses(prev => ({...prev, [editOrderDraft.id]: e.target.value}))}>
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
                  { label: 'Total pedidos', value: orders.length, color: '#0D5C3A' },
                  { label: 'Pendientes', value: orders.filter(o=>(orderStatuses[o.id]||o.status)==='pendiente').length, color: '#0D5C3A' },
                  { label: 'En proceso', value: orders.filter(o=>(orderStatuses[o.id]||o.status)==='en_proceso').length, color: '#0D5C3A' },
                  { label: 'Entregados', value: orders.filter(o=>(orderStatuses[o.id]||o.status)==='entregado').length, color: '#0D5C3A' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:scale-105 transition-transform duration-200">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-3xl font-black" style={{color:s.color, fontFamily:'Montserrat, sans-serif'}}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F4F4F5]">
                      <tr>
                        {['#Pedido','Factura','Cliente','Producto','Total','Fecha','Acciones'].map(h=>(
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map(o => {
                        const st = orderStatuses[o.id] || o.status
                        return (
                          <tr key={o.id} className="hover:bg-[#F4F4F5]/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs font-bold text-[#1A1A1A]">{o.id}</td>
                            <td className="px-4 py-3 font-mono text-[10px] text-gray-500">{o.invoiceNumber ?? '—'}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-xs text-[#1A1A1A]">{o.client}</p>
                              <p className="text-[10px] text-gray-400">{o.email}</p>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px] truncate">{o.product}</td>
                            <td className="px-4 py-3 font-black text-xs text-[#0D5C3A] whitespace-nowrap">${o.total.toLocaleString('es-CO')}</td>
                            <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{o.date}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { setEditingOrder(o); setEditOrderDraft({...o}) }}
                                  className="text-[#0D5C3A] hover:text-[#1A8A5A] transition-colors p-1 rounded"
                                  title="Editar pedido"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button
                                  onClick={() => void updateOrderStatus(o.id, 'cancelado')}
                                  disabled={st !== 'pendiente' && st !== 'en_proceso'}
                                  className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 rounded"
                                  title="Cancelar pedido y devolver existencias"
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
                      {adminReviews.map((review) => {
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

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [storeProducts, setStoreProducts] = useState<Product[]>(ALL_PRODUCTS)
  const [wishlist, setWishlist] = useState<number[]>([])
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [priceSort, setPriceSort] = useState<'relevancia' | 'menor' | 'mayor'>('relevancia')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [addedId, setAddedId] = useState<number | null>(null)
  const [selectedService, setSelectedService] = useState<(typeof SERVICES)[0] | null>(null)
  const [selectedPartCategory, setSelectedPartCategory] = useState<(typeof PART_CATEGORIES)[0] | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminLoginOpen, setAdminLoginOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [authToken, setAuthToken] = useState(() => window.sessionStorage.getItem(AUTH_TOKEN_KEY) ?? '')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [ordersModalOpen, setOrdersModalOpen] = useState(false)
  const [checkoutAfterAuth, setCheckoutAfterAuth] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [legalModal, setLegalModal] = useState<'terminos' | 'privacidad' | 'cookies' | null>(null)
  const [privacyConsentAccepted, setPrivacyConsentAccepted] = useState(() => {
    try {
      return window.localStorage.getItem(PRIVACY_CONSENT_KEY) === 'accepted'
    } catch {
      return false
    }
  })
  const [darkMode, setDarkMode] = useState(false)
  const [userReviews, setUserReviews] = useState<{ name: string; date: string; rating: number; bike: string; comment: string }[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

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
            img: item.img || local?.img || '',
            priceLabel: `$${item.price.toLocaleString('es-CO')}`,
            gallery: item.gallery?.length ? item.gallery : local?.gallery ?? [],
            specs: item.specs?.length ? item.specs : local?.specs ?? [],
            rating: Number(item.rating ?? local?.rating ?? 0),
            reviews: Number(item.reviews ?? local?.reviews ?? 0),
            badge: item.badge ?? local?.badge ?? null,
            darkBg: local?.darkBg,
          } as Product
        }))
      })
      .catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'No fue posible cargar el catálogo desde el servidor.'))
  }, [adminOpen])

  useEffect(() => {
    if (!authToken) return
    void apiRequest<{ user: AuthUser }>('/auth/me', { token: authToken })
      .then(({ user }) => setCurrentUser(user))
      .catch(() => {
        window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
        setAuthToken('')
      })
  }, [])

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
    if (priceMin !== '') list = list.filter(p => p.price >= Number(priceMin.replace(/\D/g, '')))
    if (priceMax !== '') list = list.filter(p => p.price <= Number(priceMax.replace(/\D/g, '')))
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
    setTimeout(() => setAddedId(null), 1500)
  }

  const handleAuthSuccess = (user: AuthUser, token: string) => {
    setCurrentUser(user)
    setAuthToken(token)
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, token)
    setAuthModalOpen(false)
    if (user.role === 'client' && checkoutAfterAuth) setCheckoutOpen(true)
    setCheckoutAfterAuth(false)
    if (user.role === 'admin') { setAdminLoginOpen(false); setAdminOpen(true) }
  }

  const handleAdminLoginSuccess = (user: AuthUser, token: string) => {
    setCurrentUser(user)
    setAuthToken(token)
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, token)
    setAdminLoginOpen(false)
    setAdminOpen(true)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setAuthToken('')
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
    setUserMenuOpen(false)
    setAdminOpen(false)
    setCartItems([])
  }

  const changeQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
    }
  }

  const removeItem = (id: number) => setCartItems((prev) => prev.filter((i) => i.id !== id))

  const toggleWishlist = (id: number) =>
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))

  const scrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const handleSearchToggle = () => {
    setSearchOpen((v) => !v)
    setTimeout(() => searchRef.current?.focus(), 100)
  }

  const acceptPrivacyConsent = () => {
    try {
      window.localStorage.setItem(PRIVACY_CONSENT_KEY, 'accepted')
    } catch {
      // Allow access even when browser storage is unavailable.
    }
    setPrivacyConsentAccepted(true)
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200`}>
      {!privacyConsentAccepted && (
        <PrivacyConsentGate
          onAccept={acceptPrivacyConsent}
          onOpenTerms={() => setLegalModal('terminos')}
          onOpenPrivacy={() => setLegalModal('privacidad')}
        />
      )}

      {/* ─── NAV ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button onClick={() => scrollTo('hero')} className="flex-shrink-0 flex items-center">
              <BSLogo size={52} />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.section)}
                  className="text-sm font-medium text-gray-700 hover:text-[#0D5C3A] transition-colors tracking-wide"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Utility Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
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
              <button onClick={handleSearchToggle} className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors">
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
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black ${currentUser.role === 'admin' ? 'bg-[#0D5C3A]' : 'bg-[#1A1A1A]'}`}>
                      {currentUser.name[0]}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[90px] truncate">{currentUser.name.split(' ')[0]}</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
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
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
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
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors relative"
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
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
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
                className="lg:hidden p-2 rounded-full hover:bg-gray-100"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  {menuOpen ? <path d="M6 18 18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

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
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => { scrollTo(link.section); setMenuOpen(false) }}
                className="text-sm font-medium text-gray-700 hover:text-[#0D5C3A] text-left"
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
      <section id="hero" className="relative overflow-hidden bg-[#1A1A1A] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506316940527-4d1c138978a0?auto=format&fit=crop&w=2000&q=85)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/75 to-[#1A1A1A]/20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
          <div className="max-w-2xl">
            <span className="inline-block text-[#1A8A5A] text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Temporada 2026 — Nueva Colección
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Encuentra tu <br /><span className="text-[#1A8A5A]">ruta perfecta.</span>
            </h1>
            <p className="text-gray-300 text-lg lg:text-xl leading-relaxed mb-10 max-w-xl">
              Explora nuestra colección de bicicletas de ruta, montaña y urbanas de alto rendimiento.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => { setActiveCategory('Todas'); scrollTo('productos') }}
                className="bg-[#0D5C3A] hover:bg-[#1A8A5A] text-white font-bold px-10 py-4 rounded-full transition-all duration-200 text-sm tracking-widest uppercase"
              >
                Ver Bicicletas
              </button>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Modelos disponibles', value: '200+' },
              { label: 'Clientes satisfechos', value: '12.000+' },
              { label: 'Años de experiencia', value: '15' },
              { label: 'Servicios al año', value: '5.000+' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl lg:text-3xl font-black text-[#1A8A5A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-1 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      <section id="productos" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[#0D5C3A] text-xs font-bold tracking-[0.2em] uppercase block mb-2">Selección Editorial</span>
              <h2 className="text-4xl lg:text-5xl font-black text-[#1A1A1A]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
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
          <div className="flex gap-2 flex-wrap mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-[#0D5C3A] text-white shadow-md'
                    : 'bg-[#F4F4F5] text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
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
          <div className="flex flex-wrap items-center gap-3 mb-6 bg-[#F4F4F5] rounded-2xl px-4 py-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rango de precio:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">De</span>
              <input
                type="number"
                placeholder="Mín"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm w-28 focus:outline-none focus:border-[#0D5C3A] transition-colors"
              />
              <span className="text-xs text-gray-500">a</span>
              <input
                type="number"
                placeholder="Máx"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm w-28 focus:outline-none focus:border-[#0D5C3A] transition-colors"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col shadow-sm">
                  <div
                    className={`relative overflow-hidden cursor-zoom-in rounded-t-2xl ${
                      WHITE_GRID_IMAGE_PRODUCT_IDS.has(p.id)
                        ? 'grid place-items-center bg-(--color-white)'
                        : 'flex items-center justify-center card-img-bg'
                    }`}
                    style={{ minHeight: '184px' }}
                    onClick={() => setSelectedProduct(p)}
                  >
                    <img
                      src={p.img}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-contain object-center p-3 transition-all duration-500 group-hover:scale-105 img-product"
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

                  <div className="px-4 pb-4 pt-2 flex flex-col flex-1">
                    <span className="text-[#0D5C3A] text-[10px] font-bold uppercase tracking-widest mb-0.5">{p.category}</span>
                    <h3 className="font-black text-[#1A1A1A] text-sm leading-tight mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{p.name}</h3>
                    <div className="flex items-center gap-1.5 mb-2">
                      <StarRating rating={p.rating} />
                      <span className="text-[10px] text-gray-500">({p.reviews})</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <span className="text-base font-black text-[#1A1A1A]">{p.priceLabel}</span>
                      <button
                        onClick={() => p.stock > 0 && addToCart(p)}
                        disabled={p.stock === 0}
                        className={`h-10 w-36 flex-none justify-center whitespace-nowrap text-white text-xs font-bold rounded-full transition-all duration-200 tracking-wide flex items-center gap-1.5 ${
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
      <section id="repuestos" className="py-20 lg:py-28 bg-white">
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
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#0D5C3A]/30 active:scale-[0.98] transition-all duration-300 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D5C3A] focus-visible:outline-offset-2"
              >
                <div className="h-44 overflow-hidden bg-[#F4F4F5]">
                  <img
                    src={part.img}
                    alt={part.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 img-hero"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block text-[#0D5C3A] text-[10px] font-bold tracking-widest uppercase mb-2">
                    Disponible en tienda
                  </span>
                  <h3 className="text-xl font-black text-[#1A1A1A] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {part.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{part.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[#0D5C3A] text-xs font-black group-hover:gap-3 transition-all">
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
              onClick={() => scrollTo('servicios')}
              className="bg-white text-[#0D5C3A] font-black px-6 py-3 rounded-full hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
            >
              Solicitar asesoría
            </button>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ────────────────────────────────────────────────────── */}
      <section id="servicios" className="py-20 lg:py-28 bg-[#1A1A1A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#1A8A5A] text-xs font-bold tracking-[0.2em] uppercase block mb-3">Nuestro Taller</span>
            <h2 className="text-4xl lg:text-5xl font-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Servicios de Taller<br className="hidden lg:block" /> y Mantenimiento
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s) => (
              <button
                key={s.title}
                onClick={() => setSelectedService(s)}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-[#0D5C3A] hover:bg-[#0D5C3A]/10 transition-all duration-300 group text-left"
              >
                <div className="text-[#1A8A5A] mb-5 group-hover:text-white transition-colors">{s.icon}</div>
                <h3 className="font-black text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{s.desc}</p>
                <span className="text-[#1A8A5A] font-black text-lg">{s.price}</span>
                {s.title !== 'Envío Express' && (
                  <div className="mt-4 flex items-center gap-1.5 text-[#1A8A5A] text-xs font-semibold">
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
              onClick={() => setSelectedService(SERVICES[0])}
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
            {[...REVIEWS, ...userReviews].map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
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
                    <p className="font-black text-[#1A1A1A] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{r.name}</p>
                    <p className="text-xs text-gray-400">{r.date}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#0D5C3A] bg-[#0D5C3A]/10 px-3 py-1 rounded-full">{r.bike}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Review Form */}
          <ReviewForm onSubmit={r => setUserReviews(prev => [...prev, r])} />
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#1A1A1A] text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3"><BSLogo size={64} dark withBackground={false} /></div>
              <p className="text-sm leading-relaxed text-gray-500">Tu tienda de bicicletas de confianza. Equipos de alto rendimiento para cada tipo de ruta.</p>
            </div>

            {[
              { title: 'Explorar', links: ['Bicicletas de Ruta', 'Bicicletas de Montaña', 'Urbanas', 'Accesorios', 'Ropa'] },
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
                        className="text-sm hover:text-[#1A8A5A] transition-colors text-left"
                      >
                        {l}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <p>© 2026 BS Bike Store. Todos los derechos reservados.</p>
            <div className="flex gap-6 items-center">
              <button onClick={() => setLegalModal('terminos')} className="hover:text-[#1A8A5A] transition-colors">Términos y Condiciones</button>
              <button onClick={() => setLegalModal('privacidad')} className="hover:text-[#1A8A5A] transition-colors">Política de Privacidad</button>
              <button onClick={() => setLegalModal('cookies')} className="hover:text-[#1A8A5A] transition-colors">Cookies</button>
              <button
                onClick={() => setAdminLoginOpen(true)}
                className="flex items-center gap-1.5 text-gray-600 hover:text-[#1A8A5A] transition-colors border border-white/10 hover:border-[#1A8A5A]/40 rounded-lg px-3 py-1.5"
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
        onToggleWishlist={toggleWishlist}
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
      {ordersModalOpen && authToken && <MyOrdersModal token={authToken} onClose={() => setOrdersModalOpen(false)} />}
      {adminLoginOpen && !adminOpen && (
        <AdminLoginPage
          onSuccess={handleAdminLoginSuccess}
          onBack={() => setAdminLoginOpen(false)}
        />
      )}
      {adminOpen && currentUser?.role === 'admin' && (
        <AdminPanel token={authToken} onClose={() => setAdminOpen(false)} />
      )}

      {checkoutOpen && currentUser && currentUser.role === 'client' && (
        <CheckoutModal
          items={cartItems}
          user={currentUser}
          token={authToken}
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
    </div>
  )
}
