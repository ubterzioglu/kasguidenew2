import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type OpenMeteoPayload = {
  current?: {
    time?: string
    temperature_2m?: number
    apparent_temperature?: number
    weather_code?: number
    wind_speed_10m?: number
  }
  daily?: {
    temperature_2m_min?: number[]
    temperature_2m_max?: number[]
    sunrise?: string[]
    sunset?: string[]
    uv_index_max?: number[]
  }
}

const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=36.2018&longitude=29.6377&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=Europe%2FIstanbul&forecast_days=1'

export async function GET() {
  try {
    const response = await fetch(OPEN_METEO_URL, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    const payload = (await response.json().catch(() => null)) as OpenMeteoPayload | null

    if (!response.ok || !payload?.current) {
      throw new Error('Hero insight verisi alinamadi.')
    }

    const insight = {
      dateLabel: formatDateLabel(payload.current.time),
      temperature: Math.round(payload.current.temperature_2m ?? 24),
      apparentTemperature: Math.round(payload.current.apparent_temperature ?? 25),
      windSpeed: Math.round(payload.current.wind_speed_10m ?? 12),
      minTemperature: Math.round(payload.daily?.temperature_2m_min?.[0] ?? 19),
      maxTemperature: Math.round(payload.daily?.temperature_2m_max?.[0] ?? 27),
      sunrise: formatTimeLabel(payload.daily?.sunrise?.[0]),
      sunset: formatTimeLabel(payload.daily?.sunset?.[0]),
      uvIndex: Math.round(payload.daily?.uv_index_max?.[0] ?? 5),
      condition: weatherCodeToLabel(payload.current.weather_code ?? 0),
      source: 'open-meteo',
    }

    return NextResponse.json(insight, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Hero insight verisi alinamadi.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function weatherCodeToLabel(code: number): string {
  if (code === 0) return 'Acik'
  if (code <= 3) return 'Parcali bulutlu'
  if (code <= 48) return 'Sisli'
  if (code <= 57) return 'Cisenti'
  if (code <= 67) return 'Yagmurlu'
  if (code <= 77) return 'Karli'
  if (code <= 82) return 'Saganak'
  if (code <= 99) return 'Firtinali'
  return 'Guncel'
}

function formatDateLabel(value: string | undefined) {
  const date = value ? new Date(value) : new Date()

  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Istanbul',
  }).format(date)
}

function formatTimeLabel(value: string | undefined) {
  if (!value) {
    return '--:--'
  }

  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value))
}
