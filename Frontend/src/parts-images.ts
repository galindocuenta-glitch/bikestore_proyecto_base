import tireMtb from './assets/parts/tire-mtb.jpg'
import tireUrban from './assets/parts/tire-urban.jpg'
import tireVittoria from './assets/parts/tire-vittoria.jpg'
import tireLugano from './assets/parts/tire-lugano.jpg'
import rimFront from './assets/parts/rim-front.jpg'
import rimMtb from './assets/parts/rim-mtb.jpg'
import rimRoad from './assets/parts/rim-road.jpg'
import rimMavic from './assets/parts/rim-mavic.jpg'
import tubeLoose from './assets/parts/tube-loose.jpg'
import tubePresta from './assets/parts/tube-presta.jpg'
import tubeRepair from './assets/parts/tube-repair.jpg'
import tubeSchwalbe from './assets/parts/tube-schwalbe.jpg'
import tubelessSlime from './assets/parts/tubeless-slime.jpg'
import tubelessInnovations from './assets/parts/tubeless-innovations.jpg'
import tubelessRefill from './assets/parts/tubeless-refill.jpg'
import tubelessCo2 from './assets/parts/tubeless-co2.jpg'

// Photographs from Wikimedia Commons. Keep the original file page and author with each image for attribution.
const photo = (img: string, file: string, author: string, license: string) => ({
  img,
  credit: `${author} · ${license}`,
  source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file).replace(/%20/g, '_')}`,
})

export const WHEEL_PHOTOS = [
  [
    photo(tireMtb, 'Mountain bike tyres from maxxis schwalbe and wtb.jpg', 'Alextredz', 'CC BY-SA 4.0'),
    photo(tireUrban, 'Folded tyre 26 inch.JPG', 'Sylenius', 'CC BY-SA 3.0'),
    photo(tireVittoria, 'Vittoria corsa folding.jpg', 'Glory Cycles', 'CC BY 2.0'),
    photo(tireLugano, 'Schwalbe Lugano 700×25.jpg', 'Petar Milošević', 'CC BY-SA 4.0'),
  ],
  [
    photo(rimFront, 'Bicycle front wheel (1).jpg', 'Cjp24', 'CC BY-SA 4.0'),
    photo(rimMtb, 'A bicycle wheel.jpg', 'Moebiusuibeom-en', 'CC BY-SA 4.0'),
    photo(rimRoad, 'Bicycle wheel.jpg', 'Dhodges', 'CC BY-SA 3.0'),
    photo(rimMavic, 'Mavic Cosmic Pro Carbon SL C (25813414005).jpg', 'Glory Cycles', 'CC BY 2.0'),
  ],
  [
    photo(tubeLoose, 'Fahrradschlaeuche.jpg', 'Baumfreund-FFM', 'Dominio público'),
    photo(tubePresta, 'Changing an inner tube - The new tube.jpg', 'Fanny Schertzer', 'CC BY-SA 3.0'),
    photo(tubeRepair, 'Changing an inner tube - Material.jpg', 'Fanny Schertzer', 'CC BY-SA 3.0'),
    photo(tubeSchwalbe, 'Schwalbe Schläuche.jpg', 'Simon Bohnsack', 'CC BY-SA 4.0'),
  ],
  [
    photo(tubelessSlime, 'Tubeless tire plug kit from Slime.jpg', 'Richard Masoner / Cyclelicious', 'CC BY-SA 2.0'),
    photo(tubelessInnovations, 'Genuine Innovations Tubeless Tackle Kit.jpg', 'Glory Cycles', 'CC BY 2.0'),
    photo(tubelessRefill, 'Tubeless tire plug kit from Slime - 02.jpg', 'Richard Masoner / Cyclelicious', 'CC BY-SA 2.0'),
    photo(tubelessCo2, 'Kit reparation tubeless.jpg', 'Flouille Salads', 'CC BY 2.0'),
  ],
]
