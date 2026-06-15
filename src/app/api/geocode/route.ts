import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.GOOGLE_MAPS_API_KEY

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  if (!address) return NextResponse.json({ error: 'Endereço obrigatório' }, { status: 400 })
  if (!API_KEY) return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY não configurada' }, { status: 500 })

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json() as { status: string; results: Array<{ geometry: { location: { lat: number; lng: number } } }> }

  if (data.status !== 'OK' || !data.results[0]) {
    return NextResponse.json({ error: 'Endereço não encontrado', mapsStatus: data.status }, { status: 404 })
  }

  const { lat, lng } = data.results[0].geometry.location
  return NextResponse.json({ lat, lng })
}
