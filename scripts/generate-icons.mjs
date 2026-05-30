import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public', { recursive: true })

function makeSvg(size) {
  const s = size
  const bg = Math.round(s * 0.18)

  // Vše škálováno vůči size (původní design pro 512)
  const sc = s / 512

  // Hlava – kruh
  const hx = 248 * sc, hy = 278 * sc, hr = 172 * sc

  // Hřebínek – 3 červené kopečky + základna
  const combPath = `
    M ${160*sc},${148*sc}
    Q ${160*sc},${110*sc} ${190*sc},${108*sc}
    Q ${188*sc},${78*sc}  ${220*sc},${76*sc}
    Q ${218*sc},${50*sc}  ${252*sc},${50*sc}
    Q ${252*sc},${72*sc}  ${282*sc},${76*sc}
    Q ${282*sc},${102*sc} ${306*sc},${108*sc}
    Q ${310*sc},${140*sc} ${310*sc},${148*sc}
    Z
  `

  // Zobák – oranžový trojúhelník vpravo
  const bx1 = 390*sc, by1 = 252*sc
  const bx2 = 440*sc, by2 = 278*sc
  const bx3 = 390*sc, by3 = 304*sc

  // Lalok – červená kapka pod zobákem
  const wx = 372*sc, wy = 348*sc, wrx = 22*sc, wry = 32*sc

  // Oko
  const ex = 196*sc, ey = 252*sc, er = 28*sc

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
  <defs>
    <radialGradient id="head" cx="38%" cy="32%" r="65%">
      <stop offset="0%"  stop-color="#FFFDF5"/>
      <stop offset="60%" stop-color="#FDF3DC"/>
      <stop offset="100%" stop-color="#E8D5A8"/>
    </radialGradient>
    <radialGradient id="eye-grad" cx="35%" cy="35%" r="60%">
      <stop offset="0%"  stop-color="#3a3a3a"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </radialGradient>
  </defs>

  <!-- Pozadí -->
  <rect width="${s}" height="${s}" fill="#1c1009" rx="${bg}"/>

  <!-- Lalok (za hlavou, kreslíme jako první) -->
  <ellipse cx="${wx}" cy="${wy}" rx="${wrx}" ry="${wry}" fill="#DC2626"/>

  <!-- Hřebínek základna -->
  <path d="${combPath}" fill="#DC2626"/>

  <!-- Hlava -->
  <circle cx="${hx}" cy="${hy}" r="${hr}" fill="url(#head)"/>

  <!-- Zobák -->
  <polygon points="${bx1},${by1} ${bx2},${by2} ${bx3},${by3}" fill="#F59E0B"/>
  <line x1="${bx1}" y1="${(by1+by3)/2}" x2="${bx2}" y2="${by2}" stroke="#D97706" stroke-width="${3*sc}"/>

  <!-- Oko -->
  <circle cx="${ex}" cy="${ey}" r="${er}" fill="url(#eye-grad)"/>
  <circle cx="${ex - 9*sc}" cy="${ey - 9*sc}" r="${10*sc}" fill="white" opacity="0.6"/>
  <circle cx="${ex - 7*sc}" cy="${ey - 7*sc}" r="${5*sc}"  fill="white"/>
</svg>`
}

for (const size of [192, 512]) {
  await sharp(Buffer.from(makeSvg(size)))
    .png()
    .toFile(`public/icon-${size}.png`)
  console.log(`Generated public/icon-${size}.png`)
}
