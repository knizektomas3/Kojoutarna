import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const size = parseInt(request.nextUrl.searchParams.get('size') || '512')
  const radius = Math.round(size * 0.18)
  const fontSize = Math.round(size * 0.58)

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1c1009',
          borderRadius: radius,
          fontSize,
          lineHeight: 1,
        }}
      >
        🐔
      </div>
    ),
    { width: size, height: size }
  )
}
