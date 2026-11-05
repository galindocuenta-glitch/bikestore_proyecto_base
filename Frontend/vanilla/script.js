'use strict';

/* ═══════════════════════════════════════════
   BS BIKE STORE — Vanilla JS
   State management, rendering, events
═══════════════════════════════════════════ */

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id:1,  name:'Trek Slash 9.9 XTR',              category:'Todo Terreno', price:17400000, stock:3,  rating:4.9, badge:'NUEVO',  img:'https://picsum.photos/seed/bike1/400/300',
    description:'La Trek Slash 9.9 XTR es la enduro bike de carbono definitiva con 150mm de recorrido. Geometría Trail relajada, horquilla Fox 36 Factory y transmisión Shimano XTR.',
    specs:[{l:'Marco',v:'OCLV Mountain 800 Carbono'},{l:'Suspensión',v:'Fox 36 Factory 160mm'},{l:'Transmisión',v:'Shimano XTR M9100 12v'},{l:'Peso',v:'12.5 kg'},{l:'Rin',v:'29"'}],
    gallery:['https://picsum.photos/seed/bike1/800/600','https://picsum.photos/seed/bike1a/800/600','https://picsum.photos/seed/bike1b/800/600']
  },
  { id:2,  name:'Trek Session 9.9',                category:'Todo Terreno', price:19800000, stock:0,  rating:4.8, badge:'PRO',    img:'https://picsum.photos/seed/bike2/400/300',
    description:'La Trek Session 9.9 es la bicicleta de descenso definitiva. OCLV Mountain 200mm de recorrido, Fox 40 Factory y llantas Bontrager Line G5.',
    specs:[{l:'Marco',v:'OCLV Mountain 800 Carbono'},{l:'Suspensión delantera',v:'Fox 40 Factory 203mm'},{l:'Transmisión',v:'Shimano Deore 12v'},{l:'Frenos',v:'Shimano Saint M820'}],
    gallery:['https://picsum.photos/seed/bike2/800/600','https://picsum.photos/seed/bike2a/800/600','https://picsum.photos/seed/bike2b/800/600']
  },
  { id:3,  name:'Specialized S-Works Epic',        category:'Todo Terreno', price:18900000, stock:2,  rating:5.0, badge:'TOP',    img:'https://picsum.photos/seed/bike3/400/300',
    description:'La Specialized S-Works Epic es la bicicleta XC más rápida del mundo. FACT 12m Carbon, ruedas Roval y transmisión SRAM XX Eagle.',
    specs:[{l:'Marco',v:'FACT 12m Carbon'},{l:'Suspensión',v:'RockShox SID 110mm'},{l:'Transmisión',v:'SRAM XX Eagle 12v'},{l:'Peso',v:'9.1 kg'}],
    gallery:['https://picsum.photos/seed/bike3/800/600','https://picsum.photos/seed/bike3a/800/600']
  },
  { id:4,  name:'Santa Cruz V10 CC',               category:'Todo Terreno', price:21500000, stock:4,  rating:4.7, badge:null,     img:'https://picsum.photos/seed/bike4/400/300',
    description:'La Santa Cruz V10 CC es la bicicleta de descenso favorita de los campeones mundiales. 215mm de recorrido, Fox 40 Factory.',
    specs:[{l:'Marco',v:'Carbono CC Monocasco'},{l:'Suspensión delantera',v:'Fox 40 Factory 203mm'},{l:'Transmisión',v:'SRAM X0 DH 7v'},{l:'Frenos',v:'SRAM Code RSC'}],
    gallery:['https://picsum.photos/seed/bike4/800/600','https://picsum.photos/seed/bike4a/800/600']
  },
  { id:5,  name:'Trek Madone SLR 9',               category:'Ruta',        price:24900000, stock:2,  rating:5.0, badge:'ÉLITE',  img:'https://picsum.photos/seed/bike5/400/300',
    description:'La Trek Madone SLR 9 es la bicicleta aerodinámica de competencia más avanzada de Trek. OCLV 800, Dura-Ace Di2, Aeolus RSL 65X.',
    specs:[{l:'Marco',v:'OCLV 800 Carbono IsoFlow'},{l:'Transmisión',v:'Shimano Dura-Ace Di2 12v'},{l:'Ruedas',v:'Bontrager Aeolus RSL 65X'},{l:'Peso',v:'7.2 kg'}],
    gallery:['https://picsum.photos/seed/bike5/800/600','https://picsum.photos/seed/bike5a/800/600']
  },
  { id:6,  name:'Specialized S-Works Tarmac SL8',  category:'Ruta',        price:31500000, stock:0,  rating:4.9, badge:'PRO',    img:'https://picsum.photos/seed/bike6/400/300',
    description:'La Specialized S-Works Tarmac SL8 redefine la bicicleta de ruta perfecta. FACT 12r ultraligero, Roval Rapide CLX II, SRAM Red eTap AXS.',
    specs:[{l:'Marco',v:'FACT 12r Carbon'},{l:'Transmisión',v:'SRAM Red eTap AXS 12v'},{l:'Ruedas',v:'Roval Rapide CLX II'},{l:'Peso',v:'6.8 kg'}],
    gallery:['https://picsum.photos/seed/bike6/800/600','https://picsum.photos/seed/bike6a/800/600']
  },
  { id:7,  name:'Pinarello Dogma X',               category:'Ruta',        price:28900000, stock:1,  rating:4.8, badge:null,     img:'https://picsum.photos/seed/bike7/400/300',
    description:'La Pinarello Dogma X combina aerodinámica y confort. Marco de carbono Torayca T1100 3K, SRAM Red AXS, ruedas Zipp 454 NSW.',
    specs:[{l:'Marco',v:'Torayca T1100 3K Carbon'},{l:'Transmisión',v:'SRAM Red AXS 12v'},{l:'Ruedas',v:'Zipp 454 NSW'},{l:'Peso',v:'7.0 kg'}],
    gallery:['https://picsum.photos/seed/bike7/800/600','https://picsum.photos/seed/bike7a/800/600']
  },
  { id:8,  name:'Canyon Aeroad CFR',               category:'Ruta',        price:22400000, stock:3,  rating:4.7, badge:'OFERTA', img:'https://picsum.photos/seed/bike8/400/300',
    description:'La Canyon Aeroad CFR es la bicicleta aerodinámica definitiva. Marco de carbono CFR integrado, Shimano Dura-Ace Di2, ruedas Zipp 808.',
    specs:[{l:'Marco',v:'VCLS 2.0 CFR Carbon'},{l:'Transmisión',v:'Shimano Dura-Ace Di2 12v'},{l:'Ruedas',v:'Zipp 808 NSW'},{l:'Peso',v:'6.9 kg'}],
    gallery:['https://picsum.photos/seed/bike8/800/600','https://picsum.photos/seed/bike8a/800/600']
  },
  { id:9,  name:'Specialized Turbo Levo SL',       category:'Eléctrica',   price:19900000, stock:2,  rating:4.8, badge:'ECO',    img:'https://picsum.photos/seed/bike9/400/300',
    description:'La Specialized Turbo Levo SL redefine el e-MTB de enduro. Motor 2.2 de 90Nm, batería 700Wh, SRAM GX Eagle.',
    specs:[{l:'Motor',v:'Specialized 2.2 — 90Nm'},{l:'Batería',v:'700Wh integrada'},{l:'Autonomía',v:'Hasta 130 km'},{l:'Transmisión',v:'SRAM GX Eagle 12v'}],
    gallery:['https://picsum.photos/seed/bike9/800/600','https://picsum.photos/seed/bike9a/800/600']
  },
  { id:10, name:'Trek Rail 9.9 XT',                category:'Eléctrica',   price:16800000, stock:1,  rating:4.6, badge:null,     img:'https://picsum.photos/seed/bike10/400/300',
    description:'La Trek Rail 9.9 XT e-MTB trail ligera y natural. Motor TQ-HPR50 50Nm, batería 360Wh, RockShox Lyrik, Shimano XT.',
    specs:[{l:'Motor',v:'TQ-HPR50 — 50Nm'},{l:'Batería',v:'360Wh'},{l:'Autonomía',v:'Hasta 95 km'},{l:'Horquilla',v:'RockShox Lyrik 140mm'}],
    gallery:['https://picsum.photos/seed/bike10/800/600','https://picsum.photos/seed/bike10a/800/600']
  },
  { id:11, name:'Giant Trance X Advanced E+',      category:'Eléctrica',   price:14500000, stock:3,  rating:4.5, badge:null,     img:'https://picsum.photos/seed/bike11/400/300',
    description:'La Giant Trance X Advanced E+ con motor SyncDrive Pro2 de 85Nm, batería EnergyPak 625Wh y 130mm de recorrido.',
    specs:[{l:'Motor',v:'SyncDrive Pro2 — 85Nm'},{l:'Batería',v:'625Wh EnergyPak'},{l:'Autonomía',v:'Hasta 110 km'},{l:'Suspensión',v:'Doble 130mm'}],
    gallery:['https://picsum.photos/seed/bike11/800/600','https://picsum.photos/seed/bike11a/800/600']
  },
  { id:12, name:'Cannondale Moterra Neo',           category:'Eléctrica',   price:15900000, stock:2,  rating:4.7, badge:'NUEVO',  img:'https://picsum.photos/seed/bike12/400/300',
    description:'La Cannondale Moterra Neo con motor Bosch Performance CX 85Nm, batería 750Wh, marco de aluminio SmartForm C1.',
    specs:[{l:'Motor',v:'Bosch Performance CX — 85Nm'},{l:'Batería',v:'750Wh PowerTube'},{l:'Autonomía',v:'Hasta 140 km'},{l:'Marco',v:'SmartForm C1 Aluminio'}],
    gallery:['https://picsum.photos/seed/bike12/800/600','https://picsum.photos/seed/bike12a/800/600']
  },
  { id:13, name:'Trek Precaliber 20',               category:'Infantil',    price:1890000,  stock:5,  rating:4.8, badge:null,     img:'https://picsum.photos/seed/bike13/400/300',
    description:'La Trek Precaliber 20 es la bicicleta perfecta para niños que quieren rodar como los grandes. Marco Alpha aluminio, 20" y 21 velocidades.',
    specs:[{l:'Marco',v:'Alpha Aluminio'},{l:'Frenos',v:'V-Brake'},{l:'Rin',v:'20"'},{l:'Velocidades',v:'21v'},{l:'Edad recomendada',v:'6–10 años'}],
    gallery:['https://picsum.photos/seed/bike13/800/600','https://picsum.photos/seed/bike13a/800/600']
  },
  { id:14, name:'Specialized Riprock 24',           category:'Infantil',    price:2100000,  stock:4,  rating:4.7, badge:null,     img:'https://picsum.photos/seed/bike14/400/300',
    description:'La Specialized Riprock 24 tiene geometría relajada, llantas gruesas y geometría fácil de manejar para niños entre 8 y 13 años.',
    specs:[{l:'Marco',v:'A1 Premium Aluminio'},{l:'Frenos',v:'Shimano Hidráulico'},{l:'Rin',v:'24"'},{l:'Transmisión',v:'Shimano 8v'}],
    gallery:['https://picsum.photos/seed/bike14/800/600','https://picsum.photos/seed/bike14a/800/600']
  },
  { id:15, name:'Giant ARX 24',                    category:'Infantil',    price:1650000,  stock:6,  rating:4.6, badge:'OFERTA', img:'https://picsum.photos/seed/bike15/400/300',
    description:'La Giant ARX 24 es una bicicleta de carretera para niños con marco ALUXX, SRAM 8v y frenos de disco mecánico.',
    specs:[{l:'Marco',v:'ALUXX Aluminio'},{l:'Frenos',v:'Tektro Disco Mecánico'},{l:'Rin',v:'24"'},{l:'Transmisión',v:'SRAM 8v'}],
    gallery:['https://picsum.photos/seed/bike15/800/600','https://picsum.photos/seed/bike15a/800/600']
  },
  { id:16, name:'Canyon Grand Canyon:ON 29',       category:'Infantil',    price:1990000,  stock:3,  rating:4.5, badge:null,     img:'https://picsum.photos/seed/bike16/400/300',
    description:'La Canyon Grand Canyon:ON 29 para niños mayores con motor Fazua y 29 pulgadas. Ideal para iniciarse en el mundo e-MTB.',
    specs:[{l:'Marco',v:'Aluminio 6061'},{l:'Motor',v:'Fazua Ride 50'},{l:'Batería',v:'252Wh'},{l:'Rin',v:'29"'}],
    gallery:['https://picsum.photos/seed/bike16/800/600','https://picsum.photos/seed/bike16a/800/600']
  },
];

