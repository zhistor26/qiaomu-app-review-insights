// Generate 400x400 LPK icon from project SVG assets.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import zlib from 'node:zlib'

const projectRoot = path.resolve(import.meta.dirname, '..')
const iconTarget = path.join(projectRoot, 'icon.png')

const ICON_SOURCES = [
  'public/logo.svg',
  'design/icon-options/option-01.svg',
  'src/app/icon.svg',
]

function pickSource() {
  for (const rel of ICON_SOURCES) {
    const full = path.join(projectRoot, rel)
    if (fs.existsSync(full)) return full
  }
  throw new Error(`No SVG icon found under ${projectRoot}`)
}

function writeWithCairosvg(src) {
  const code = [
    'import cairosvg',
    'from PIL import Image',
    'import io',
    `src = ${JSON.stringify(src)}`,
    `out = ${JSON.stringify(iconTarget)}`,
    "png = cairosvg.svg2png(url=src, output_width=400, output_height=400)",
    "im = Image.open(io.BytesIO(png)).convert('RGB')",
    "im.save(out, format='PNG', optimize=True, compress_level=9)",
  ].join('\n')

  const result = spawnSync('python', ['-c', code], { encoding: 'utf8', stdio: 'pipe' })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  return result.status === 0
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return c >>> 0
})

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)

  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))

  return Buffer.concat([length, typeBuffer, data, crc])
}

function hexToRgb(hex) {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ]
}

function writeFallbackFromSvgColors() {
  const width = 400
  const height = 400
  const pixels = Buffer.alloc(width * height * 3)

  function setPixel(x, y, color) {
    if (x < 0 || x >= width || y < 0 || y >= height) return
    const offset = (y * width + x) * 3
    pixels[offset] = color[0]
    pixels[offset + 1] = color[1]
    pixels[offset + 2] = color[2]
  }

  function fillRoundedRect(left, top, right, bottom, radius, color) {
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) {
        const cx = x < left + radius ? left + radius : x > right - radius ? right - radius : x
        const cy = y < top + radius ? top + radius : y > bottom - radius ? bottom - radius : y
        const dx = x - cx
        const dy = y - cy
        if (dx * dx + dy * dy <= radius * radius) setPixel(x, y, color)
      }
    }
  }

  function drawLine(x1, y1, x2, y2, widthPx, color) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))
    const radius = Math.floor(widthPx / 2)
    for (let i = 0; i <= steps; i += 1) {
      const x = Math.round(x1 + ((x2 - x1) * i) / steps)
      const y = Math.round(y1 + ((y2 - y1) * i) / steps)
      fillRoundedRect(x - radius, y - radius, x + radius, y + radius, radius, color)
    }
  }

  const dark = hexToRgb('#09090b')
  const light = hexToRgb('#f8fafc')
  pixels.fill(dark[0])
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = dark[0]
    pixels[i + 1] = dark[1]
    pixels[i + 2] = dark[2]
  }

  fillRoundedRect(60, 55, 340, 345, 36, light)
  fillRoundedRect(160, 135, 210, 185, 12, dark)
  fillRoundedRect(216, 138, 290, 152, 7, dark)
  drawLine(164, 264, 198, 230, 21, dark)
  drawLine(198, 230, 234, 246, 21, dark)
  drawLine(234, 246, 270, 198, 21, dark)

  const scanlines = Buffer.alloc((width * 3 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    scanlines[y * (width * 3 + 1)] = 0
    pixels.copy(scanlines, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2

  fs.writeFileSync(
    iconTarget,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      pngChunk('IHDR', ihdr),
      pngChunk('IDAT', zlib.deflateSync(scanlines, { level: 9 })),
      pngChunk('IEND', Buffer.alloc(0)),
    ]),
  )
}

const src = pickSource()
if (!writeWithCairosvg(src)) {
  console.warn(`cairosvg unavailable, drawing icon inspired by ${src}`)
  writeFallbackFromSvgColors(src)
}

const size = fs.statSync(iconTarget).size
if (size >= 200 * 1024) {
  throw new Error(`Release icon must be < 200 KiB, got ${size}`)
}

console.log(`icon ${src} -> ${iconTarget} (${size} bytes, PNG 400x400)`)
