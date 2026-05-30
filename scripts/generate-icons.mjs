import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public', { recursive: true })

const sizes = [192, 512]

for (const size of sizes) {
  const radius = Math.round(size * 0.18)
  const fontSize = Math.round(size * 0.55)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs>
      <clipPath id="r">
        <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"/>
      </clipPath>
    </defs>
    <rect width="${size}" height="${size}" fill="#1c1009" rx="${radius}" ry="${radius}"/>
    <text
      x="50%" y="54%"
      text-anchor="middle"
      dominant-baseline="central"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${fontSize}"
      font-weight="bold"
      fill="#f59e0b"
    >K</text>
  </svg>`

  await sharp(Buffer.from(svg))
    .png()
    .toFile(`public/icon-${size}.png`)

  console.log(`Generated public/icon-${size}.png`)
}