const REVIEWS_DATA = [
  { name:'Carlos Andrés Ospina',   date:'Agosto 2026',      rating:5, bike:'Trek Slash 9.9 XTR',       comment:'Increíble bicicleta. La compré para el cerro El Ávila y superó todas mis expectativas. La suspensión absorbe todo y la transmisión XTR es perfecta. El equipo de BS me asesoró muy bien desde el principio.' },
  { name:'Valentina Ríos Herrera', date:'Julio 2026',       rating:5, bike:'S-Works Tarmac SL8',       comment:'La Tarmac SL8 es una obra de arte. Liviana, rígida y aerodinámica. La recomiendo 100% para ciclovía y entrenamientos en carretera. El servicio posventa de BS es excelente.' },
  { name:'Sebastián Gómez Jaramillo', date:'Septiembre 2026', rating:5, bike:'Specialized Turbo Levo', comment:'Me cambió la vida. Puedo subir el Alto de Patios sin morir en el intento. La e-MTB es perfecta para quienes queremos disfrutar sin sufrir. ¡Gracias BS Bike Store!' },
  { name:'Marcela Torres Agudelo', date:'Agosto 2026',      rating:4, bike:'Trek Precaliber 20',       comment:'Compré la Precaliber para mi hija y le encantó. Llegó bien embalada y el ensamble fue sencillo. La calidad es superior a otras marcas que probé.' },
  { name:'Jhon Alexander Peña',    date:'Julio 2026',       rating:5, bike:'Santa Cruz V10 CC',        comment:'Para los que hacemos descenso en La Cuchilla, esta V10 es la bestia. El soporte de BS fue impecable, me explicaron cada componente antes de comprar. Sin duda la mejor inversión.' },
  { name:'Diana Milena Castillo',  date:'Septiembre 2026',  rating:4, bike:'Trek Rail 9.9 XT',         comment:'La uso para ir al trabajo todos los días en Bogotá. Con la batería llegó sin problema desde Suba hasta Chapinero. Muy satisfecha con la compra y el equipo de BS.' },
];

