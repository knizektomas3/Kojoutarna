import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public', { recursive: true })

function makeSvg(size) {
  const r = Math.round(size * 0.18)
  const s = size

  const path = [
    `M ${s*0.500},${s*0.130}`,
    `C ${s*0.760},${s*0.130} ${s*0.800},${s*0.370} ${s*0.800},${s*0.530}`,
    `C ${s*0.800},${s*0.750} ${s*0.680},${s*0.870} ${s*0.500},${s*0.870}`,
    `C ${s*0.320},${s*0.870} ${s*0.200},${s*0.750} ${s*0.200},${s*0.530}`,
    `C ${s*0.200},${s*0.370} ${s*0.240},${s*0.130} ${s*0.500},${s*0.130}`,
    `Z`
  ].join(' ')

  const hlCx = s * 0.385
  const hlCy = s * 0.295
  const hlRx = s * 0.072
  const hlRy = s * 0.110

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
  <defs>
    <radialGradient id="egg" cx="35%" cy="30%" r="65%" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#FFFFFF"/>
      <stop offset="30%"  stop-color="#FFF6E0"/>
      <stop offset="75%"  stop-color="#EDD080"/>
      <stop offset="100%" stop-color="#C49A30"/>
    </radialGradient>
    <radialGradient id="shine" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="#1c1009" rx="${r}"/>
  <path d="${path}" fill="url(#egg)"/>
  <ellipse cx="${hlCx}" cy="${hlCy}" rx="${hlRx}" ry="${hlRy}" fill="url(#shine)" transform="rotate(-20, ${hlCx}, ${hlCy})"/>
</svg>`
}

for (const size of [192, 512]) {
  await sharp(Buffer.from(makeSvg(size)))
    .png()
    .toFile(`public/icon-${size}.png`)
  console.log(`Generated public/icon-${size}.png`)
}
