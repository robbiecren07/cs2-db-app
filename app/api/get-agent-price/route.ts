import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const itemName = searchParams.get('itemName')
  if (!itemName) {
    return NextResponse.json({ error: 'Missing itemName parameter' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(
        itemName
      )}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to retrieve market data' }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching market data', details: error }, { status: 500 })
  }
}