const COLOMBIA_DEPTS = {
  'Antioquia':       ['Medellín','Bello','Itagüí','Envigado','Rionegro','Sabaneta','La Ceja','Apartadó','Turbo','Caucasia'],
  'Bogotá D.C.':     ['Bogotá D.C.'],
  'Valle del Cauca': ['Cali','Buenaventura','Palmira','Tuluá','Buga','Cartago','Yumbo','Jamundí'],
  'Cundinamarca':    ['Soacha','Fusagasugá','Facatativá','Zipaquirá','Chía','Mosquera','Madrid','Cajicá','Girardot'],
  'Atlántico':       ['Barranquilla','Soledad','Malambo','Baranoa','Sabanalarga','Galapa'],
  'Santander':       ['Bucaramanga','Floridablanca','Girón','Piedecuesta','Barrancabermeja','San Gil','Socorro'],
  'Bolívar':         ['Cartagena','Magangué','Mompox','El Carmen de Bolívar','Turbaco'],
  'Nariño':          ['Pasto','Tumaco','Ipiales','Túquerres','La Unión'],
  'Córdoba':         ['Montería','Cereté','Lorica','Sahagún','Tierralta','Montelíbano'],
  'Meta':            ['Villavicencio','Acacías','Granada','Puerto López','Restrepo','San Martín'],
  'Risaralda':       ['Pereira','Dosquebradas','Santa Rosa de Cabal','La Virginia','Marsella'],
  'Caldas':          ['Manizales','La Dorada','Chinchiná','Riosucio','Salamina'],
  'Tolima':          ['Ibagué','Espinal','Melgar','Honda','Girardot','Mariquita'],
  'Huila':           ['Neiva','Pitalito','Garzón','La Plata','Campoalegre'],
};

const FAKE_ORDERS = [
  { id:'BS-001', client:'Carlos Ospina',       product:'Trek Slash 9.9 XTR',       total:'$17.400.000', status:'Enviado',     date:'2026-09-18' },
  { id:'BS-002', client:'Valentina Ríos',      product:'S-Works Tarmac SL8',       total:'$31.500.000', status:'Entregado',   date:'2026-09-16' },
  { id:'BS-003', client:'Sebastián Gómez',     product:'Specialized Turbo Levo SL',total:'$19.900.000', status:'Procesando',  date:'2026-09-20' },
  { id:'BS-004', client:'Marcela Torres',      product:'Trek Precaliber 20',        total:'$1.890.000',  status:'Pendiente',   date:'2026-09-19' },
  { id:'BS-005', client:'Jhon Peña',           product:'Santa Cruz V10 CC',        total:'$21.500.000', status:'Entregado',   date:'2026-09-10' },
  { id:'BS-006', client:'Diana Castillo',      product:'Trek Rail 9.9 XT',         total:'$16.800.000', status:'Enviado',     date:'2026-09-17' },
  { id:'BS-007', client:'Andrés Muñoz',        product:'Canyon Aeroad CFR',        total:'$22.400.000', status:'Procesando',  date:'2026-09-20' },
  { id:'BS-008', client:'Laura Sánchez',       product:'Giant ARX 24',             total:'$1.650.000',  status:'Entregado',   date:'2026-09-14' },
];

const FAKE_PAYMENTS = [
  { id:'PAY-001', client:'Carlos Ospina',   amount:'$17.400.000', method:'Tarjeta Crédito', status:'Aprobado' },
  { id:'PAY-002', client:'Valentina Ríos',  amount:'$31.500.000', method:'PSE',             status:'Aprobado' },
  { id:'PAY-003', client:'Sebastián Gómez', amount:'$19.900.000', method:'Tarjeta Crédito', status:'Pendiente' },
  { id:'PAY-004', client:'Marcela Torres',  amount:'$1.890.000',  method:'Efecty',          status:'Pendiente' },
  { id:'PAY-005', client:'Jhon Peña',       amount:'$21.500.000', method:'PSE',             status:'Aprobado' },
  { id:'PAY-006', client:'Andrés Muñoz',    amount:'$22.400.000', method:'Tarjeta Débito',  status:'Rechazado' },
];

const TOP_CLIENTS = [
  { name:'Valentina Ríos',      total:'$31.500.000', pct:100 },
  { name:'Andrés Muñoz',        total:'$22.400.000', pct:71 },
  { name:'Jhon Peña',           total:'$21.500.000', pct:68 },
  { name:'Sebastián Gómez',     total:'$19.900.000', pct:63 },
  { name:'Carlos Ospina',       total:'$17.400.000', pct:55 },
  { name:'Diana Castillo',      total:'$16.800.000', pct:53 },
  { name:'Laura Sánchez',       total:'$8.540.000',  pct:27 },
];

// ─── STATE ────────────────────────────────────────────────────────────────────

const state = {
  cart:          [],   // { id, name, price, img, qty }
  wishlist:      [],   // product ids
  currentUser:   null, // { name, email, role }
  reviews:       [...REVIEWS_DATA],
  activeCategory:'Todas',
  priceMin:      null,
  priceMax:      null,
  sortOrder:     'default',
  selectedRating: 5,
  checkoutStep:  1,
  activeProductId: null,
  activeGalleryIdx: 0,
};

// ─── UTILITY ──────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function formatCOP(n) {
  return '$' + n.toLocaleString('es-CO');
}

function starsHTML(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '☆';
  while (s.length < 5) s += '☆';
  return s;
}

let toastTimer = null;
function showToast(msg, type = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 2800);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── DARK MODE ────────────────────────────────────────────────────────────────

(function initDark() {
  const saved = localStorage.getItem('bs-dark');
  if (saved === '1' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    syncDarkIcons(true);
  }
})();

function toggleDark() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('bs-dark', isDark ? '1' : '0');
  syncDarkIcons(isDark);
}

function syncDarkIcons(isDark) {
  $('icon-moon').style.display = isDark ? 'none' : '';
  $('icon-sun').style.display  = isDark ? '' : 'none';
}

// ─── MOBILE MENU ──────────────────────────────────────────────────────────────

function toggleMobileMenu() {
  $('mobile-menu').classList.toggle('open');
}

// ─── OVERLAY / CLOSE ALL ─────────────────────────────────────────────────────

function openOverlay() { $('overlay').classList.add('open'); }
function closeOverlay() { $('overlay').classList.remove('open'); }

function closeAll() {
  closeAuth();
  closeCart();
  closeWishlist();
  closeProductModal();
  closeCheckout();
  closeOverlay();
}

// ─── CART ─────────────────────────────────────────────────────────────────────

function addToCart(productId, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || product.stock === 0) return;

  const existing = state.cart.find(i => i.id === productId);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, product.stock);
  } else {
    state.cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty });
  }

  updateCartBadge();
  renderCartBody();
  showToast(product.name + ' añadido al carrito', 'success');
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  updateCartBadge();
  renderCartBody();
}

function updateQty(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;
  const product = PRODUCTS.find(p => p.id === productId);
  item.qty = Math.max(1, Math.min(item.qty + delta, product ? product.stock : 99));
  if (item.qty === 0) removeFromCart(productId);
  else { updateCartBadge(); renderCartBody(); }
}

function clearCart() {
  state.cart = [];
  updateCartBadge();
  renderCartBody();
}

function cartTotal() {
  return state.cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function updateCartBadge() {
  const total = state.cart.reduce((s, i) => s + i.qty, 0);
  $('cart-badge').textContent = total;
}

function renderCartBody() {
  const body = $('cart-body');
  const footer = $('cart-footer');

  if (state.cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>Tu carrito está vacío</p>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  body.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" loading="lazy" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatCOP(item.price)}</div>
        <div class="qty-row">
          <button class="qty-btn" onclick="updateQty(${item.id},-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${item.id},1)">+</button>
        </div>
      </div>
      <button class="btn-remove" onclick="removeFromCart(${item.id})" title="Eliminar">✕</button>
    </div>
  `).join('');

  $('cart-total-val').textContent = formatCOP(cartTotal());
  footer.style.display = 'flex';
}

function openCart() {
  closeWishlist();
  $('cart-drawer').classList.add('open');
  openOverlay();
  renderCartBody();
}

function closeCart() {
  $('cart-drawer').classList.remove('open');
}

// ─── WISHLIST ─────────────────────────────────────────────────────────────────

function toggleWishlist(productId) {
  const idx = state.wishlist.indexOf(productId);
  if (idx === -1) {
    state.wishlist.push(productId);
    showToast('Añadido a favoritos', 'success');
  } else {
    state.wishlist.splice(idx, 1);
    showToast('Eliminado de favoritos');
  }
  $('wishlist-badge').textContent = state.wishlist.length;
  // Update heart button in grid if visible
  const btn = document.querySelector(`.btn-wishlist[data-id="${productId}"]`);
  if (btn) btn.classList.toggle('active', state.wishlist.includes(productId));
  renderWishlistBody();
}

function renderWishlistBody() {
  const body = $('wishlist-body');
  const items = PRODUCTS.filter(p => state.wishlist.includes(p.id));
  if (items.length === 0) {
    body.innerHTML = '<div class="cart-empty"><p>No tienes bicicletas guardadas todavía.</p></div>';
    return;
  }
  body.innerHTML = items.map(p => `
    <div class="cart-item">
      <img src="${p.img}" alt="${p.name}" loading="lazy" />
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">${formatCOP(p.price)}</div>
        <button class="btn-accent btn-sm" style="margin-top:0.35rem" onclick="addToCart(${p.id});showToast('Añadido al carrito','success')">Agregar al carrito</button>
      </div>
      <button class="btn-remove" onclick="toggleWishlist(${p.id})" title="Quitar">✕</button>
    </div>
  `).join('');
}

function openWishlist() {
  closeCart();
  $('wishlist-drawer').classList.add('open');
  openOverlay();
  renderWishlistBody();
}

function closeWishlist() {
  $('wishlist-drawer').classList.remove('open');
}

// ─── PRODUCTS RENDERING ───────────────────────────────────────────────────────

function getFilteredProducts() {
  let products = [...PRODUCTS];

  if (state.activeCategory !== 'Todas') {
    products = products.filter(p => p.category === state.activeCategory);
  }

  if (state.priceMin !== null) {
    products = products.filter(p => p.price >= state.priceMin);
  }
  if (state.priceMax !== null) {
    products = products.filter(p => p.price <= state.priceMax);
  }

  if (state.sortOrder === 'asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (state.sortOrder === 'desc') {
    products.sort((a, b) => b.price - a.price);
  }

  return products;
}

function renderProducts() {
  const grid = $('products-grid');
  const noResults = $('no-results');
  const products = getFilteredProducts();

  if (products.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';

  grid.innerHTML = products.map(p => {
    const isFav = state.wishlist.includes(p.id);
    const outOfStock = p.stock === 0;
    return `
      <div class="product-card">
        <div class="product-img-wrap">
          <img src="${p.img}" alt="${p.name}" loading="lazy" />
          ${p.badge ? `<span class="product-badge${outOfStock ? ' agotado' : ''}">${outOfStock ? 'AGOTADO' : p.badge}</span>` : outOfStock ? '<span class="product-badge agotado">AGOTADO</span>' : ''}
          <button class="btn-wishlist${isFav ? ' active' : ''}" data-id="${p.id}" onclick="toggleWishlist(${p.id})" title="Guardar en favoritos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
        <div class="product-info">
          <span class="product-cat">${p.category}</span>
          <span class="product-name">${p.name}</span>
          <div class="product-rating">
            <span class="stars">${starsHTML(p.rating)}</span>
            <span class="rating-val">${p.rating.toFixed(1)}</span>
          </div>
          <span class="product-price">${formatCOP(p.price)}</span>
        </div>
        <div class="product-footer">
          <button class="btn-add-cart" onclick="addToCart(${p.id})" ${outOfStock ? 'disabled' : ''}>${outOfStock ? 'Agotado' : 'Agregar al carrito'}</button>
          <button class="btn-detail" onclick="openProductModal(${p.id})">Ver</button>
        </div>
      </div>
    `;
  }).join('');
}

function filterCategory(btn, cat) {
  state.activeCategory = cat;
  $$('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts();
}

function applyFilters() {
  const minVal = parseFloat($('price-min').value);
  const maxVal = parseFloat($('price-max').value);
  state.priceMin = isNaN(minVal) ? null : minVal;
  state.priceMax = isNaN(maxVal) ? null : maxVal;
  state.sortOrder = $('sort-select').value;
  renderProducts();
  scrollToSection('productos');
}

// ─── PRODUCT DETAIL MODAL ────────────────────────────────────────────────────

function openProductModal(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  state.activeProductId = productId;
  state.activeGalleryIdx = 0;

  const content = $('product-modal-content');
  const gallery = p.gallery && p.gallery.length > 0 ? p.gallery : [p.img];

  content.innerHTML = `
    <div class="product-gallery">
      <div class="product-gallery-main">
        <img id="gallery-main-img" src="${gallery[0]}" alt="${p.name}" />
      </div>
      <div class="product-gallery-thumbs">
        ${gallery.map((url, i) => `
          <div class="thumb${i === 0 ? ' active' : ''}" onclick="setGalleryImg(${i},${JSON.stringify(gallery).replace(/"/g,'&quot;')})">
            <img src="${url}" alt="Vista ${i+1}" loading="lazy" />
          </div>
        `).join('')}
      </div>
    </div>
    <div class="product-detail-info">
      <span class="product-detail-cat">${p.category}</span>
      <h2 class="product-detail-name">${p.name}</h2>
      <div class="product-rating">
        <span class="stars">${starsHTML(p.rating)}</span>
        <span class="rating-val">${p.rating.toFixed(1)}</span>
      </div>
      <span class="product-detail-price">${formatCOP(p.price)}</span>
      <div class="detail-tabs">
        <button class="detail-tab active" onclick="switchDetailTab('descripcion',this)">Descripción</button>
        <button class="detail-tab" onclick="switchDetailTab('specs',this)">Especificaciones</button>
      </div>
      <div class="detail-panel active" id="panel-descripcion">
        <p style="color:var(--text-muted);font-size:0.9375rem;line-height:1.65">${p.description || 'Sin descripción disponible.'}</p>
        ${p.stock > 0 ? `<p style="margin-top:0.75rem;font-size:0.875rem;color:#10B981;font-weight:600">● ${p.stock} unidades disponibles</p>` : '<p style="margin-top:0.75rem;font-size:0.875rem;color:#DC2626;font-weight:600">● Agotado</p>'}
      </div>
      <div class="detail-panel" id="panel-specs">
        <table class="specs-table">
          <tbody>
            ${(p.specs || []).map(s => `<tr><td>${s.l}</td><td>${s.v}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <button class="btn-accent w-full" style="margin-top:1rem" onclick="addToCart(${p.id});closeProductModal()" ${p.stock===0?'disabled':''}>
        ${p.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
      </button>
    </div>
  `;

  $('product-modal').classList.add('open');
  openOverlay();
}

function setGalleryImg(idx, galleryArr) {
  state.activeGalleryIdx = idx;
  $('gallery-main-img').src = galleryArr[idx];
  $$('.thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
}

function switchDetailTab(tab, btn) {
  $$('.detail-tab').forEach(t => t.classList.remove('active'));
  $$('.detail-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  $('panel-' + tab).classList.add('active');
}

function closeProductModal() {
  $('product-modal').classList.remove('open');
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

function openAuth() {
  $('auth-modal').classList.add('open');
  openOverlay();
}

function closeAuth() {
  $('auth-modal').classList.remove('open');
}

function switchAuthTab(tab) {
  $('login-form').style.display   = tab === 'login' ? '' : 'none';
  $('register-form').style.display = tab === 'register' ? '' : 'none';
  $('tab-login').classList.toggle('active', tab === 'login');
  $('tab-register').classList.toggle('active', tab === 'register');
  $('auth-error').style.display = 'none';
  $('reg-error').style.display  = 'none';
}

function showForgot() {
  $('auth-main').style.display   = 'none';
  $('auth-forgot').style.display = '';
}

function hideForgot() {
  $('auth-main').style.display   = '';
  $('auth-forgot').style.display = 'none';
}

function doLogin(e) {
  e.preventDefault();
  const email = $('l-email').value.trim();
  const pass  = $('l-pass').value;
  const role  = $('l-role').value;

  // Fake validation
  if (!email || pass.length < 3) {
    showAuthError('Credenciales incorrectas. Intenta de nuevo.', 'auth-error');
    return;
  }

  state.currentUser = { name: email.split('@')[0], email, role };
  onLoginSuccess();
}

function doRegister(e) {
  e.preventDefault();
  const name  = $('r-name').value.trim();
  const email = $('r-email').value.trim();
  const pass  = $('r-pass').value;
  const role  = $('r-role').value;

  if (!name || !email || pass.length < 6) {
    showAuthError('Completa todos los campos correctamente.', 'reg-error');
    return;
  }

  state.currentUser = { name, email, role };
  onLoginSuccess();
}

function doForgot(e) {
  e.preventDefault();
  $('forgot-success').style.display = '';
  setTimeout(hideForgot, 2000);
}

function showAuthError(msg, elId) {
  const el = $(elId);
  el.textContent = msg;
  el.style.display = '';
}

function onLoginSuccess() {
  closeAuth();
  closeOverlay();
  updateAuthUI();
  showToast('¡Bienvenido, ' + state.currentUser.name + '!', 'success');
}

function logout() {
  state.currentUser = null;
  updateAuthUI();
  hideAdmin();
  showToast('Sesión cerrada');
}

function updateAuthUI() {
  const loggedIn = !!state.currentUser;
  $('login-btn').style.display  = loggedIn ? 'none' : '';
  $('logout-btn').style.display = loggedIn ? '' : 'none';
  $('admin-btn').style.display  = (loggedIn && state.currentUser.role === 'admin') ? '' : 'none';
}

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

function renderReviews() {
  $('reviews-grid').innerHTML = state.reviews.map(r => `
    <div class="review-card">
      <span class="stars">${starsHTML(r.rating)}</span>
      <p>"${r.comment}"</p>
      <div class="reviewer-name">${r.name}</div>
      <div class="reviewer-meta">${r.bike} · ${r.date}</div>
    </div>
  `).join('');
}

function pickStar(v) {
  state.selectedRating = v;
  $$('.star-pick').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.v) <= v);
  });
}

function submitReview(e) {
  e.preventDefault();
  const name    = $('rv-name').value.trim();
  const bike    = $('rv-bike').value.trim();
  const comment = $('rv-comment').value.trim();

  if (!name || !bike || !comment) return;

  const now = new Date();
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const date = months[now.getMonth()] + ' ' + now.getFullYear();

  state.reviews.unshift({ name, bike, comment, rating: state.selectedRating, date });
  renderReviews();
  e.target.reset();
  state.selectedRating = 5;
  pickStar(5);
  showToast('Reseña publicada. ¡Gracias!', 'success');
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────

function submitContact(e) {
  e.preventDefault();
  showToast('Mensaje enviado. Te contactaremos pronto.', 'success');
  e.target.reset();
}

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────

function openCheckout() {
  closeCart();
  closeOverlay();
  state.checkoutStep = 1;
  renderCheckoutStep(1);
  populateDeptSelect();
  $('checkout-modal').classList.add('open');
  openOverlay();
}

function closeCheckout() {
  $('checkout-modal').classList.remove('open');
}

function nextStep(step) {
  state.checkoutStep = step;
  renderCheckoutStep(step);
}

function renderCheckoutStep(step) {
  for (let i = 1; i <= 4; i++) {
    const el = $('co-step-' + i);
    if (el) el.style.display = i === step ? '' : 'none';
  }
  $$('.step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.toggle('active', n === step);
    s.classList.toggle('done', n < step);
  });

  if (step === 3) renderOrderSummary();
  if (step === 4) {
    $('confirm-order-num').textContent = 'BS-' + (1000 + rand(1, 999));
  }
}

function renderOrderSummary() {
  const sum = $('order-summary');
  const items = state.cart;
  sum.innerHTML = items.map(i => `
    <div class="order-summary-row">
      <span>${i.name} x${i.qty}</span>
      <span>${formatCOP(i.price * i.qty)}</span>
    </div>
  `).join('') + `
    <div class="order-summary-row">
      <span>Envío</span>
      <span>${cartTotal() >= 500000 ? 'Gratis' : formatCOP(25000)}</span>
    </div>
    <div class="order-summary-row">
      <span>Total</span>
      <span>${formatCOP(cartTotal() + (cartTotal() >= 500000 ? 0 : 25000))}</span>
    </div>
  `;
}

function populateDeptSelect() {
  const sel = $('co-dept');
  sel.innerHTML = '<option value="">Selecciona departamento</option>';
  Object.keys(COLOMBIA_DEPTS).forEach(dept => {
    const opt = document.createElement('option');
    opt.value = dept;
    opt.textContent = dept;
    sel.appendChild(opt);
  });
}

function updateCities() {
  const dept = $('co-dept').value;
  const citySel = $('co-city');
  citySel.innerHTML = '<option value="">Selecciona ciudad</option>';
  if (dept && COLOMBIA_DEPTS[dept]) {
    COLOMBIA_DEPTS[dept].forEach(city => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      citySel.appendChild(opt);
    });
  }
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

function showAdmin() {
  $('store-view').style.display  = 'none';
  $('site-header').style.display = 'none';
  $('site-footer').style.display = 'none';
  $('admin-panel').style.display = '';
  renderAdminTables();
}

function hideAdmin() {
  $('admin-panel').style.display = 'none';
  $('store-view').style.display  = '';
  $('site-header').style.display = '';
  $('site-footer').style.display = '';
}

function switchAdminTab(tab, el) {
  $$('.admin-tab').forEach(t => t.classList.remove('active'));
  $$('.admin-nav-item').forEach(n => n.classList.remove('active'));
  $('tab-' + tab).classList.add('active');
  el.classList.add('active');
}

function renderAdminTables() {
  renderOrdersTable();
  renderProductsAdminTable();
  renderInventoryTable();
  renderReviewsAdminTable();
  renderReportsTable();
  renderPaymentsTable();
}

function orderStatusBadge(status) {
  const map = { 'Entregado':'green', 'Enviado':'blue', 'Procesando':'yellow', 'Pendiente':'orange', 'Cancelado':'red' };
  return `<span class="badge-status ${map[status] || 'blue'}">${status}</span>`;
}

function renderOrdersTable() {
  const tbody = $('orders-tbody');
  tbody.innerHTML = FAKE_ORDERS.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.client}</td>
      <td>${o.product}</td>
      <td>${o.total}</td>
      <td>${orderStatusBadge(o.status)}</td>
      <td>${o.date}</td>
      <td>
        <button class="btn-table" onclick="showToast('Viendo pedido ${o.id}')">Ver</button>
        <button class="btn-table" onclick="showToast('Editando ${o.id}')">Editar</button>
      </td>
    </tr>
  `).join('');
}

function renderProductsAdminTable() {
  const tbody = $('products-admin-tbody');
  tbody.innerHTML = PRODUCTS.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${formatCOP(p.price)}</td>
      <td>${p.stock}</td>
      <td>${p.rating} ★</td>
      <td>
        <button class="btn-table" onclick="showToast('Editando ${p.name.replace(/'/g,'')}')">Editar</button>
        <button class="btn-table danger" onclick="showToast('Producto eliminado','error')">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function renderInventoryTable() {
  const tbody = $('inventory-tbody');
  tbody.innerHTML = PRODUCTS.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.stock}</td>
      <td>${p.stock === 0 ? '<span class="badge-status red">Agotado</span>' : p.stock <= 2 ? '<span class="badge-status orange">Bajo stock</span>' : '<span class="badge-status green">Disponible</span>'}</td>
      <td><button class="btn-table" onclick="showToast('Actualizando stock de ${p.name.replace(/'/g,'')}')">Actualizar</button></td>
    </tr>
  `).join('');
}

function renderReviewsAdminTable() {
  const tbody = $('reviews-admin-tbody');
  tbody.innerHTML = state.reviews.map((r, i) => `
    <tr>
      <td>${r.name}</td>
      <td>${r.bike}</td>
      <td>${starsHTML(r.rating)} ${r.rating}</td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.comment}</td>
      <td>${r.date}</td>
      <td><button class="btn-table danger" onclick="deleteReview(${i})">Eliminar</button></td>
    </tr>
  `).join('');
}

function deleteReview(idx) {
  state.reviews.splice(idx, 1);
  renderReviews();
  renderReviewsAdminTable();
  showToast('Reseña eliminada');
}

function renderReportsTable() {
  const list = $('report-list');
  list.innerHTML = TOP_CLIENTS.map(c => `
    <div class="report-item">
      <div class="report-item-header">
        <span>${c.name}</span>
        <span>${c.total}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${c.pct}%"></div>
      </div>
    </div>
  `).join('');
}

function renderPaymentsTable() {
  const tbody = $('payments-tbody');
  const statusMap = { 'Aprobado':'green', 'Pendiente':'yellow', 'Rechazado':'red' };
  tbody.innerHTML = FAKE_PAYMENTS.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.client}</td>
      <td>${p.amount}</td>
      <td>${p.method}</td>
      <td><span class="badge-status ${statusMap[p.status]}">${p.status}</span></td>
      <td>
        ${p.status === 'Pendiente' ? `<button class="btn-table" onclick="showToast('Pago ${p.id} aprobado','success')">Aprobar</button>` : ''}
        <button class="btn-table danger" onclick="showToast('Pago ${p.id} rechazado','error')">Rechazar</button>
      </td>
    </tr>
  `).join('');
}

function openProductForm() {
  showToast('Formulario de nuevo producto (demo)');
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

function init() {
  renderProducts();
  renderReviews();
  updateAuthUI();
}

document.addEventListener('DOMContentLoaded', init);
